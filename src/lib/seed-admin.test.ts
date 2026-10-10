import { describe, expect, it, vi } from "vitest";
import { seedAdmin } from "../../prisma/seed-admin";
import { hashPassword, verifyPassword } from "./password";

function store(existing: unknown) {
    const findUnique = vi.fn().mockResolvedValue(existing);
    const create = vi.fn().mockResolvedValue({ id: "new-admin" });
    const update = vi.fn();
    return { user: { findUnique, create, update } };
}
type SeedStore = Parameters<typeof seedAdmin>[0];
describe("seed admin tanpa reset kredensial", () => {
    it.each([undefined, "different-password"])("admin lama dipertahankan walau env %s", async (password) => {
        const originalHash = hashPassword("original-password");
        const db = store({ id: "existing-admin", role: "ADMIN_KELURAHAN", passwordHash: originalHash });
        expect(await seedAdmin(db as unknown as SeedStore, password)).toEqual({ id: "existing-admin", created: false });
        expect(db.user.create).not.toHaveBeenCalled();
        expect(db.user.update).not.toHaveBeenCalled();
    });
    it("membuat admin baru dengan hash scrypt", async () => {
        const db = store(null);
        expect(await seedAdmin(db as unknown as SeedStore, "new-password")).toEqual({ id: "new-admin", created: true });
        const data = db.user.create.mock.calls[0][0].data;
        expect(data.role).toBe("ADMIN_KELURAHAN");
        expect(data.username).toBe("admin.pinaras");
        expect(verifyPassword("new-password", data.passwordHash)).toBe(true);
    });
    it.each([undefined, "short"])("gagal tanpa password awal valid", async (password) => {
        const db = store(null);
        await expect(seedAdmin(db as unknown as SeedStore, password)).rejects.toThrow("ADMIN_SEED_PASSWORD");
        expect(db.user.create).not.toHaveBeenCalled();
    });
    it.each([{ role: "WARGA", passwordHash: "hash" }, { role: "ADMIN_KELURAHAN", passwordHash: null }])("tidak mengubah akun konflik", async (existing) => {
        const db = store(existing);
        await expect(seedAdmin(db as unknown as SeedStore, "new-password")).rejects.toThrow("Tidak ada kredensial");
        expect(db.user.update).not.toHaveBeenCalled();
        expect(db.user.create).not.toHaveBeenCalled();
    });
});
