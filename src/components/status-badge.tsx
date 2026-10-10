import { complaintStatusLabel, complaintStatusTone } from "@/lib/status-labels";

export function StatusBadge({ status }: { status: string }) {
    const tone = complaintStatusTone(status);
    return (
        <span className={`ui-badge ui-tone-${tone}`}>
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {complaintStatusLabel(status)}
        </span>
    );
}
