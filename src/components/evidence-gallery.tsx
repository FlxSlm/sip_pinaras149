"use client";

import { useId, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/primitives";

export function EvidenceGallery({ ticketNumber, evidenceIds }: { ticketNumber: string; evidenceIds: string[] }) {
    const [index, setIndex] = useState<number | null>(null);
    const id = useId();
    const url = (value: number) => `/api/pengaduan/${encodeURIComponent(ticketNumber)}/evidence/${encodeURIComponent(evidenceIds[value])}`;
    return <>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {evidenceIds.map((value, i) => <button key={value} type="button" aria-label={`Perbesar bukti foto ${i + 1}`} onClick={() => setIndex(i)} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url(i)} alt={`Bukti pengaduan ${i + 1}`} className="size-full object-cover transition group-hover:scale-105" />
                <span className="absolute bottom-2 right-2 rounded-lg bg-[var(--ink)]/90 px-2 py-1 text-xs text-white">Perbesar</span>
            </button>)}
        </div>
        {index !== null && <Dialog labelledBy={id} onClose={() => setIndex(null)} wide>
            <div className="mb-4 flex items-center justify-between gap-3"><h2 id={id} className="text-lg font-semibold">Bukti foto {index + 1} dari {evidenceIds.length}</h2><Button autoFocus variant="secondary" aria-label="Tutup foto" onClick={() => setIndex(null)}><Icon name="close" /></Button></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url(index)} alt={`Bukti pengaduan ${index + 1}, ukuran penuh`} className="mx-auto max-h-[70dvh] max-w-full rounded-lg object-contain" />
            <div className="mt-4 flex flex-wrap justify-between gap-3"><Button variant="secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>Sebelumnya</Button><a href={url(index)} target="_blank" rel="noopener noreferrer" className="ui-button ui-button-ghost">Buka ukuran asli</a><Button variant="secondary" disabled={index === evidenceIds.length - 1} onClick={() => setIndex(index + 1)}>Berikutnya</Button></div>
        </Dialog>}
    </>;
}
