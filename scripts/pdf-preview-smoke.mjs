import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";

// Synthetic two-page document, never production announcement content.
const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 300] /Resources << /Font << /F1 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 300] /Resources << /Font << /F1 5 0 R >> >> /Contents 7 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
];
for (const title of ["HALAMAN PERTAMA", "HALAMAN KEDUA"]) {
    const content = `0.03 0.3 0.5 rg 0 190 400 110 re f BT /F1 22 Tf 1 1 1 rg 24 240 Td (${title}) Tj ET BT /F1 14 Tf 0.1 0.2 0.3 rg 24 150 Td (Pengumuman uji sintetis SIPP) Tj ET`;
    objects.push(`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`);
}
let source = "%PDF-1.4\n";
const offsets = [0];
objects.forEach((object, index) => { offsets.push(Buffer.byteLength(source)); source += `${index + 1} 0 obj\n${object}\nendobj\n`; });
const xref = Buffer.byteLength(source);
source += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` + offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("") + `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
const task = getDocument({ data: new Uint8Array(Buffer.from(source)), standardFontDataUrl: join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts") + "/" });
try {
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.2 });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    await page.render({ canvas, canvasContext: canvas.getContext("2d"), viewport }).promise;
    const text = (await page.getTextContent()).items.map((item) => item.str ?? "").join(" ");
    const checks = { twoPagesLoaded: pdf.numPages === 2, firstPageSelected: text.includes("HALAMAN PERTAMA") && !text.includes("HALAMAN KEDUA"), rendered: canvas.width === 480 && canvas.height === 360 };
    const directory = join(process.cwd(), ".ui-qa");
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, "synthetic-pdf-page-1.png"), canvas.toBuffer("image/png"));
    console.log(JSON.stringify(checks));
    if (Object.values(checks).some((value) => !value)) process.exitCode = 1;
} finally { await task.destroy(); }
