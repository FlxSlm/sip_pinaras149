import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadPrivateFile } from "./upload-client";
const m = vi.hoisted(() => ({ put: vi.fn(), fetch: vi.fn() }));
vi.mock("@vercel/blob/client", () => ({ put: m.put }));
const photo = () => new File([new Uint8Array([255, 216, 255])], "photo.jpg", { type: "image/jpeg" });
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal("fetch", m.fetch); });
afterEach(() => vi.unstubAllGlobals());
describe("private upload client backend selection", () => {
    it("uploads structure photos to the local intent endpoint without calling Blob", async () => {
        m.fetch.mockResolvedValueOnce(Response.json({ id: "receipt", uploadUrl: "/api/uploads/receipt/local" })).mockResolvedValueOnce(Response.json({ id: "receipt" }));
        const file = photo(); expect(await uploadPrivateFile(file, "STRUCTURE")).toBe("receipt");
        expect(m.fetch.mock.calls[1]).toEqual(["/api/uploads/receipt/local", { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: file }]);
        expect(m.put).not.toHaveBeenCalled();
    });
    it("passes a valid server pathname and scoped token to private Blob", async () => {
        m.fetch.mockResolvedValueOnce(Response.json({ id: "receipt", pathname: "sipp/structure/photo.jpg", clientToken: "synthetic-scoped-token" }));
        const file = photo(); expect(await uploadPrivateFile(file, "STRUCTURE")).toBe("receipt");
        expect(m.put).toHaveBeenCalledWith("sipp/structure/photo.jpg", file, expect.objectContaining({ access: "private", token: "synthetic-scoped-token" }));
    });
    it.each([{ id: "receipt" }, { id: "receipt", pathname: "x" }, { id: "receipt", pathname: 12, clientToken: "synthetic" }, { id: "receipt", uploadUrl: "https://example.invalid/upload" }, null])("rejects incomplete/unsafe response without invoking the SDK: %j", async (value) => {
        m.fetch.mockResolvedValueOnce(Response.json(value));
        await expect(uploadPrivateFile(photo(), "STRUCTURE")).rejects.toThrow("Persiapan unggahan belum lengkap");
        expect(m.put).not.toHaveBeenCalled(); expect(m.fetch).toHaveBeenCalledOnce();
    });
    it("keeps SDK details out of user-facing errors", async () => {
        m.fetch.mockResolvedValueOnce(Response.json({ id: "receipt", pathname: "sipp/structure/photo.jpg", clientToken: "synthetic" }));
        m.put.mockRejectedValueOnce(new Error("private SDK details"));
        await expect(uploadPrivateFile(photo(), "STRUCTURE")).rejects.toThrow("Lampiran belum dapat diunggah. Periksa koneksi lalu coba kembali.");
    });
});
