"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Notification = { id: string; title: string; message: string; readAt: string | null; createdAt: string; complaint: { ticketNumber: string } | null; announcementId: string | null };

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let active = true;
        fetch("/api/notifications", { cache: "no-store" })
            .then((response) => response.ok ? response.json() as Promise<{ notifications: Notification[]; unreadCount: number }> : null)
            .then((result) => {
                if (active && result) {
                    setItems(result.notifications);
                    setUnreadCount(result.unreadCount);
                }
            })
            .catch(() => undefined);
        return () => { active = false; };
    }, []);

    async function markRead() {
        setOpen(true);
        if (unreadCount > 0) {
            await fetch("/api/notifications", { method: "PATCH" });
            setUnreadCount(0);
            setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
        }
    }

    return <div className="relative">
        <button type="button" aria-label="Buka notifikasi" onClick={() => void markRead()} className="relative rounded-full border border-[var(--line)] bg-white px-3 py-2 text-lg shadow-sm">&#128276;
            {unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--accent)] px-1 text-center text-xs font-bold text-white">{unreadCount}</span>}
        </button>
        {open && <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-[var(--line)] bg-white p-3 shadow-xl">
            <div className="flex items-center justify-between"><h2 className="font-semibold text-[var(--ink)]">Notifikasi</h2><button type="button" onClick={() => setOpen(false)} className="text-sm text-[var(--muted)]">Tutup</button></div>
            <div className="mt-3 max-h-72 space-y-3 overflow-auto">
                {items.length === 0 && <p className="text-sm text-[var(--muted)]">Belum ada notifikasi.</p>}
                {items.map((item) => {
                    const href = item.complaint ? `/pengaduan/${item.complaint.ticketNumber}` : item.announcementId ? "/pengumuman" : null;
                    const content = <><p className="text-sm font-semibold text-[var(--ink)]">{item.title}</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.message}</p><time className="mt-2 block text-[11px] text-[var(--muted)]">{new Date(item.createdAt).toLocaleString("id-ID")}</time></>;
                    return href ? <Link href={href} key={item.id} className="block border-b border-[var(--line)] pb-3 last:border-0 hover:bg-[var(--surface)]">{content}</Link> : <article key={item.id} className="border-b border-[var(--line)] pb-3 last:border-0">{content}</article>;
                })}
            </div>
        </div>}
    </div>;
}
