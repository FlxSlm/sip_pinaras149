import { describe, expect, it } from "vitest";
import { defaultOrganization, organizationInputSchema, organizationPositions, publicOrganization } from "@/lib/organization";

describe("organization CMS boundaries", () => {
    const members = defaultOrganization().map(({ id, name }) => ({ id, name }));
    it("preserves all reference positions and eight head/deputy pairs", () => {
        expect(organizationPositions).toHaveLength(28);
        expect(organizationPositions.filter((item) => item.id.startsWith("lingkungan-"))).toHaveLength(8);
        expect(organizationPositions.filter((item) => item.id.startsWith("wakil-"))).toHaveLength(8);
        expect(organizationInputSchema.safeParse({ members }).success).toBe(true);
    });
    it("rejects duplicate/replaced positions and old CMS sections", () => {
        expect(organizationInputSchema.safeParse({ members: [...members.slice(1), members[1]] }).success).toBe(false);
        expect(organizationInputSchema.safeParse({ section: "hero", value: {} }).success).toBe(false);
        expect(organizationInputSchema.safeParse({ members: members.map((item) => ({ ...item, photoRef: "private-storage" })) }).success).toBe(false);
    });
    it("does not expose private image references", () => {
        const rows = defaultOrganization(); rows[0].photoRef = "sipp/structure/private-reference.jpg";
        const projected = publicOrganization(rows, "revision");
        expect(projected[0].photoUrl).toBe("/api/struktur/lurah/photo?v=revision");
        expect(JSON.stringify(projected)).not.toContain("private-reference");
    });
    it("does not attribute the reference NIP to a replacement official", () => {
        const rows = defaultOrganization(); rows[0].name = "Pejabat pengganti";
        expect(publicOrganization(rows, "revision")[0].nip).toBe("");
    });
});
