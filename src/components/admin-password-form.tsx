"use client";

import { FormEvent, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function AdminPasswordForm() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const [confirming, setConfirming] = useState(false);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setConfirming(true);
    }

    async function submitChange() {
        setConfirming(false);
        setPending(true);
        setMessage("");
        const response = await fetch("/api/admin/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        const result = (await response.json()) as { message?: string };
        setMessage(result.message ?? (response.ok ? "Password diperbarui." : "Gagal memperbarui password."));
        if (response.ok) {
            setCurrentPassword("");
            setNewPassword("");
        }
        setPending(false);
    }

    return (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-[var(--ink)]">
                Password saat ini
                <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-3 text-[var(--ink)] outline-none focus:border-[var(--brand)]" />
            </label>
            <label className="block text-sm font-semibold text-[var(--ink)]">
                Password baru
                <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={8} required className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-3 text-[var(--ink)] outline-none focus:border-[var(--brand)]" />
            </label>
            {message && <p className="text-sm text-[var(--muted)]" role="status">{message}</p>}
            <button type="submit" disabled={pending} className="rounded-lg bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
                {pending ? "Menyimpan..." : "Ganti password"}
            </button>
            {confirming && (
                <ConfirmDialog
                    title="Ganti password?"
                    description="Password akun Anda akan diperbarui. Pastikan Anda mengingat password baru."
                    confirmLabel="Ya, Ganti"
                    danger
                    onCancel={() => setConfirming(false)}
                    onConfirm={() => void submitChange()}
                />
            )}
        </form>
    );
}
