import { get, head } from "@vercel/blob";
import { canReadLocalUploads, isLocalUploadReference } from "@/lib/local-upload-storage";

export function isStoredMediaReference(reference: string) {
 return isPrivateBlobReference(reference) || (canReadLocalUploads() && isLocalUploadReference(reference));
}

export function isPrivateBlobReference(reference: string) {
 if (/^sipp\/[a-z]+\/[a-f0-9-]+\.(jpg|jpeg|png|webp|pdf|mp4|webm)$/.test(reference)) return true;
 try { const url = new URL(reference); return url.protocol === "https:" && /^[a-z0-9-]+\.private\.blob\.vercel-storage\.com$/.test(url.hostname) && !url.username && !url.password; } catch { return false; }
}
export async function readBlobPrefix(reference: string) {
 const result = await get(reference, {access:"private", useCache:false, headers:{Range:"bytes=0-15"}});
 if (!result || result.statusCode !== 200) throw new Error("Media unavailable");
 const reader = result.stream.getReader();
 const bytes = new Uint8Array(16); let length = 0;
 try { while(length<16) { const chunk = await reader.read(); if(chunk.done) break; const part = chunk.value.subarray(0,16-length); bytes.set(part,length); length+=part.length; } }
 finally { await reader.cancel(); }
 return bytes.subarray(0,length);
}
export function parseByteRange(value: string | null, size: number): { kind: "full" } | { kind: "partial"; start: number; end: number } | { kind: "invalid" } {
 if (!value) return {kind:"full"};
 const match = /^bytes=(\d*)-(\d*)$/.exec(value);
 if (!match || (!match[1] && !match[2]) || size<=0) return {kind:"invalid"};
 const start = match[1] ? Number(match[1]) : Math.max(0,size-Number(match[2]));
 const end = match[1] && match[2] ? Math.min(size-1,Number(match[2])) : size-1;
 if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start<0 || start>=size || end<start || (!match[1] && Number(match[2])<=0)) return {kind:"invalid"};
 return {kind:"partial",start,end};
}
// Call only after authorization/publication checks. Never return the private URL.
export async function servePrivateBlob(reference: string | null, request?: Request, expectedMime?: string) {
 if(reference && isLocalUploadReference(reference) && !canReadLocalUploads()) return new Response("Tidak ditemukan.", {status:404});
 if(reference?.startsWith("storage/") && process.env.NODE_ENV==="development" && !process.env.VERCEL) {
  const {serveLocalDevelopmentMedia}=await import("@/lib/legacy-local-media");
  return serveLocalDevelopmentMedia(reference,request,expectedMime);
 }
 const missing = () => new Response("Tidak ditemukan.", {status:404,headers:{"Cache-Control":"private, no-store"}});
 if (!reference || !isPrivateBlobReference(reference)) return missing();
 try {
  const metadata = await head(reference);
  if (expectedMime && metadata.contentType !== expectedMime) return missing();
  const range = parseByteRange(request?.headers.get("range") ?? null, metadata.size);
  const headers = new Headers({"Content-Type":metadata.contentType,"X-Content-Type-Options":"nosniff","Cache-Control":"private, no-store","Accept-Ranges":"bytes"});
  if(range.kind==="invalid") { headers.set("Content-Range", "bytes */"+metadata.size); return new Response(null,{status:416,headers}); }
  const partial = range.kind==="partial";
  const result = await get(reference,{access:"private",useCache:false,...(partial ? {headers:{Range:`bytes=${range.start}-${range.end}`}} : {})});
  if(!result || result.statusCode!==200) return missing();
  if(partial) {
   // A store that ignores Range must not be mislabeled as a partial response.
   if(result.headers.get("content-range") !== `bytes ${range.start}-${range.end}/${metadata.size}`) { await result.stream.cancel(); return new Response("Rentang media belum tersedia.",{status:502,headers}); }
   headers.set("Content-Range",`bytes ${range.start}-${range.end}/${metadata.size}`);
   headers.set("Content-Length",String(range.end-range.start+1));
  } else headers.set("Content-Length",String(metadata.size));
  return new Response(result.stream,{status:partial?206:200,headers});
 } catch { return missing(); }
}
