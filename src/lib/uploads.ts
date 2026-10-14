import { head } from "@vercel/blob";
import type { PrismaClient, Prisma } from "@/generated/prisma/client";
import { readBlobPrefix, isPrivateBlobReference } from "@/lib/blob-storage";
import { validMediaSignature, type UploadKind } from "@/lib/upload-rules";
import { isLocalUploadReference, readLocalUpload } from "@/lib/local-upload-storage";

export class UploadError extends Error { constructor(message="Lampiran belum valid atau sudah digunakan.", public status=400) {super(message);} }
export async function prepareUploads(db: Pick<PrismaClient,"uploadIntent">, ids: string[], ownerId: string, kind: UploadKind) {
 if(ids.length>8 || new Set(ids).size!==ids.length) throw new UploadError();
 const files = [];
 for(const id of ids) {
  const intent = await db.uploadIntent.findFirst({where:{id,ownerId,kind,consumedAt:null,expiresAt:{gt:new Date()}}});
  if(!intent) throw new UploadError();
  const local = isLocalUploadReference(intent.pathname);
  const metadata = local ? await readLocalUpload(intent.pathname).catch(()=>null) : await head(intent.pathname).catch(()=>null);
  if(!metadata || metadata.pathname!==intent.pathname || metadata.contentType!==intent.mimeType || metadata.size!==intent.sizeBytes || (!local && !isPrivateBlobReference(metadata.url))) throw new UploadError();
  const prefix = local ? (metadata as Awaited<ReturnType<typeof readLocalUpload>>).prefix : await readBlobPrefix(intent.pathname).catch(()=>null);
  if(!prefix || !validMediaSignature(intent.mimeType,prefix)) throw new UploadError("Isi file tidak sesuai dengan jenis lampiran.");
  files.push({path:metadata.url,mimeType:intent.mimeType,sizeBytes:metadata.size});
 }
 return files;
}
export async function consumeUploads(tx: Pick<Prisma.TransactionClient,"uploadIntent">, ids: string[], ownerId: string, kind: UploadKind) {
 if(!ids.length) return;
 const result = await tx.uploadIntent.updateMany({where:{id:{in:ids},ownerId,kind,consumedAt:null,expiresAt:{gt:new Date()}},data:{consumedAt:new Date()}});
 if(result.count!==ids.length) throw new UploadError();
}
