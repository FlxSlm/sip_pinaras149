import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveAnnouncementAttachments } from "@/lib/save-announcement-attachments";
const mocks = vi.hoisted(() => ({ prepare: vi.fn(), consume: vi.fn(), create: vi.fn(), attachments: vi.fn(), users: vi.fn(), notify: vi.fn() }));
vi.mock("@/lib/uploads", async (original) => ({ ...await original<typeof import("@/lib/uploads")>(), prepareUploads: mocks.prepare, consumeUploads: mocks.consume }));
vi.mock("@/lib/prisma", () => ({ prisma: { $transaction: async (fn: (tx: unknown) => unknown) => fn({ announcement: { create: mocks.create }, announcementAttachment: { createMany: mocks.attachments }, user: { findMany: mocks.users }, notification: { createMany: mocks.notify } }) } }));
beforeEach(() => { vi.clearAllMocks(); mocks.create.mockResolvedValue({ id: "new-announcement" }); mocks.users.mockResolvedValue([]); mocks.prepare.mockResolvedValue([{ path: "fixture-media", sizeBytes: 9, mimeType: "application/pdf" }]); });
const fields = { title: "Uji pengumuman", content: "Isi", isPinned: false, status: "DRAFT" as const };
function form(uploads: unknown[], kept: string[] = []) { const value = new FormData(); value.set("attachmentUploads", JSON.stringify(uploads)); value.set("retainedAttachmentIds", JSON.stringify(kept)); return value; }
describe("announcement attachment ownership and atomic upload consumption", () => {
    it("rejects foreign attachment IDs before uploads or database writes", async () => {
        await expect(saveAnnouncementAttachments(form([], ["foreign-file"]), "admin", null, fields)).rejects.toThrow("Lampiran bukan milik");
        expect(mocks.prepare).not.toHaveBeenCalled(); expect(mocks.create).not.toHaveBeenCalled();
    });
    it("rejects duplicate upload IDs and more than eight files", async () => {
        const file = { id: "one", kind: "PDF", name: "one.pdf" };
        await expect(saveAnnouncementAttachments(form([file, file]), "admin", null, fields)).rejects.toThrow("Daftar lampiran");
        await expect(saveAnnouncementAttachments(form(Array.from({ length: 9 }, (_, i) => ({ ...file, id: String(i) }))), "admin", null, fields)).rejects.toThrow("Daftar lampiran");
        expect(mocks.create).not.toHaveBeenCalled();
    });
    it("saves multiple verified uploads under one announcement", async () => {
        const uploads = [{ id: "one", kind: "PDF", name: "one.pdf" }, { id: "two", kind: "PDF", name: "two.pdf" }];
        await saveAnnouncementAttachments(form(uploads), "admin", null, fields);
        expect(mocks.prepare.mock.calls.every((call) => call[2] === "admin" && call[3] === "PDF")).toBe(true);
        expect(mocks.consume.mock.calls[0].slice(1)).toEqual([["one", "two"], "admin", "PDF"]);
        expect(mocks.attachments.mock.calls[0][0].data).toHaveLength(2);
        expect(mocks.attachments.mock.calls[0][0].data.every((file: { announcementId: string }) => file.announcementId === "new-announcement")).toBe(true);
    });
});
