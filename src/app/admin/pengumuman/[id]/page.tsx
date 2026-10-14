import Link from "next/link";
import { getDashboardSession } from "@/lib/dashboard-session";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnnouncementContent } from "@/components/announcement-content";

export const dynamic = "force-dynamic";
export default async function AdminAnnouncementDetail({ params }: { params: Promise<{ id: string }> }) {
    const session = await getDashboardSession();
    if (!session?.user.id) redirect("/login");
    if (session.user.role !== "ADMIN_KELURAHAN") redirect("/warga");
    const { id } = await params;
    const item = await prisma.announcement.findUnique({ where: { id }, include: { attachments: { orderBy: { sortOrder: "asc" } } } });
    if (!item) notFound();
    return <><div className="mx-auto max-w-5xl"><Link href="/admin/pengumuman" className="ui-button ui-button-secondary mb-5">Kembali ke pengelolaan</Link><article className="rounded-xl border border-[var(--line)] bg-white p-5 sm:p-8"><p className="public-kicker">{item.status === "PUBLISHED" ? "Terbit" : "Draft · hanya admin"} · {item.mediaType === "TEXT" ? "Teks" : item.mediaType}</p><h1 className="public-title">{item.title}</h1><p className="mt-4 border-b border-[var(--line)] pb-4 text-sm text-[var(--muted)]">{(item.publishedAt ?? item.createdAt).toLocaleDateString("id-ID", { timeZone: "Asia/Makassar" })}</p><AnnouncementContent attachments={item.attachments.map(({id,name,mediaType}) => ({id,name,mediaType,url:"/api/admin/pengumuman/"+item.id+"/attachments/"+id}))} title={item.title} content={item.content} mediaType={item.mediaType} mediaUrl={item.mediaRef ? `/api/admin/pengumuman/${item.id}/media` : undefined} />{item.status === "PUBLISHED" && <Link href={`/pengumuman/${item.slug}`} className="ui-button ui-button-secondary mt-6">Lihat halaman publik</Link>}</article></div></>;
}
