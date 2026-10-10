import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, PATCH } from "./route";

const mocks = vi.hoisted(() => ({ session: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), users: vi.fn(), notifications: vi.fn() }));
vi.mock("next-auth", () => ({ getServerSession: mocks.session }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: { announcement: { findMany: mocks.findMany, findUnique: mocks.findUnique, update: mocks.update }, user: { findMany: mocks.users }, notification: { createMany: mocks.notifications } } }));
beforeEach(() => { vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: "admin-test", role: "ADMIN_KELURAHAN" } }); mocks.update.mockResolvedValue({}); mocks.users.mockResolvedValue([]); });

function edit(mediaType = "PDF") {
    const body = new FormData();
    body.set("id", "announcement-test"); body.set("title", "Judul diperbarui"); body.set("content", "Isi pengumuman diperbarui."); body.set("mediaType", mediaType); body.set("status", "PUBLISHED");
    return new Request("http://localhost/api/admin/pengumuman", { method: "PATCH", body });
}
describe("announcement edit and authorization", () => {
    it("existing PDF can be edited without uploading it again, preserving publication date", async () => {
        const date = new Date("2026-10-01T00:00:00Z");
        mocks.findUnique.mockResolvedValue({ mediaType: "PDF", mediaRef: "storage/announcements/fixture.pdf", status: "PUBLISHED", publishedAt: date });
        expect((await PATCH(edit())).status).toBe(200);
        expect(mocks.update.mock.calls[0][0].data).toMatchObject({ title: "Judul diperbarui", mediaRef: "storage/announcements/fixture.pdf", status: "PUBLISHED", publishedAt: date });
    });
    it("changing media type requires a new file", async () => {
        mocks.findUnique.mockResolvedValue({ mediaType: "PDF", mediaRef: "storage/announcements/fixture.pdf" });
        expect((await PATCH(edit("VIDEO"))).status).toBe(400);
        expect(mocks.update).not.toHaveBeenCalled();
    });
    it("text edits remove media reference intentionally", async () => {
        mocks.findUnique.mockResolvedValue({ mediaType: "PDF", mediaRef: "storage/announcements/fixture.pdf", status: "DRAFT" });
        expect((await PATCH(edit("TEXT"))).status).toBe(200);
        expect(mocks.update.mock.calls[0][0].data.mediaRef).toBeNull();
    });
    it("missing announcement returns 404 without writes", async () => {
        mocks.findUnique.mockResolvedValue(null);
        expect((await PATCH(edit())).status).toBe(404);
        expect(mocks.update).not.toHaveBeenCalled();
    });
    it.each([null, { user: { id: "warga-test", role: "WARGA" } }])("guest and warga cannot edit", async (session) => {
        mocks.session.mockResolvedValue(session);
        expect((await PATCH(edit())).status).toBe(403);
        expect(mocks.findUnique).not.toHaveBeenCalled();
    });
    it("admin list emits media presence without the storage key", async () => {
        mocks.findMany.mockResolvedValue([{ id: "test", mediaRef: "storage/announcements/fixture.pdf" }]);
        const response = await GET();
        expect(await response.json()).toEqual([{ id: "test", hasMedia: true }]);
        expect(response.headers.get("cache-control")).toBe("private, no-store");
    });
    it("draft publication notifies recipients, published edits do not notify again", async () => {
        mocks.findUnique.mockResolvedValue({ mediaType: "PDF", mediaRef: "storage/announcements/fixture.pdf", status: "DRAFT", title: "Uji" });
        mocks.users.mockResolvedValue([{ id: "recipient-test" }]);
        expect((await PATCH(edit())).status).toBe(200);
        expect(mocks.notifications.mock.calls[0][0].data[0]).toMatchObject({ recipientId: "recipient-test", type: "ANNOUNCEMENT_PUBLISHED", announcementId: "announcement-test" });
        mocks.notifications.mockClear();
        mocks.findUnique.mockResolvedValue({ mediaType: "PDF", mediaRef: "storage/announcements/fixture.pdf", status: "PUBLISHED", publishedAt: new Date() });
        expect((await PATCH(edit())).status).toBe(200);
        expect(mocks.notifications).not.toHaveBeenCalled();
    });
});
