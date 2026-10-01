"use client";

import { useState } from "react";

export function TextPromptDialog({ title, initialValue = "", onCancel, onConfirm }: { title: string; initialValue?: string; onCancel: () => void; onConfirm: (value: string) => void }) {
    const [value, setValue] = useState(initialValue);
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,43,58,0.45)] px-5" role="dialog" aria-modal="true" aria-labelledby="prompt-title"><div className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-white p-6 shadow-2xl"><h2 id="prompt-title" className="text-xl font-semibold text-[var(--ink)]">{title}</h2><textarea autoFocus value={value} onChange={(event) => setValue(event.target.value)} rows={6} className="mt-4 w-full rounded-xl border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--accent)]" /><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onCancel} className="rounded-md border border-[var(--line)] px-4 py-2 font-semibold">Batal</button><button type="button" disabled={!value.trim()} onClick={() => onConfirm(value.trim())} className="rounded-md bg-[var(--accent)] px-4 py-2 font-semibold text-white disabled:opacity-50">Simpan</button></div></div></div>;
}
