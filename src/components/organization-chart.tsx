import Image from "next/image";
import type { OrganizationMember } from "@/lib/organization";

export function OrganizationChart({ members }: { members: OrganizationMember[] }) {
    function person(id: string) {
        const member = members.find((item) => item.id === id)!;
        return <div className="org-person" key={id}>{member.photoUrl && <Image unoptimized src={member.photoUrl} alt={`Foto ${member.name || member.title}`} width={64} height={64} className="mx-auto mb-3 size-16 rounded-full object-cover" />}<h3 className="org-position">{member.title}</h3>{member.name ? <p className="mt-2 text-sm font-semibold leading-5">{member.name}</p> : <p className="mt-2 text-xs text-[var(--muted)]">Belum diisi</p>}{member.nip && <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">NIP. {member.nip}</p>}</div>;
    }
    function branch(first: string, second?: string) { return <div className="org-card">{person(first)}{second && person(second)}</div>; }
    return <div className="org-tree" aria-label="Bagan struktur organisasi Kelurahan Pinaras">
        <div className="mx-auto max-w-sm">{branch("lurah")}</div>
        <div className="org-level mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">{branch("fungsional")}{branch("sekretaris", "pembantu-sekretaris")}</div>
        <div className="org-level grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{["pemerintahan", "keuangan", "pembangunan", "kesra"].map((id) => <div key={id}>{branch(id, `pembantu-${id}`)}</div>)}</div>
        <div className="org-level grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">{Array.from({ length: 8 }, (_, i) => <div key={i}>{branch(`lingkungan-${i + 1}`, `wakil-${i + 1}`)}</div>)}</div>
    </div>;
}
