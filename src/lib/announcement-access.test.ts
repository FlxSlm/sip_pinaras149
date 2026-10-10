import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as publicMedia } from "@/app/api/pengumuman/[slug]/media/route";
import { GET as adminMedia } from "@/app/api/admin/pengumuman/[id]/media/route";
const mocks = vi.hoisted(() => ({ session: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), serve: vi.fn() }));
vi.mock("next-auth", () => ({ getServerSession: mocks.session }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: { announcement: { findFirst: mocks.findFirst, findUnique: mocks.findUnique } } }));
vi.mock("@/lib/announcement-media", () => ({ serveAnnouncementMedia: mocks.serve }));
beforeEach(() => { vi.clearAllMocks(); mocks.serve.mockResolvedValue(new Response("synthetic", { status: 200 })); });
const request = () => new Request("http://localhost/test");
describe("draft media boundary", () => {
    it("public lookup always requires PUBLISHED and missing/draft media returns 404", async () => {
        mocks.findFirst.mockResolvedValue(null);
        expect((await publicMedia(request(), { params: Promise.resolve({ slug: "draft-test" }) })).status).toBe(404);
        expect(mocks.findFirst.mock.calls[0][0].where).toEqual({ slug: "draft-test", status: "PUBLISHED" });
        expect(mocks.serve).not.toHaveBeenCalled();
    });
    it.each([null, { user: { id: "warga", role: "WARGA" } }])("admin preview refuses guest/warga before querying", async (session) => {
        mocks.session.mockResolvedValue(session);
        expect((await adminMedia(request(), { params: Promise.resolve({ id: "test" }) })).status).toBe(session ? 403 : 401);
        expect(mocks.findUnique).not.toHaveBeenCalled();
    });
    it("admin may preview draft after authorization", async () => {
        mocks.session.mockResolvedValue({ user: { id: "admin", role: "ADMIN_KELURAHAN" } });
        mocks.findUnique.mockResolvedValue({ mediaRef: "storage/announcements/fixture.pdf" });
        expect((await adminMedia(request(), { params: Promise.resolve({ id: "test" }) })).status).toBe(200);
        expect(mocks.serve).toHaveBeenCalled();
    });
});
