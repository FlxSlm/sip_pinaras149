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
            <span aria-hidden="true">🔔</span>
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--leaf)] px-1 text-center text-xs font-bold text-white">{unreadCount}</span>}
        </Link>
    );
}
