import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";
const { getToken } = vi.hoisted(() => ({ getToken: vi.fn() }));
vi.mock("next-auth/jwt", () => ({ getToken }));
beforeEach(() => { getToken.mockReset(); });
describe("dashboard authorization", () => {
    it("guest dikirim ke login dan callback/query dipertahankan", async () => {
        getToken.mockResolvedValue(null);
        const response = await proxy(new NextRequest("http://localhost/warga/pengaduan?status=MENUNGGU"));
        const url = new URL(response.headers.get("location")!);
        expect(response.status).toBe(307);
        expect(url.pathname).toBe("/login");
        expect(url.searchParams.get("callbackUrl")).toBe("/warga/pengaduan?status=MENUNGGU");
    });
    it.each([["WARGA", "/warga"], ["ADMIN_KELURAHAN", "/admin"]])("role %s mengakses dashboard sendiri", async (role, path) => {
        getToken.mockResolvedValue({ userId: "id", role });
        expect((await proxy(new NextRequest(`http://localhost${path}`))).headers.get("x-middleware-next")).toBe("1");
    });
    it.each([["WARGA", "/admin", "/warga"], ["ADMIN_KELURAHAN", "/warga", "/admin"]])("role %s ditolak dari %s", async (role, path, expected) => {
        getToken.mockResolvedValue({ userId: "id", role });
        expect(new URL((await proxy(new NextRequest(`http://localhost${path}`))).headers.get("location")!).pathname).toBe(expected);
    });
    it.each([{}, { userId: "id", role: "PETUGAS" }, { role: "WARGA" }])("token tidak lengkap kembali ke login tanpa loop", async (token) => {
        getToken.mockResolvedValue(token);
        const url = new URL((await proxy(new NextRequest("http://localhost/admin"))).headers.get("location")!);
        expect(url.pathname).toBe("/login");
        expect(url.searchParams.get("error")).toBe("SessionRequired");
    });
});
