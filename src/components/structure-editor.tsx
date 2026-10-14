"use client";
import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { OrganizationMember } from "@/lib/organization";
import { uploadPrivateFile } from "@/lib/upload-client";
import { imageFileAccept } from "@/lib/image-files";
import { Icon } from "@/components/ui/icon";

function StructurePhotoPicker({ title, file, onSelect }: { title: string; file?: File; onSelect: (file: File) => void }) {
    const input = useRef<HTMLInputElement>(null);
    const helpId = useId();
    return <div className="mt-3">
        <p className="text-sm font-semibold">Foto pejabat</p>
        <input ref={input} type="file" hidden aria-label={`Foto pejabat ${title}`} accept={imageFileAccept} onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) onSelect(selected);
            event.target.value = "";
        }} />
        <button type="button" aria-label={`Pilih Foto untuk ${title}`} aria-describedby={helpId} className="ui-button ui-button-primary mt-2 w-full sm:w-auto" onClick={() => input.current?.click()}>
            <Icon name="upload" />Pilih Foto
        </button>
        <p className="mt-2 break-words text-xs text-[var(--muted)]">{file ? `Dipilih: ${file.name}` : "Belum ada foto baru yang dipilih."}</p>
        <p id={helpId} className="mt-1 text-xs leading-5 text-[var(--muted)]">JPG, PNG, WEBP, atau HEIC · maksimal 5 MB.</p>
    </div>;
}

export function StructureEditor({ initialMembers }: { initialMembers: OrganizationMember[] }) {
    const router = useRouter();
    const [members, setMembers] = useState(initialMembers);
    const [photos, setPhotos] = useState<Record<string, File>>({});
    const [removed, setRemoved] = useState<string[]>([]);
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState("");
    const photoUrls = new Map(initialMembers.map((member) => [member.id, member.photoUrl]));
    async function save(event: React.FormEvent) {
        event.preventDefault(); setPending(true); setMessage("");
        try {
            if (Object.keys(photos).length > 8) throw new Error("Maksimal 8 foto dalam satu penyimpanan. Simpan secara bertahap.");
            const payload = [];
            for (const member of members) payload.push({ id: member.id, name: member.name, removeImage: removed.includes(member.id), ...(photos[member.id] ? { imageUploadId: await uploadPrivateFile(photos[member.id], "STRUCTURE") } : {}) });
            const response = await fetch("/api/admin/cms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ members: payload }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message ?? "Struktur belum dapat disimpan.");
            setPhotos({}); setRemoved([]); setMessage("Struktur kelurahan tersimpan."); router.refresh();
        } catch (error) { setMessage(error instanceof Error ? error.message : "Struktur belum dapat disimpan."); }
        finally { setPending(false); }
    }
    return <form onSubmit={save} className="space-y-5"><fieldset disabled={pending} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{members.map((member) => <div key={member.id} className="min-w-0 rounded-xl border border-[var(--line)] bg-white p-5"><h2 className="font-semibold">{member.title}</h2><label className="mt-3 block text-sm">Nama pejabat<input value={member.name} maxLength={160} onChange={(event) => setMembers(members.map((item) => item.id === member.id ? { ...item, name: event.target.value } : item))} className="mt-2 w-full" /></label>{photoUrls.get(member.id) && !removed.includes(member.id) && <Image unoptimized src={photoUrls.get(member.id)!} alt="Foto saat ini" width={56} height={56} className="mt-3 size-14 rounded-full object-cover" />}<StructurePhotoPicker title={member.title} file={photos[member.id]} onSelect={(file) => { setPhotos({ ...photos, [member.id]: file }); setRemoved(removed.filter((id) => id !== member.id)); }} />{photoUrls.get(member.id) && <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={removed.includes(member.id)} onChange={(event) => { setRemoved(event.target.checked ? [...removed, member.id] : removed.filter((id) => id !== member.id)); if (event.target.checked) setPhotos(Object.fromEntries(Object.entries(photos).filter(([id]) => id !== member.id))); }} />Hapus foto saat ini</label>}</div>)}</fieldset>{message && <p role="status" className="text-sm">{message}</p>}<button disabled={pending} type="submit" className="ui-button ui-button-primary">{pending ? "Menyimpan..." : "Simpan struktur"}</button></form>;
}
