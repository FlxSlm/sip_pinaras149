export const PUBLIC_COMPLAINT_STATUSES = ["SELESAI", "DITOLAK"] as const;

export function isPublicComplaintStatus(status: string): boolean {
    return (PUBLIC_COMPLAINT_STATUSES as readonly string[]).includes(status);
}

export function redactPII(text: string): string {
    return text
        .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email disembunyikan]")
        .replace(/(?:\+62|62|0)8[0-9]{7,12}/g, "[telepon disembunyikan]");
}

export type PublicComplaintInput = {
    ticketNumber: string;
    title: string;
    category: string;
    description: string;
    status: string;
    priority: string | null;
    createdAt: Date;
    completedAt: Date | null;
    rejectedAt: Date | null;
    officialResponse: string | null;
};

export function toPublicComplaint(complaint: PublicComplaintInput) {
    return {
        ticketNumber: complaint.ticketNumber,
        title: complaint.title,
        category: complaint.category,
        description: redactPII(complaint.description),
        status: complaint.status,
        priority: complaint.priority,
        createdAt: complaint.createdAt.toISOString(),
        completedAt: complaint.completedAt?.toISOString() ?? null,
        rejectedAt: complaint.rejectedAt?.toISOString() ?? null,
        officialResponse: complaint.officialResponse ? redactPII(complaint.officialResponse) : null,
    };
}

export const publicComplaintSelect = {
    ticketNumber: true,
    title: true,
    category: true,
    description: true,
    status: true,
    priority: true,
    createdAt: true,
    completedAt: true,
    rejectedAt: true,
    officialResponse: true,
} as const;
