"use client";

import { useState } from "react";

export function RatingControl({ complaintId }: { complaintId: string }) {
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);

    async function submitRating() {
        if (!rating) {
            setMessage("Pilih rating terlebih dahulu.");
            return;
        }

        setPending(true);
        setMessage("");
        const response = await fetch("/api/warga/pengaduan/rating", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ complaintId, rating }),
        });
        const result = (await response.json()) as { message?: string };
        setMessage(result.message ?? "Rating tidak dapat disimpan.");
        if (response.ok) setRating(0);
        setPending(false);
    }

    return (
        <div className="mt-4 border-t border-[var(--line)] pt-4">
            <p className="text-sm font-semibold text-[var(--ink)]">Bagaimana pelayanan yang Anda terima?</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="flex gap-1" aria-label="Pilih rating 1 sampai 5">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            aria-label={`${value} bintang`}
                            aria-pressed={rating === value}
                            onClick={() => setRating(value)}
                            className={`grid size-9 place-items-center rounded-full border text-lg transition ${rating >= value ? "border-[var(--gold)] bg-[var(--gold-soft)] text-[var(--gold)]" : "border-[var(--line)] text-[var(--muted)]"}`}
                        >
                            {rating >= value ? "★" : "☆"}
                        </button>
                    ))}
                </div>
                <button type="button" onClick={() => void submitRating()} disabled={pending} className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    {pending ? "Menyimpan..." : "Kirim rating"}
                </button>
            </div>
            {message && <p className="mt-2 text-sm text-[var(--muted)]" role="status">{message}</p>}
        </div>
    );
}