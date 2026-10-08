"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function LogoutButton() {
    const [confirming, setConfirming] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setConfirming(true)}
                className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--ink)]"
            >
                Keluar
            </button>
            {confirming && (
                <ConfirmDialog
                    title="Keluar dari akun?"
                    description="Anda harus masuk kembali untuk mengakses dashboard."
                    confirmLabel="Ya, Keluar"
                    danger
                    onCancel={() => setConfirming(false)}
                    onConfirm={() => signOut({ callbackUrl: "/" })}
                />
            )}
        </>
    );
}
