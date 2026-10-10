import { describe, expect, it } from "vitest";
import { jsx } from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { chartSegments } from "./chart-data";
import { mergeEvidenceFiles } from "./evidence-files";
import { parseByteRange } from "./announcement-media";
import { toAnnouncementCard } from "./announcements";
import { DonutChart } from "@/components/donut-chart";
import { Avatar } from "@/components/avatar";
import { ComplaintForm } from "@/components/complaint-form";

describe("chart data and zero values", () => {
    const data = [{ label: "Menunggu", value: 2, color: "#ff9900" }, { label: "Diproses", value: 2, color: "#087ac1" }, { label: "Selesai", value: 0, color: "#07845c" }, { label: "Ditolak", value: 0, color: "#c8323e" }];
    it("segments form a partition and zero categories stay empty", () => {
        const result = chartSegments(data);
        expect(result.total).toBe(4);
        expect(result.segments.map((s) => [s.start, s.end])).toEqual([[0, .5], [.5, 1], [1, 1], [1, 1]]);
    });
    it("renders all four labels and no zero-value circles", () => {
        const html = renderToStaticMarkup(jsx(DonutChart, { data }));
        expect(html.match(/<circle/g)).toHaveLength(2);
        expect(html).toContain("Ditolak");
        expect(html).toContain("Doughnut Chart");
        expect(html).toContain("Pie Chart");
        expect(html).toContain("Diagram Batang");
        expect(html).not.toContain('stroke-linecap="round"');
    });
    it("zero total and invalid counts never create NaN geometry", () => {
        const result = chartSegments(data.map((s) => ({ ...s, value: 0 })));
        expect(result.total).toBe(0);
        expect(result.segments.every((s) => s.ratio === 0)).toBe(true);
        expect(chartSegments([{ label: "Invalid", value: NaN, color: "red" }]).total).toBe(0);
        const html = renderToStaticMarkup(jsx(DonutChart, { data: result.segments }));
        expect(html).toContain("Belum ada laporan");
        expect(html).not.toContain("NaN");
    });
});

describe("shared drop/picker selection", () => {
    const photo = () => new File(["synthetic"], "bukti.png", { type: "image/png", lastModified: 123 });
    it("adds and deduplicates files selected in either path", () => {
        const first = mergeEvidenceFiles([], [photo()]);
        expect(mergeEvidenceFiles(first.files, [photo()]).files).toHaveLength(1);
        expect(first.errors).toHaveLength(0);
    });
    it.each([new File(["synthetic"], "bukti.exe", { type: "image/png" }), new File([], "kosong.jpg", { type: "image/jpeg" }), new File([new Uint8Array(5 * 1024 * 1024 + 1)], "besar.png", { type: "image/png" })])("rejects invalid evidence without discarding previous choices", (file) => {
        const result = mergeEvidenceFiles([photo()], [file]);
        expect(result.files).toHaveLength(1);
        expect(result.errors).toHaveLength(1);
    });
    it("empty picker is unnamed, preventing a zero-byte optional upload", () => {
        const html = renderToStaticMarkup(jsx(ComplaintForm, {}));
        expect(html).toContain("Pilih foto");
        expect(html).not.toMatch(/<input[^>]*name="evidence"/);
        expect(html).toContain('type="button"');
    });
});

describe("media byte ranges", () => {
    it.each([["bytes=0-9", 0, 9], ["bytes=10-", 10, 99], ["bytes=-10", 90, 99], ["bytes=90-999", 90, 99]])("supports video/PDF %s", (value, start, end) => {
        expect(parseByteRange(String(value), 100)).toEqual({ kind: "partial", start, end });
    });
    it.each(["bytes=100-", "bytes=50-10", "bytes=-0", "bytes=0-1,3-4", "invalid", "bytes=-", "bytes=99999999999999999999-"])("rejects malformed/out of bounds %s", (value) => {
        expect(parseByteRange(value, 100)).toEqual({ kind: "invalid" });
    });
    it("full requests are not partial", () => { expect(parseByteRange(null, 100)).toEqual({ kind: "full" }); });
});

describe("public cards and private avatars", () => {
    it("public announcement card omits storage reference and uses publication date", () => {
        const card = toAnnouncementCard({ id: "test", slug: "test", title: "Uji", content: "Isi\npengumuman", mediaType: "PDF", mediaRef: "storage/announcements/private-reference.pdf", isPinned: false, publishedAt: new Date("2026-10-01T00:00:00Z"), createdAt: new Date("2026-09-01T00:00:00Z"), updatedAt: new Date("2026-10-10T00:00:00Z") });
        expect(card.date).toBe("2026-10-01T00:00:00.000Z");
        expect(card.revision).toBe("2026-10-10T00:00:00.000Z");
        expect(card.excerpt).toBe("Isi pengumuman");
        expect(JSON.stringify(card)).not.toContain("storage/");
    });
    it("avatar requests private endpoint directly with a browser image", () => {
        const html = renderToStaticMarkup(jsx(Avatar, { src: "/api/profile/photo", name: "Admin Uji" }));
        expect(html).toContain('src="/api/profile/photo"');
        expect(html).not.toContain("/_next/image");
        expect(renderToStaticMarkup(jsx(Avatar, { name: "Admin Uji" }))).toContain("AU");
    });
});
