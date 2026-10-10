"use client";

import { useState } from "react";

export function Avatar({ src, name, className = "size-10" }: { src?: string | null; name: string; className?: string }) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    return <span className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--brand-soft)] font-semibold text-[var(--brand-deep)] ${className}`}>
        {src && src !== failedSrc ? (
            // Authenticated image endpoints need the browser's cookies. The Next
            // optimizer fetches without them; direct loading keeps them private.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={`Foto ${name}`} className="size-full object-cover" onError={() => setFailedSrc(src)} />
        ) : <span aria-label={`Avatar ${name}`}>{(name || "P").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>}
    </span>;
}
