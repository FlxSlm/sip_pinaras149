/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, DELETE } from "./route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { handleUpload } from "@vercel/blob/client";
import { del } from "@vercel/blob";

vi.mock("next-auth");
vi.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));
vi.mock("@vercel/blob/client", () => ({
    handleUpload: vi.fn(),
}));
vi.mock("@vercel/blob", () => ({
    del: vi.fn(),
    get: vi.fn(),
}));

describe("Profile Photo API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.BLOB_READ_WRITE_TOKEN = "fake-token";
    });

    describe("GET /api/profile/photo", () => {
        it("returns 401 if unauthenticated", async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);
            const response = await GET();
            expect(response.status).toBe(401);
        });

        it("returns 404 if user has no custom image in db", async () => {
            vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1", role: "WARGA" } } as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null as any);
            const response = await GET();
            expect(response.status).toBe(404);
        });

        it("returns 404 if blob get returns null", async () => {
            vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1", role: "WARGA" } } as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ customImage: "https://blob/test.jpg" } as any);
            const { get } = await import("@vercel/blob");
            vi.mocked(get).mockResolvedValue(null);

            const response = await GET();
            expect(response.status).toBe(404);
        });

        it("returns 304 if blob get returns 304 Not Modified", async () => {
            vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1", role: "WARGA" } } as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ customImage: "https://blob/test.jpg" } as any);
            const { get } = await import("@vercel/blob");
            vi.mocked(get).mockResolvedValue({ statusCode: 304 } as any);

            const response = await GET();
            expect(response.status).toBe(304);
        });

        it("calls get with private access and streams response on 200", async () => {
            vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1", role: "WARGA" } } as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ customImage: "https://blob/test.jpg" } as any);
            const { get } = await import("@vercel/blob");
            vi.mocked(get).mockResolvedValue({
                statusCode: 200,
                headers: new Headers(),
                stream: "test-stream" as any,
                blob: { contentType: "image/png" } as any,
            });

            const response = await GET();
            expect(get).toHaveBeenCalledWith("https://blob/test.jpg", { access: "private" });
            expect(response.status).toBe(200);
            expect(response.headers.get("Content-Type")).toBe("image/png");
            expect(response.headers.get("Cache-Control")).toBe("private, no-store");
        });
    });

    describe("POST /api/profile/photo", () => {
        it("delegates to handleUpload", async () => {
            vi.mocked(handleUpload).mockResolvedValue({ url: "https://blob/test.jpg" } as any);
            const request = new Request("http://localhost/api/profile/photo", {
                method: "POST",
                body: JSON.stringify({ payload: "test" }),
            });
            const response = await POST(request);
            expect(response.status).toBe(200);
            expect(handleUpload).toHaveBeenCalled();
        });
    });

    describe("DELETE /api/profile/photo", () => {
        it("returns 401 if unauthenticated", async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);
            const response = await DELETE();
            expect(response.status).toBe(401);
        });

        it("deletes blob and clears customImage if customImage exists", async () => {
            vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1", role: "WARGA" } } as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ customImage: "https://blob/test.jpg" } as any);
            
            const response = await DELETE();
            
            expect(del).toHaveBeenCalledWith("https://blob/test.jpg");
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: "user-1" },
                data: { customImage: null },
            });
            expect(response.status).toBe(200);
        });
    });
});
