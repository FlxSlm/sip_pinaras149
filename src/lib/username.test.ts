import { describe, expect, it } from "vitest";
import { isReservedUsername, usernameSchema } from "@/lib/username";

describe("usernameSchema", () => {
    it("menerima username valid", () => {
        const result = usernameSchema.safeParse("john.doe-1");
        expect(result.success).toBe(true);
        expect(result.data).toBe("john.doe-1");
    });

    it("menormalkan menjadi huruf kecil dan memangkas spasi", () => {
        const result = usernameSchema.safeParse("  JohnDoe  ");
        expect(result.success).toBe(true);
        expect(result.data).toBe("johndoe");
    });

    it("menolak username kurang dari 3 karakter", () => {
        expect(usernameSchema.safeParse("ab").success).toBe(false);
    });

    it("menolak username lebih dari 24 karakter", () => {
        expect(usernameSchema.safeParse("a".repeat(25)).success).toBe(false);
    });

    it("menolak karakter yang tidak diizinkan", () => {
        expect(usernameSchema.safeParse("john doe").success).toBe(false);
        expect(usernameSchema.safeParse("john@doe").success).toBe(false);
    });
});

describe("isReservedUsername", () => {
    it("mengenali username cadangan", () => {
        expect(isReservedUsername("admin")).toBe(true);
        expect(isReservedUsername("warga")).toBe(true);
        expect(isReservedUsername("login")).toBe(true);
    });

    it("menerima username biasa", () => {
        expect(isReservedUsername("johndoe")).toBe(false);
    });
});
