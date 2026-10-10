"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";

export function LogoutButton() {
    const [confirming, setConfirming] = useState(false);

    return (
        <>
            <Button
                variant="secondary"
                aria-label="Keluar dari akun"
                onClick={() => setConfirming(true)}
                className="size-11 px-0 sm:w-auto sm:px-4"
            >
                <Icon name="logout" />
                <span className="hidden sm:inline">Keluar</span>
            </Button>
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
