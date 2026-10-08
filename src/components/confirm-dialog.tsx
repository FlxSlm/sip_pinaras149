"use client";

type Props = {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({ title, description, confirmLabel = "Ya", cancelLabel = "Batalkan", danger = false, onConfirm, onCancel }: Props) {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(18,50,59,0.52)] px-5" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm rounded-2xl border border-[var(--line)] bg-white p-6 shadow-2xl">
                <div className="flex items-start gap-3">
                    <div className={`grid size-10 shrink-0 place-items-center rounded-full text-lg ${danger ? "bg-[#fbe9e7] text-[var(--danger)]" : "bg-[var(--soft-accent)] text-[var(--leaf-dark)]"}`}>!</div>
                    <div>
                        <h2 className="text-lg font-bold text-[var(--ink)]">{title}</h2>
                        {description ? <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button type="button" onClick={onCancel} className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--ink)]">
                        {cancelLabel}
                    </button>
                    <button type="button" onClick={onConfirm} className={`rounded-lg px-4 py-2 text-sm font-bold text-white ${danger ? "bg-[var(--danger)]" : "bg-[var(--brand)]"}`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
