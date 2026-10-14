"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { uploadPrivateFile } from "@/lib/upload-client";
import { imageFileAccept, isHeicImage } from "@/lib/image-files";

export function ProfilePhotoForm({ imageUrl, name, hasCustomPhoto }: { imageUrl: string | null; name: string; hasCustomPhoto: boolean }) {
    const router = useRouter();
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    async function uploadFile(file: File) {
        setPending(true);
        setMessage("");
        try {
            const uploadId = await uploadPrivateFile(file, "PROFILE");
            const response = await fetch("/api/profile/photo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uploadId }) });
            if (!response.ok) throw new Error("Upload failed");
            setMessage("Foto profil diperbarui.");
            window.dispatchEvent(new Event("sipp:profile-changed")); router.refresh(); setPending(false);
        } catch {
            setMessage("Gagal mengunggah foto.");
            setPending(false);
        }
    }

    async function removePhoto() {
        setPending(true);
        setMessage("");
        try {
        const response = await fetch("/api/profile/photo", { method: "DELETE" });
        const result = (await response.json()) as { message?: string };
        setMessage(result.message ?? (response.ok ? "Foto profil dihapus." : "Gagal menghapus foto."));
        if (response.ok) { window.dispatchEvent(new Event("sipp:profile-changed")); router.refresh(); }
        } catch { setMessage("Foto belum dapat dihapus. Periksa koneksi lalu coba kembali."); }
        setPending(false);
        setConfirming(false);
    }

    return (
        <div className="flex flex-wrap items-center gap-5">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--surface-2)]">
                {imageUrl ? (
                    <Avatar src={imageUrl} name={name} className="size-20" />
                ) : (
                    <span className="grid size-full place-items-center text-2xl font-bold text-[var(--brand)]">{(name || "W").slice(0, 1).toUpperCase()}</span>
                )}
            </div>
            <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white">
                        {pending ? "Mengunggah..." : "Ganti foto profil"}
                        <input type="file" disabled={pending} accept={imageFileAccept} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; if ((!isHeicImage(file) && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) || !file.size || file.size > 5 * 1024 * 1024) { setMessage("Pilih JPG, PNG, WEBP, atau HEIC maksimal 5 MB."); return; } setSelectedFile(file); }} />
                    </label>
                    {hasCustomPhoto && (
                        <button type="button" onClick={() => setConfirming(true)} disabled={pending} className="rounded-lg border border-[var(--danger)] px-4 py-2 text-sm font-bold text-[var(--danger)] disabled:opacity-60">
                            Hapus foto
                        </button>
                    )}
                </div>
                <p className="text-xs text-[var(--muted)]">JPG, PNG, WEBP, atau HEIC · maksimal 5 MB</p>
                {message && <p className="text-sm text-[var(--muted)]" role="status">{message}</p>}
            </div>
            {confirming && (
                <ConfirmDialog
                    title="Hapus foto profil?"
                    description="Foto unggahan Anda akan dihapus. Profil kembali memakai foto bawaan atau inisial nama."
                    confirmLabel="Ya, Hapus"
                    danger
                    onCancel={() => setConfirming(false)}
                    onConfirm={() => void removePhoto()}
                />
            )}
            {selectedFile && <ConfirmDialog title="Ganti foto profil?" description={`Foto ${selectedFile.name} akan menggantikan foto profil Anda.`} confirmLabel="Ya, ganti foto" onCancel={() => setSelectedFile(null)} onConfirm={() => { const file = selectedFile; setSelectedFile(null); void uploadFile(file); }} />}
        </div>
    );
}
