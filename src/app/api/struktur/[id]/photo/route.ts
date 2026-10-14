import { getOrganization } from "@/lib/organization-store";
import { servePrivateBlob } from "@/lib/blob-storage";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { members } = await getOrganization();
    return servePrivateBlob(members.find((member) => member.id === id)?.photoRef ?? null, request);
}
