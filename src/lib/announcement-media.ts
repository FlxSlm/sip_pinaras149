import { servePrivateBlob } from "@/lib/blob-storage";
export { parseByteRange } from "@/lib/blob-storage";
export async function serveAnnouncementMedia(mediaRef:string|null,request:Request) {
 return servePrivateBlob(mediaRef,request);
}
