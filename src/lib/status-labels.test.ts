import { describe, expect, it } from "vitest";
import { complaintStatusLabel, complaintStatusTone } from "@/lib/status-labels";

describe("complaintStatusLabel", () => {
    it("memetakan status lama ke label V2", () => {
        expect(complaintStatusLabel("DIAJUKAN")).toBe("Menunggu");
        expect(complaintStatusLabel("DIVERIFIKASI")).toBe("Menunggu");
        expect(complaintStatusLabel("DITERUSKAN_KE_LURAH")).toBe("Menunggu");
        expect(complaintStatusLabel("DALAM_PROSES")).toBe("Diproses");
        expect(complaintStatusLabel("SELESAI")).toBe("Selesai");
        expect(complaintStatusLabel("DI_LUAR_KEWENANGAN")).toBe("Ditolak");
    });

    it("mengembalikan nilai asli untuk status tidak dikenal", () => {
        expect(complaintStatusLabel("UNKNOWN")).toBe("UNKNOWN");
    });
});

describe("complaintStatusTone", () => {
    it("memberikan tone yang tepat", () => {
        expect(complaintStatusTone("SELESAI")).toBe("done");
        expect(complaintStatusTone("DI_LUAR_KEWENANGAN")).toBe("rejected");
        expect(complaintStatusTone("DALAM_PROSES")).toBe("progress");
        expect(complaintStatusTone("DIAJUKAN")).toBe("waiting");
    });
});
