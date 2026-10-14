import { prisma } from "@/lib/prisma";
import { servePrivateBlob } from "@/lib/blob-storage";
export const runtime = "nodejs";
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
 const {id}=await params;
 const item=await prisma.galleryMedia.findFirst({where:{id,published:true},select:{storageKey:true,mimeType:true}});
 if(!item || !["image/jpeg","image/png","image/webp"].includes(item.mimeType)) return new Response("Tidak ditemukan.",{status:404});
 // Intentionally public static assets are bundled with the deployment.
 if(/^\/images\/[^/\\]+\.(png|jpe?g|webp)$/i.test(item.storageKey)) return Response.redirect(new URL(item.storageKey,request.url));
 return servePrivateBlob(item.storageKey,request,item.mimeType);
}
