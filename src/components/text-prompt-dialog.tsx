"use client";

import { useId, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button, Textarea } from "@/components/ui/primitives";

export function TextPromptDialog({ title, initialValue = "", onCancel, onConfirm }: { title: string; initialValue?: string; onCancel: () => void; onConfirm: (value: string) => void }) {
    const [value, setValue] = useState(initialValue);
    const id = useId();
    return (
        <Dialog labelledBy={`${id}-title`} onClose={onCancel}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">Keterangan</p>
            <h2 id={`${id}-title`} className="mt-2 text-xl font-semibold">{title}</h2>
            <label htmlFor={`${id}-value`} className="sr-only">{title}</label>
            <Textarea id={`${id}-value`} autoFocus value={value} onChange={(event) => setValue(event.target.value)} rows={6} placeholder="Tuliskan keterangan di sini…" className="mt-5" />
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={onCancel}>Batal</Button>
                <Button disabled={!value.trim()} onClick={() => onConfirm(value.trim())}>Simpan</Button>
            </div>
        </Dialog>
    );
}
