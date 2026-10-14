import { prisma } from "@/lib/prisma";
import { defaultOrganization, publicOrganization, type StoredMember } from "@/lib/organization";
import { isStoredMediaReference } from "@/lib/blob-storage";

export async function getOrganization() {
    const row = await prisma.siteContent.findUnique({ where: { key: "struktur" } });
    const value = row?.value as { members?: unknown } | undefined;
    const members = defaultOrganization();
    if (Array.isArray(value?.members)) for (const member of members) {
        const stored = value.members.find((entry): entry is StoredMember => Boolean(entry && typeof entry === "object" && "id" in entry && entry.id === member.id));
        if (stored && typeof stored.name === "string" && stored.name.length <= 160) member.name = stored.name;
        if (stored && typeof stored.photoRef === "string" && isStoredMediaReference(stored.photoRef)) member.photoRef = stored.photoRef;
    }
    return { members, publicMembers: publicOrganization(members, row?.updatedAt.toISOString() ?? "reference") };
}
