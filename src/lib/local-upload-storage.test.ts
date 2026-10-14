import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { canReadLocalUploads, canUseLocalUploads, isLocalUploadReference, readLocalUpload, writeLocalUpload } from "./local-upload-storage";

let root: string;
beforeEach(async () => {
    root = await mkdtemp(path.join(os.tmpdir(), "sipp-upload-test-"));
    vi.spyOn(process, "cwd").mockReturnValue(root);
    vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("VERCEL", ""); vi.stubEnv("BLOB_READ_WRITE_TOKEN", ""); vi.stubEnv("DATABASE_URL", "postgresql://localhost/sipp_test");
});
afterEach(async () => { vi.restoreAllMocks(); vi.unstubAllEnvs(); if (root && path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(root).startsWith("sipp-upload-test-")) await rm(root, { recursive: true, force: true }); });
const ref = () => `storage/uploads/video/${randomUUID()}.mp4`;
const bytes = new TextEncoder().encode("0000ftyp-synthetic-video");
const stream = (data = bytes) => new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(data); controller.close(); } });
describe("private local development storage", () => {
    it("enables only unconfigured Blob on a loopback development database", () => { expect(canUseLocalUploads()).toBe(true); });
    it.each([["NODE_ENV", "production"], ["VERCEL", "1"], ["BLOB_READ_WRITE_TOKEN", "synthetic"], ["DATABASE_URL", "postgresql://example.neon.tech/neondb"], ["DATABASE_URL", "postgresql://localhost/test?host=example.neon.tech"], ["DATABASE_URL", ""]])("disables local storage for %s", (key, value) => { vi.stubEnv(key, value); expect(canUseLocalUploads()).toBe(false); });
    it.each(["../private.mp4", "storage/uploads/video/../secret.mp4", "storage/uploads/video/name.mp4", "storage/uploads/video/123.pending"])("rejects arbitrary paths %s", async (value) => { expect(isLocalUploadReference(value)).toBe(false); await expect(writeLocalUpload(value, "VIDEO", "video/mp4", bytes.length, stream())).rejects.toThrow(); });
    it("writes validated content privately and never overwrites an existing intent", async () => {
        const target = ref();
        await writeLocalUpload(target, "VIDEO", "video/mp4", bytes.length, stream());
        expect(await readLocalUpload(target)).toMatchObject({ pathname: target, size: bytes.length, contentType: "video/mp4" });
        await expect(writeLocalUpload(target, "VIDEO", "video/mp4", bytes.length, stream())).rejects.toMatchObject({ status: 409 });
        expect((await readLocalUpload(target)).size).toBe(bytes.length);
    });
    it("removes staged invalid or oversized files without publishing them", async () => {
        for (const [content, size, status] of [[new Uint8Array([1, 2, 3]), 3, 400], [bytes, bytes.length - 1, 413], [bytes, bytes.length + 1, 400]] as const) {
            const target = ref();
            await expect(writeLocalUpload(target, "VIDEO", "video/mp4", size, stream(content))).rejects.toMatchObject({ status });
            await expect(readLocalUpload(target)).rejects.toThrow();
        }
    });
    it("rejects a mismatched upload purpose", async () => { await expect(writeLocalUpload(ref(), "PROFILE", "video/mp4", bytes.length, stream())).rejects.toMatchObject({ status: 400 }); });
    it("keeps existing development files readable after Blob is configured, while new local writes stop", async () => {
        const target = ref(); await writeLocalUpload(target, "VIDEO", "video/mp4", bytes.length, stream());
        vi.stubEnv("BLOB_READ_WRITE_TOKEN", "synthetic");
        expect(canReadLocalUploads()).toBe(true); expect(canUseLocalUploads()).toBe(false);
        expect((await readLocalUpload(target)).size).toBe(bytes.length);
        await expect(writeLocalUpload(ref(), "VIDEO", "video/mp4", bytes.length, stream())).rejects.toThrow("local-storage-disabled");
    });
});
