import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST, DELETE } from "./route";
const mocks = vi.hoisted(() => ({ session: vi.fn(), findUnique: vi.fn(), update: vi.fn(), mkdir: vi.fn(), write: vi.fn(), read: vi.fn(), unlink: vi.fn(), put: vi.fn(), del: vi.fn() }));
vi.mock("next-auth", () => ({ getServerSession: mocks.session }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique: mocks.findUnique, update: mocks.update } } }));
vi.mock("node:fs/promises", () => ({ mkdir: mocks.mkdir, writeFile: mocks.write, readFile: mocks.read, unlink: mocks.unlink }));
vi.mock("@vercel/blob/client", () => ({ handleUpload: vi.fn() }));
vi.mock("@vercel/blob", () => ({ get: vi.fn(), put: mocks.put, del: mocks.del }));
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("BLOB_READ_WRITE_TOKEN", ""); mocks.session.mockResolvedValue({ user: { id: "owner-test", role: "ADMIN_KELURAHAN" } }); mocks.update.mockResolvedValue({}); mocks.unlink.mockResolvedValue(undefined); });
function upload(valid = true) {
    const bytes = valid ? new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0]) : new Uint8Array([1, 2, 3]);
    const body = new FormData(); body.set("photo", new File([bytes], "test.png", { type: "image/png" }));
    return new Request("http://localhost/api/profile/photo", { method: "POST", body });
}
describe("private profile upload", () => {
    it("local upload works without Blob and writes only the authenticated owner", async () => {
        expect((await POST(upload())).status).toBe(200);
        expect(mocks.write).toHaveBeenCalled();
        expect(mocks.update.mock.calls[0][0].where).toEqual({ id: "owner-test" });
        expect(mocks.update.mock.calls[0][0].data.customImage).toMatch(/^storage\/profile\/[\w-]+\.png$/);
        expect(mocks.put).not.toHaveBeenCalled();
    });
    it("configured cloud storage remains private", async () => {
        vi.stubEnv("BLOB_READ_WRITE_TOKEN", "synthetic-token"); mocks.put.mockResolvedValue({ url: "https://synthetic.private.blob.vercel-storage.com/test.png" });
        expect((await POST(upload())).status).toBe(200);
        expect(mocks.put.mock.calls[0][2].access).toBe("private");
        expect(mocks.write).not.toHaveBeenCalled();
    });
    it("invalid signature is rejected before writing", async () => {
        expect((await POST(upload(false))).status).toBe(400);
        expect(mocks.write).not.toHaveBeenCalled();
        expect(mocks.update).not.toHaveBeenCalled();
    });
    it("guest cannot upload", async () => {
        mocks.session.mockResolvedValue(null);
        expect((await POST(upload())).status).toBe(401);
        expect(mocks.write).not.toHaveBeenCalled();
    });
    it("GET resolves photo from authenticated user's record, with no-store", async () => {
        mocks.findUnique.mockResolvedValue({ customImage: "storage/profile/test.png" }); mocks.read.mockResolvedValue(Buffer.from("synthetic"));
        const response = await GET();
        expect(response.status).toBe(200);
        expect(mocks.findUnique.mock.calls[0][0].where).toEqual({ id: "owner-test" });
        expect(response.headers.get("cache-control")).toBe("private, no-store");
    });
    it("DELETE removes only authenticated user's custom image", async () => {
        mocks.findUnique.mockResolvedValue({ customImage: "storage/profile/test.png" });
        expect((await DELETE()).status).toBe(200);
        expect(mocks.unlink.mock.calls[0][0]).toMatch(/[\\/]storage[\\/]profile[\\/]test.png$/);
        expect(mocks.update.mock.calls[0][0]).toEqual({ where: { id: "owner-test" }, data: { customImage: null } });
        expect(mocks.del).not.toHaveBeenCalled();
    });
});
