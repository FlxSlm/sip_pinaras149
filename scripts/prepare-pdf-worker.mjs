import { cp, mkdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const destination = join(root, "public", "vendor", "pdfjs");
await mkdir(destination, { recursive: true });
await cp(join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs"), join(destination, "pdf.worker.min.mjs"));
for (const folder of ["cmaps", "standard_fonts", "wasm"]) {
    await cp(join(root, "node_modules", "pdfjs-dist", folder), join(destination, folder), { recursive: true });
}
