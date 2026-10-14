import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, PATCH } from "./route";
import { defaultOrganization } from "@/lib/organization";
const mocks = vi.hoisted(() => ({ session: vi.fn(), prepare: vi.fn(), consume: vi.fn(), upsert: vi.fn(), read: vi.fn() }));
vi.mock("next-auth", () => ({ getServerSession: mocks.session }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/organization-store", () => ({ getOrganization: mocks.read }));
vi.mock("@/lib/uploads", async (original) => ({ ...await original<typeof import("@/lib/uploads")>(), prepareUploads: mocks.prepare, consumeUploads: mocks.consume }));
vi.mock("@/lib/prisma", () => ({ prisma: { $transaction: async (fn: (tx: unknown) => unknown) => fn({ siteContent: { upsert: mocks.upsert } }) } }));
beforeEach(() => { vi.clearAllMocks(); mocks.session.mockResolvedValue({ user: { id: "admin", role: "ADMIN_KELURAHAN" } }); mocks.read.mockResolvedValue({ members: defaultOrganization(), publicMembers: [] }); mocks.prepare.mockResolvedValue([]); });
const request = (body: unknown) => new Request("http://localhost/api/admin/cms", { method: "PATCH", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
describe("structure CMS authorization and safe inputs", () => {
    it.each([null, { user: { id: "warga", role: "WARGA" } }])("rejects non-admin readers/writers before querying", async (session) => {
        mocks.session.mockResolvedValue(session);
        expect((await GET()).status).toBe(403); expect((await PATCH(request({}))).status).toBe(403);
        expect(mocks.read).not.toHaveBeenCalled(); expect(mocks.upsert).not.toHaveBeenCalled();
    });
    it("rejects old CMS sections and forged storage paths", async () => {
        expect((await PATCH(request({ section: "hero", value: {} }))).status).toBe(400);
        expect((await PATCH(request({ members: defaultOrganization() }))).status).toBe(400);
        expect(mocks.upsert).not.toHaveBeenCalled();
    });
    it("consumes images with the authenticated owner's ID and STRUCTURE kind", async () => {
        const members = defaultOrganization().map(({ id, name }) => ({ id, name }));
        const body = { members: members.map((member, index) => index ? member : { ...member, imageUploadId: "fixture-upload" }) };
        mocks.prepare.mockResolvedValue([{ path: "private-fixture", mimeType: "image/jpeg", sizeBytes: 10 }]);
        const response = await PATCH(request(body)); expect(response.status).toBe(200);
        expect(mocks.prepare.mock.calls[0].slice(1)).toEqual([["fixture-upload"], "admin", "STRUCTURE"]);
        expect(mocks.consume.mock.calls[0].slice(1)).toEqual([["fixture-upload"], "admin", "STRUCTURE"]);
        expect(mocks.upsert.mock.calls[0][0].where).toEqual({ key: "struktur" });
        expect(JSON.stringify(await response.json())).not.toContain("private-fixture");
    });
});
