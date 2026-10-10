export const publicAnnouncementSelect = { id: true, slug: true, title: true, content: true, mediaType: true, mediaRef: true, isPinned: true, publishedAt: true, createdAt: true, updatedAt: true } as const;
export type AnnouncementCardData = { id: string; slug: string; title: string; excerpt: string; mediaType: string; hasMedia: boolean; isPinned: boolean; date: string; revision: string };
export function toAnnouncementCard(item: { id: string; slug: string; title: string; content: string; mediaType: string; mediaRef: string | null; isPinned: boolean; publishedAt: Date | null; createdAt: Date; updatedAt: Date }): AnnouncementCardData {
    return { id: item.id, slug: item.slug, title: item.title, excerpt: item.content.replace(/\s+/g, " ").trim().slice(0, 210), mediaType: item.mediaType, hasMedia: Boolean(item.mediaRef), isPinned: item.isPinned, date: (item.publishedAt ?? item.createdAt).toISOString(), revision: item.updatedAt.toISOString() };
}
