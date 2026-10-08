"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Notification = {
    id: string;
    title: string;
    message: string;
    readAt: string | null;
    createdAt: string;
    complaint: { ticketNumber: string } | null;
    announcementId: string | null;
};

export function NotificationList({ complaintHrefPrefix }: { complaintHrefPrefix: string }) {
    const [items, setItems] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        fetch("/api/notifications", { cache: "no-store" })
            .then((response) => response.ok ? response.json() as Promise<{ notifications: Notification[] }> : null)
            .then((result) => {
                if (active && result) setItems(result.notifications);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    async function markRead(id: string) {
        await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        setItems((current) => current.map((item) => (item.id === id ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item)));
    }

    async function markAllRead() {
        await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
        setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    }

    const unreadCount = items.filter((item) => !item.readAt).length;

    return (
        <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-[var(--ink)]">Notifikasi</h1>
                    <p className="mt-1 text-sm text-[var(--muted)]">{unreadCount} belum dibaca</p>
                </div>
                {unreadCount > 0 && (
                    <button type="button" onClick={() => void markAllRead()} className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--ink)]">
                        Tandai semua dibaca
                    </button>
                )}
            </div>

            {loading ? (
                <div className="mt-6 space-y-3">
                    {[0, 1, 2].map((index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-white" />)}
                </div>
            ) : items.length === 0 ? (
                <p className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-8 text-sm text-[var(--muted)]">Belum ada notifikasi.</p>
            ) : (
                <div className="mt-6 space-y-3">
                    {items.map((item) => {
                        const href = item.complaint ? `${complaintHrefPrefix}/${item.complaint.ticketNumber}` : item.announcementId ? "/pengumuman" : null;
                        const inner = (
                            <>
                                <div className="flex items-start justify-between gap-3">
                                    <p className={`font-semibold ${item.readAt ? "text-[var(--muted)]" : "text-[var(--ink)]"}`}>{item.title}</p>
                                    {!item.readAt && <span className="size-2 shrink-0 rounded-full bg-[var(--leaf)]" />}
                                </div>
                                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.message}</p>
                                <div className="mt-2 flex items-center justify-between gap-3">
                                    <time className="text-xs text-[var(--muted)]">{new Date(item.createdAt).toLocaleString("id-ID")}</time>
                                    {!item.readAt && <button type="button" onClick={() => void markRead(item.id)} className="text-xs font-semibold text-[var(--brand)]">Tandai dibaca</button>}
                                </div>
                            </>
                        );
                        return href ? (
                            <Link href={href} key={item.id} className="block rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:shadow-md">
                                {inner}
                            </Link>
                        ) : (
                            <div key={item.id} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
                                {inner}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
