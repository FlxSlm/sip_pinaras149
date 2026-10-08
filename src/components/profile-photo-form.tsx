"use client";

import { useState } from "react";
import Image from "next/image";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function ProfilePhotoForm({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const [confirming, setConfirming] = useState(false);

    async function upload(file: File) {
        setPending(true);
        setMessage("");
        const form = new FormData();
        form.append("photo", file);
        const response = await fetch("/api/profile/photo", { method: "POST", body: form });
        const result = (await response.json()) as { message?: string };
        setMessage(result.message ?? (response.ok ? "Foto profil diperbarui." : "Gagal mengunggah foto."));
        if (response.ok) window.location.reload();
        setPending(false);
    }

    async function removePhoto() {
        setPending(true);
        setMessage("");
        const response = await fetch("/api/profile/photo", { method: "DELETE" });
        const result = (await response.json()) as { message?: string };
        setMessage(result.message ?? (response.ok ? "Foto profil dihapus." : "Gagal menghapus foto."));
        if (response.ok) window.location.reload();
        setPending(false);
        setConfirming(false);
    }

    return (
        <div className="flex items-center gap-5">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface-2)]">
                {imageUrl ? (
                    <Image src={imageUrl} alt="Foto profil" fill sizes="80px" className="object-cover" />
                ) : (
                    <span className="grid size-full place-items-center text-2xl font-bold text-[var(--brand)]">{(name || "W").slice(0, 1).toUpperCase()}</span>
                )}
            </div>
            <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">
                        {pending ? "Mengunggah..." : "Ganti foto profil"}
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
                    </label>
                    {imageUrl && (
                        <button type="button" onClick={() => setConfirming(true)} disabled={pending} className="rounded-lg border border-[var(--danger)] px-4 py-2 text-sm font-bold text-[var(--danger)] disabled:opacity-60">
                            Hapus foto
                        </button>
                    )}
                </div>
                <p className="text-xs text-[var(--muted)]">JPG, PNG, atau WEBP · maksimal 5 MB</p>
                {message && <p className="text-sm text-[var(--muted)]" role="status">{message}</p>}
            </div>
            {confirming && (
                <ConfirmDialog
                    title="Hapus foto profil?"
                    description="Foto profil Anda akan dihapus dan diganti dengan avatar awal."
                    confirmLabel="Ya, Hapus"
                    danger
                    onCancel={() => setConfirming(false)}
                    onConfirm={() => void removePhoto()}
                />
            )}
        </div>
    );
}
