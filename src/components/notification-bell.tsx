"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

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
        <Link href={href} aria-label={`Buka notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`} className="relative grid size-11 place-items-center rounded-xl text-[var(--brand-dark)] hover:bg-[var(--brand-soft)]">
            <Icon name="bell" className="size-6" />
            {unreadCount > 0 && <span aria-hidden="true" className="absolute right-0 top-0 min-w-5 rounded-full bg-[var(--danger)] px-1 text-center text-xs font-semibold leading-5 text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
        </Link>
    );
}
