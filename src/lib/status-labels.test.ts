import { describe, expect, it } from "vitest";
import { complaintStatusLabel, complaintStatusTone } from "@/lib/status-labels";

describe("complaintStatusLabel", () => {
    it("memetakan status V2 ke label", () => {
        expect(complaintStatusLabel("MENUNGGU")).toBe("Menunggu");
        expect(complaintStatusLabel("DIPROSES")).toBe("Diproses");
        expect(complaintStatusLabel("SELESAI")).toBe("Selesai");
        expect(complaintStatusLabel("DITOLAK")).toBe("Ditolak");
    });

    it("mengembalikan nilai asli untuk status tidak dikenal", () => {
        expect(complaintStatusLabel("UNKNOWN")).toBe("UNKNOWN");
    });
});

describe("complaintStatusTone", () => {
    it("memberikan tone yang tepat", () => {
        expect(complaintStatusTone("SELESAI")).toBe("done");
        expect(complaintStatusTone("DITOLAK")).toBe("rejected");
        expect(complaintStatusTone("DIPROSES")).toBe("progress");
        expect(complaintStatusTone("MENUNGGU")).toBe("waiting");
    });
});
