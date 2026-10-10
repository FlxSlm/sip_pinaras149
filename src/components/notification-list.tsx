"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button, Card, EmptyState, LoadingState, Notice } from "@/components/ui/primitives";

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
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);
    const [pending, setPending] = useState(false);

    useEffect(() => {
        let active = true;
        fetch("/api/notifications", { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) throw new Error("Notification request failed");
                return response.json() as Promise<{ notifications: Notification[] }>;
            })
            .then((result) => { if (active) setItems(result.notifications); })
            .catch(() => { if (active) setError("Notifikasi belum dapat dimuat. Periksa koneksi lalu coba kembali."); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [attempt]);

    function reload() {
        setLoading(true);
        setError("");
        setAttempt((value) => value + 1);
    }

    async function markRead(id?: string) {
        setPending(true);
        setError("");
        try {
            const response = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(id ? { id } : {}),
            });
            if (!response.ok) throw new Error("Notification update failed");
            setItems((current) => current.map((item) => (!id || item.id === id ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item)));
        } catch {
            setError("Notifikasi belum berhasil ditandai dibaca. Silakan coba kembali.");
        } finally {
            setPending(false);
        }
    }

    const unreadCount = items.filter((item) => !item.readAt).length;

    return (
        <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">Aktivitas Anda</p>
                    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Notifikasi</h1>
                    <p className="mt-2 text-sm text-[var(--muted)]">{loading ? "Memuat notifikasi…" : `${unreadCount} notifikasi belum dibaca`}</p>
                </div>
                {unreadCount > 0 && <Button variant="secondary" disabled={pending} onClick={() => void markRead()}><Icon name="check" />Tandai semua dibaca</Button>}
            </div>
            {error && <Notice tone="error" className="mt-5"><p>{error}</p>{items.length === 0 && <Button variant="secondary" onClick={reload} className="mt-3">Coba kembali</Button>}</Notice>}
            <div className="mt-6">
                {loading ? <LoadingState label="Memuat notifikasi Anda…" /> : items.length === 0 ? (
                    !error && <Card><EmptyState title="Belum ada notifikasi" description="Pembaruan pengaduan dan informasi kelurahan akan tampil di sini." /></Card>
                ) : (
                    <Card className="divide-y divide-[var(--line)] overflow-hidden">
                        {items.map((item) => {
                            const href = item.complaint ? `${complaintHrefPrefix}/${item.complaint.ticketNumber}` : item.announcementId ? "/pengumuman" : null;
                            return (
                                <article key={item.id} className={`flex items-start gap-3 p-4 sm:gap-4 sm:p-5 ${item.readAt ? "" : "bg-[var(--surface)]"}`}>
                                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><Icon name={item.announcementId ? "announcement" : "bell"} /></span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <h2 className="text-sm font-semibold leading-6">{href ? <Link href={href} className="hover:text-[var(--brand)] hover:underline">{item.title}</Link> : item.title}</h2>
                                            {!item.readAt && <span aria-label="Belum dibaca" className="mt-2 size-2 shrink-0 rounded-full bg-[var(--brand)]" />}
                                        </div>
                                        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.message}</p>
                                        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                                            <time dateTime={item.createdAt} className="text-xs text-[var(--muted)]">{new Date(item.createdAt).toLocaleString("id-ID")}</time>
                                            <div className="flex flex-wrap gap-2">
                                                {href && <Link href={href} className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-[var(--brand-dark)] hover:underline">Lihat detail<Icon name="arrow" className="size-4" /></Link>}
                                                {!item.readAt && <Button variant="ghost" disabled={pending} onClick={() => void markRead(item.id)} className="px-3 text-xs">Tandai dibaca</Button>}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </Card>
                )}
            </div>
        </div>
    );
}
