import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";
const { getServerSession, redirect } = vi.hoisted(() => ({ getServerSession: vi.fn(), redirect: vi.fn((path: string) => { throw new Error(`redirect:${path}`); }) }));
vi.mock("next-auth", () => ({ getServerSession }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/components/login-form", () => ({ default: () => null }));
beforeEach(() => { getServerSession.mockReset(); redirect.mockClear(); });
describe("login server routing", () => {
    it.each([["WARGA", "/warga"], ["ADMIN_KELURAHAN", "/admin"]])("session %s diarahkan ke %s", async (role, home) => {
        getServerSession.mockResolvedValue({ user: { id: "id", role } });
        await expect(LoginPage({ searchParams: Promise.resolve({ callbackUrl: "/login" }) })).rejects.toThrow(`redirect:${home}`);
    });
    it("callback milik warga dipertahankan", async () => {
        getServerSession.mockResolvedValue({ user: { id: "id", role: "WARGA" } });
        await expect(LoginPage({ searchParams: Promise.resolve({ callbackUrl: "/warga/pengaduan" }) })).rejects.toThrow("redirect:/warga/pengaduan");
    });
    it("guest menerima pesan aman tanpa menampilkan raw error", async () => {
        getServerSession.mockResolvedValue(null);
        const view = await LoginPage({ searchParams: Promise.resolve({ error: "private-error-details" }) });
        expect(view.props.initialError).toBeTruthy();
        expect(view.props.initialError).not.toContain("private-error-details");
        expect(redirect).not.toHaveBeenCalled();
    });
    it("session role hilang tetap di login", async () => {
        getServerSession.mockResolvedValue({ user: { id: "id" } });
        await LoginPage({ searchParams: Promise.resolve({}) });
        expect(redirect).not.toHaveBeenCalled();
    });
});
