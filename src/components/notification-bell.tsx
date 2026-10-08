"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function NotificationBell({ href }: { href: string }) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let active = true;
        fetch("/api/notifications", { cache: "no-store" })
            .then((response) => response.ok ? response.json() as Promise<{ unreadCount: number }> : null)
            .then((result) => {
                if (active && result) setUnreadCount(result.unreadCount);
            })
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, []);

    return (
        <Link href={href} aria-label="Buka notifikasi" className="relative rounded-full border border-[var(--line)] bg-white px-3 py-2 text-lg shadow-sm">
            <span className="grid place-items-center text-[var(--ink)]" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z" /></svg>
            </span>
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--leaf)] px-1 text-center text-xs font-bold text-white">{unreadCount}</span>}
        </Link>
    );
}
