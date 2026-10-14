import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./[slug]/attachments/[attachmentId]/route";
const mocks = vi.hoisted(() => ({ find: vi.fn(), serve: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { announcementAttachment: { findFirst: mocks.find } } }));
vi.mock("@/lib/announcement-media", () => ({ serveAnnouncementMedia: mocks.serve }));
beforeEach(() => { vi.clearAllMocks(); mocks.serve.mockImplementation(async (reference) => new Response(null, { status: reference ? 200 : 404 })); });
describe("public multiple attachment publication boundary", () => {
    it("requires both the requested slug and PUBLISHED parent", async () => {
        mocks.find.mockResolvedValue(null);
        const response = await GET(new Request("https://example.invalid/file"), { params: Promise.resolve({ slug: "draft", attachmentId: "file" }) });
        expect(response.status).toBe(404);
        expect(mocks.find.mock.calls[0][0].where).toEqual({ id: "file", announcement: { slug: "draft", status: "PUBLISHED" } });
    });
});
