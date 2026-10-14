import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { parseByteRange } from "@/lib/blob-storage";
import { canReadLocalUploads, isLocalUploadReference } from "@/lib/local-upload-storage";

// Read compatibility for existing local development records only; no local writes.
export async function serveLocalDevelopmentMedia(reference:string,request?:Request,expectedMime?:string) {
 const allowed = (canReadLocalUploads() && isLocalUploadReference(reference)) || /^storage\/(profile|evidence|announcements|gallery)\/[^/\\]+\.(jpg|jpeg|png|webp|pdf|mp4|webm)$/.test(reference);
 if(process.env.NODE_ENV!=="development" || process.env.VERCEL || !allowed) return new Response("Tidak ditemukan.",{status:404});
 const root=path.resolve("storage");
 const absolute=path.resolve(reference);
 if(!absolute.startsWith(root+path.sep)) return new Response("Tidak ditemukan.",{status:404});
 const mime=({jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",pdf:"application/pdf",mp4:"video/mp4",webm:"video/webm"} as Record<string,string>)[path.extname(reference).slice(1)];
 if(expectedMime && expectedMime!==mime) return new Response("Tidak ditemukan.",{status:404});
 try {
  const {size}=await stat(absolute);
  if(size===0) return new Response("Tidak ditemukan.",{status:404});
  const range=parseByteRange(request?.headers.get("range") ?? null,size);
  const headers=new Headers({"Content-Type":mime,"X-Content-Type-Options":"nosniff","Cache-Control":"private, no-store","Accept-Ranges":"bytes"});
  if(range.kind==="invalid"){headers.set("Content-Range","bytes */"+size);return new Response(null,{status:416,headers});}
  const start=range.kind==="partial"?range.start:0,end=range.kind==="partial"?range.end:size-1;
  headers.set("Content-Length",String(end-start+1));
  if(range.kind==="partial") headers.set("Content-Range",`bytes ${start}-${end}/${size}`);
  return new Response(Readable.toWeb(createReadStream(absolute,{start,end})) as ReadableStream<Uint8Array>,{status:range.kind==="partial"?206:200,headers});
 } catch {return new Response("Tidak ditemukan.",{status:404});}
}
