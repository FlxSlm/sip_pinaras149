export const neighborhoodValues = ["1", "2", "3", "4", "5", "6", "7", "8", "UNKNOWN"] as const;
export function neighborhoodLabel(value: number | null | undefined) {
    return value ? `Lingkungan ${value}` : "Tidak Tahu";
}
