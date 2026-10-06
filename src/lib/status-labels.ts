const map: Record<string, string> = {
    MENUNGGU: "Menunggu",
    DIPROSES: "Diproses",
    SELESAI: "Selesai",
    DITOLAK: "Ditolak",
};

export type ComplaintStatusTone = "waiting" | "progress" | "done" | "rejected";

export function complaintStatusLabel(status: string): string {
    return map[status] ?? status;
}

export function complaintStatusTone(status: string): ComplaintStatusTone {
    if (status === "SELESAI") return "done";
    if (status === "DITOLAK") return "rejected";
    if (status === "DIPROSES") return "progress";
    return "waiting";
}
