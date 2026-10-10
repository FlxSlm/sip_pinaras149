"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask } from "pdfjs-dist";
import { Icon } from "@/components/ui/icon";

export function AnnouncementThumbnail({ mediaType, mediaUrl, title }: { mediaType: string; mediaUrl?: string; title: string }) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const container = useRef<HTMLDivElement>(null);
    const [failed, setFailed] = useState(false);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        if (mediaType !== "PDF" || !mediaUrl || !container.current) return;
        let disposed = false;
        let task: PDFDocumentLoadingTask | undefined;
        async function render() {
            try {
                const pdfjs = await import("pdfjs-dist");
                if (disposed) return;
                pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
                task = pdfjs.getDocument({ url: mediaUrl!, cMapUrl: "/vendor/pdfjs/cmaps/", cMapPacked: true, standardFontDataUrl: "/vendor/pdfjs/standard_fonts/", wasmUrl: "/vendor/pdfjs/wasm/", disableAutoFetch: true });
                const pdf = await task.promise;
                const page = await pdf.getPage(1);
                const element = canvas.current;
                if (disposed || !element) return;
                const original = page.getViewport({ scale: 1 });
                const viewport = page.getViewport({ scale: Math.min(1.5, 480 / original.width) });
                element.width = Math.ceil(viewport.width);
                element.height = Math.ceil(viewport.height);
                await page.render({ canvas: element, viewport }).promise;
                if (!disposed) setReady(true);
            } catch { if (!disposed) setFailed(true); }
        }
        const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) { observer.disconnect(); void render(); } }, { rootMargin: "150px" });
        observer.observe(container.current);
        return () => { disposed = true; observer.disconnect(); void task?.destroy().catch(() => undefined); };
    }, [mediaType, mediaUrl]);

    return <div ref={container} className="announcement-thumbnail" role="img" aria-label={mediaType === "TEXT" ? "Stiker pengumuman" : `Pratinjau ${title}`}>
        {mediaType === "PDF" && mediaUrl && !failed ? <canvas ref={canvas} aria-hidden="true" /> : mediaType === "VIDEO" && mediaUrl && !failed ? <video src={mediaUrl} muted playsInline preload="metadata" aria-hidden="true" onError={() => setFailed(true)} onLoadedMetadata={(event) => { const video = event.currentTarget; if (Number.isFinite(video.duration) && video.duration > 0) video.currentTime = Math.min(.2, video.duration / 2); }} /> : <div className="grid place-items-center p-4 text-center text-[var(--brand-dark)]"><span className="grid size-16 place-items-center rounded-2xl border border-white bg-white/80 shadow-sm"><Icon name="announcement" className="size-9" /></span><span className="mt-3 text-xs font-semibold">{failed ? "Pratinjau tidak tersedia" : "Pengumuman Kelurahan"}</span></div>}
        {mediaType !== "TEXT" && <span className="absolute bottom-2 left-2 rounded bg-[var(--brand-deep)] px-2 py-1 text-xs font-semibold text-white">{mediaType === "PDF" ? failed ? "PDF" : "PDF · halaman 1" : "Video"}</span>}
        {mediaType === "PDF" && mediaUrl && !failed && !ready && <span className="absolute inset-0 grid place-items-center bg-[var(--brand-soft)] text-xs font-semibold text-[var(--brand-dark)]">Memuat halaman pertama...</span>}
    </div>;
}
