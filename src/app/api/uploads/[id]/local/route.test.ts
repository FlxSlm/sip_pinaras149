import { beforeEach, describe, expect, it, vi } from "vitest";
import { PUT } from "./route";
const m = vi.hoisted(() => ({ enabled: vi.fn(), session: vi.fn(), find: vi.fn(), write: vi.fn() }));
vi.mock("next-auth", () => ({ getServerSession: m.session }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/prisma", () => ({ prisma: { uploadIntent: { findFirst: m.find } } }));
vi.mock("@/lib/local-upload-storage", () => ({ canUseLocalUploads: m.enabled, writeLocalUpload: m.write, LocalUploadError: class extends Error {} }));
beforeEach(() => { vi.clearAllMocks(); m.enabled.mockReturnValue(true); m.session.mockResolvedValue({ user: { id: "owner", role: "ADMIN_KELURAHAN" } }); m.find.mockResolvedValue({ kind: "VIDEO", pathname: "generated", mimeType: "video/mp4", sizeBytes: 16 }); });
const request = (mime = "video/mp4") => new Request("http://localhost/api/uploads/id/local", { method: "PUT", headers: { "Content-Type": mime }, body: new Uint8Array(16) });
const params = { params: Promise.resolve({ id: "id" }) };
describe("authorized local upload endpoint", () => {
    it("cannot be used on hosted/production databases", async () => { m.enabled.mockReturnValue(false); expect((await PUT(request(), params)).status).toBe(404); expect(m.session).not.toHaveBeenCalled(); expect(m.write).not.toHaveBeenCalled(); });
    it("rejects anonymous upload", async () => { m.session.mockResolvedValue(null); expect((await PUT(request(), params)).status).toBe(401); expect(m.find).not.toHaveBeenCalled(); });
    it("checks owner, expiry and consumption before writing", async () => { expect((await PUT(request(), params)).status).toBe(200); expect(m.find.mock.calls[0][0].where).toMatchObject({ id: "id", ownerId: "owner", consumedAt: null, expiresAt: { gt: expect.any(Date) } }); expect(m.write).toHaveBeenCalledOnce(); });
    it("rejects foreign/expired/replayed intent", async () => { m.find.mockResolvedValue(null); expect((await PUT(request(), params)).status).toBe(404); expect(m.write).not.toHaveBeenCalled(); });
    it("rejects warga uploading announcement video", async () => { m.session.mockResolvedValue({ user: { id: "owner", role: "WARGA" } }); expect((await PUT(request(), params)).status).toBe(404); expect(m.write).not.toHaveBeenCalled(); });
    it("rejects a different content type", async () => { expect((await PUT(request("text/plain"), params)).status).toBe(400); expect(m.write).not.toHaveBeenCalled(); });
});
