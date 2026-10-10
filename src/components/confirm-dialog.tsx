"use client";

import { useId } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/primitives";

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
    const id = useId();
    return (
        <Dialog labelledBy={`${id}-title`} describedBy={description ? `${id}-description` : undefined} onClose={onCancel}>
            <div className="flex items-start gap-4">
                <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${danger ? "ui-tone-rejected" : "ui-tone-progress"}`}>
                    <Icon name={danger ? "warning" : "info"} className="size-6" />
                </span>
                <div className="min-w-0">
                    <h2 id={`${id}-title`} className="text-xl font-semibold">{title}</h2>
                    {description && <p id={`${id}-description`} className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>}
                </div>
            </div>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="secondary" autoFocus onClick={onCancel}>{cancelLabel}</Button>
                <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
            </div>
        </Dialog>
    );
}
