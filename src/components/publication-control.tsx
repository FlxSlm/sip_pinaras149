"use client";

import { useState } from "react";

export function PublicationControl({ complaintId, published }: { complaintId: string; published: boolean }) {
    const [value, setValue] = useState(published);
    const [pending, setPending] = useState(false);

    async function toggle() {
        setPending(true);
        const response = await fetch("/api/petugas/lurah/publikasi", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ complaintId, published: !value }),
        });
        if (response.ok) setValue(!value);
        setPending(false);
    }

    return <button type="button" onClick={() => void toggle()} disabled={pending} className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-60">{pending ? "Menyimpan..." : value ? "Batalkan publikasi" : "Publikasikan"}</button>;
}
