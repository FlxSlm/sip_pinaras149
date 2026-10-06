const map: Record<string, string> = {
    DIAJUKAN: "Menunggu",
    DIVERIFIKASI: "Menunggu",
    DITERUSKAN_KE_LURAH: "Menunggu",
    DALAM_PROSES: "Diproses",
    SELESAI: "Selesai",
    DI_LUAR_KEWENANGAN: "Ditolak",
};

export type ComplaintStatusTone = "waiting" | "progress" | "done" | "rejected";

export function complaintStatusLabel(status: string): string {
    return map[status] ?? status;
}

export function complaintStatusTone(status: string): ComplaintStatusTone {
    if (status === "SELESAI") return "done";
    if (status === "DI_LUAR_KEWENANGAN") return "rejected";
    if (status === "DALAM_PROSES") return "progress";
    return "waiting";
}
