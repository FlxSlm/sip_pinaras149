import { describe, expect, it } from "vitest";
import { mergeAnnouncementFiles } from "@/lib/announcement-files";
import { complaintInputSchema } from "@/lib/complaints";
import { isHeicImage } from "@/lib/image-files";

describe("multiple announcement uploads", () => {
    const pdf = (name: string) => new File(["%PDF-fixture"], name, { type: "application/pdf" });
    it("accepts multiple files, removes duplicates and respects retained attachment count", () => {
        const one = pdf("one.pdf"), two = pdf("two.pdf");
        expect(mergeAnnouncementFiles([one], [one, two]).files).toHaveLength(2);
        expect(mergeAnnouncementFiles([], [one, two], 7).files).toHaveLength(1);
        expect(mergeAnnouncementFiles([], [one, two], 7).errors).toContain("Maksimal 8 lampiran per pengumuman.");
    });
    it("rejects executable files even with a forged PDF MIME", () => {
        expect(mergeAnnouncementFiles([], [new File(["x"], "unsafe.exe", { type: "application/pdf" })]).files).toHaveLength(0);
    });
});
describe("neighborhood validation", () => {
    const fields = { title: "Pengaduan uji", category: "Kebersihan", description: "Deskripsi uji" };
    it.each(["1", "2", "3", "4", "5", "6", "7", "8", "UNKNOWN"])("accepts %s", (neighborhood) => {
        expect(complaintInputSchema.safeParse({ ...fields, neighborhood }).success).toBe(true);
    });
    it.each(["0", "9", "", "../admin", 1])("rejects unapproved neighborhood %s", (neighborhood) => {
        expect(complaintInputSchema.safeParse({ ...fields, neighborhood }).success).toBe(false);
    });
});
describe("HEIC metadata detection", () => {
    it("detects an iPhone image even when its browser MIME is empty", () => {
        expect(isHeicImage({ name: "photo.HEIC", type: "" })).toBe(true);
        expect(isHeicImage({ name: "photo", type: "image/heif" })).toBe(true);
        expect(isHeicImage({ name: "photo.jpg", type: "image/jpeg" })).toBe(false);
    });
});
