import { z } from "zod";

// Transcribed from the user's organization-chart reference. No source year supplied.
export const organizationPositions = [
    { id: "lurah", title: "Lurah", name: "MIEKE S. TULUNG S.IP", nip: "19750505 200604 2 007" },
    { id: "fungsional", title: "Kelompok Jabatan Fungsional", name: "", nip: "" },
    { id: "sekretaris", title: "Sekretaris", name: "ADRIE B. MONTOLALU, Amd.Far", nip: "19821005 200604 1 015" },
    { id: "pembantu-sekretaris", title: "Pembantu Sekretaris", name: "", nip: "" },
    { id: "pemerintahan", title: "Kasie Pemerintahan & Trantib", name: "", nip: "" },
    { id: "pembantu-pemerintahan", title: "Pemb. Kasie Pemerintahan & Trantib", name: "", nip: "" },
    { id: "keuangan", title: "Kasie Keuangan", name: "", nip: "" },
    { id: "pembantu-keuangan", title: "Pemb. Kasie Keuangan", name: "", nip: "" },
    { id: "pembangunan", title: "Kasie Pembangunan", name: "", nip: "" },
    { id: "pembantu-pembangunan", title: "Pemb. Kasie Pembangunan", name: "", nip: "" },
    { id: "kesra", title: "Kasie Kesra", name: "", nip: "" },
    { id: "pembantu-kesra", title: "Pemb. Kasie Kesra", name: "", nip: "" },
    ...[
        ["I", "JANTJE A. ERING", "YANI MINONGKA"],
        ["II", "WELIAM TAMUNTUAN", "SUTRISNO M.S HORIMU"],
        ["III", "NIKLAS A. ERING", "JEMMY F.R TOLIU"],
        ["IV", "JOPPY D. LENGKONG", "TOMMY H. UNTU"],
        ["V", "REFLY W. TAMUNTUAN", "ERNIE WELAN"],
        ["VI", "TENNY H. PALEALU", "RUDDY ERING"],
        ["VII", "ALPHONSUS O. ERING", "FORTO G. RATULANGKOW"],
        ["VIII", "DELLY LENGKONG", "BERTJE BORORING"],
    ].flatMap(([number, head, deputy], index) => [
        { id: `lingkungan-${index + 1}`, title: `Kepala Lingk. ${number}`, name: head, nip: "" },
        { id: `wakil-${index + 1}`, title: "Wakil Kepala Lingk.", name: deputy, nip: "" },
    ]),
];

const ids = new Set(organizationPositions.map((position) => position.id));
export const organizationInputSchema = z.object({ members: z.array(z.object({
    id: z.string().refine((id) => ids.has(id)),
    name: z.string().trim().max(160),
    imageUploadId: z.string().min(1).max(100).optional(),
    removeImage: z.boolean().optional(),
}).strict()).length(organizationPositions.length).refine((members) => new Set(members.map((member) => member.id)).size === ids.size, "Setiap jabatan wajib muncul tepat sekali.") }).strict();

export type StoredMember = { id: string; name: string; photoRef: string | null };
export type OrganizationMember = { id: string; title: string; name: string; nip: string; photoUrl: string | null };
export function defaultOrganization(): StoredMember[] { return organizationPositions.map((position) => ({ id: position.id, name: position.name, photoRef: null })); }
export function publicOrganization(members: StoredMember[], revision: string): OrganizationMember[] {
    return organizationPositions.map((position) => {
        const member = members.find((item) => item.id === position.id);
        const name = member?.name ?? position.name;
        // The reference NIP belongs to the reference person, not a replacement.
        return { ...position, name, nip: name === position.name ? position.nip : "", photoUrl: member?.photoRef ? `/api/struktur/${position.id}/photo?v=${encodeURIComponent(revision)}` : null };
    });
}
