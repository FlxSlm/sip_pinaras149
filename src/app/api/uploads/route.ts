import { randomUUID } from "node:crypto";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadKinds, validUploadMetadata, uploadRoleAllowed } from "@/lib/upload-rules";
import { canUseLocalUploads } from "@/lib/local-upload-storage";
export const runtime = "nodejs";
const input = z.object({kind:z.enum(uploadKinds),name:z.string().min(1).max(200),mimeType:z.string().max(80),sizeBytes:z.number().int().positive()});
export async function POST(request:Request) {
 const session = await getServerSession(authOptions);
 if(!session?.user.id) return Response.json({message:"Tidak terautentikasi."},{status:401});
 const parsed = input.safeParse(await request.json().catch(()=>null));
 if(!parsed.success) return Response.json({message:"Metadata lampiran tidak valid."},{status:400});
 const data = parsed.data;
 if(!uploadRoleAllowed(data.kind,session.user.role)) return Response.json({message:"Akses ditolak."},{status:403});
 if(!validUploadMetadata(data.kind,data.name,data.mimeType,data.sizeBytes)) return Response.json({message:"Jenis atau ukuran lampiran tidak valid."},{status:400});
 const local = canUseLocalUploads();
 if(!process.env.BLOB_READ_WRITE_TOKEN && !local) return Response.json({message:"Penyimpanan lampiran belum dikonfigurasi."},{status:503});
 try {
  const active = await prisma.uploadIntent.count({where:{ownerId:session.user.id,consumedAt:null,expiresAt:{gt:new Date()}}});
  if(active>=20) return Response.json({message:"Terlalu banyak upload tertunda. Coba kembali setelah beberapa saat."},{status:429});
  const id = randomUUID(); const expiresAt = new Date(Date.now()+30*60*1000);
  const pathname = `${local ? "storage/uploads" : "sipp"}/${data.kind.toLowerCase()}/${id}.${data.name.split(".").pop()!.toLowerCase()}`;
  const clientToken = local ? null : await generateClientTokenFromReadWriteToken({token:process.env.BLOB_READ_WRITE_TOKEN,pathname,allowedContentTypes:[data.mimeType],maximumSizeInBytes:data.sizeBytes,validUntil:expiresAt.getTime(),addRandomSuffix:false,allowOverwrite:false});
  await prisma.uploadIntent.create({data:{id,pathname,ownerId:session.user.id,kind:data.kind,mimeType:data.mimeType,sizeBytes:data.sizeBytes,expiresAt}});
  return Response.json(local ? {id,uploadUrl:`/api/uploads/${id}/local`} : {id,pathname,clientToken},{headers:{"Cache-Control":"private, no-store"}});
 } catch {return Response.json({message:"Upload belum dapat disiapkan."},{status:503});}
}
