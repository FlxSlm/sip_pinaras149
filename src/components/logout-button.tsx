"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
    return (
        <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--ink)]"
        >
            Keluar
        </button>
    );
}