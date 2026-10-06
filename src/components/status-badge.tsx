import { complaintStatusLabel, complaintStatusTone } from "@/lib/status-labels";

const toneClass: Record<string, string> = {
    waiting: "bg-[var(--gold-soft)] text-[#8a5a12]",
    progress: "bg-[#e7f0fa] text-[var(--brand-dark)]",
    done: "bg-[var(--soft-accent)] text-[var(--leaf-dark)]",
    rejected: "bg-[#fbe9e7] text-[var(--danger)]",
};

export function StatusBadge({ status }: { status: string }) {
    const tone = complaintStatusTone(status);
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${toneClass[tone]}`}>
            <span className="size-1.5 rounded-full bg-current" />
            {complaintStatusLabel(status)}
        </span>
    );
}
