import { del } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { servePrivateBlob, isPrivateBlobReference } from "@/lib/blob-storage";
import { prepareUploads, consumeUploads, UploadError } from "@/lib/uploads";
export const runtime = "nodejs";
export async function GET(request?: Request) {
 const session = await getServerSession(authOptions);
 if(!session?.user.id) return new Response("Tidak terautentikasi.",{status:401});
 const user = await prisma.user.findUnique({where:{id:session.user.id},select:{customImage:true}});
 return servePrivateBlob(user?.customImage ?? null, request);
}
export async function POST(request:Request) {
 const session = await getServerSession(authOptions);
 if(!session?.user.id) return Response.json({message:"Tidak terautentikasi."},{status:401});
 if(!["WARGA","ADMIN_KELURAHAN"].includes(session.user.role)) return Response.json({message:"Akses ditolak."},{status:403});
 const body = await request.json().catch(()=>null);
 if(typeof body?.uploadId!=="string") return Response.json({message:"Gunakan upload foto yang telah disiapkan."},{status:400});
 try {
  const [photo] = await prepareUploads(prisma,[body.uploadId],session.user.id,"PROFILE");
  await prisma.$transaction(async tx=>{
   await consumeUploads(tx,[body.uploadId],session.user.id,"PROFILE");
   await tx.user.update({where:{id:session.user.id},data:{customImage:photo.path}});
  });
  return Response.json({message:"Foto profil diperbarui."});
 } catch(error) {return Response.json({message:error instanceof UploadError ? error.message : "Foto belum dapat disimpan."},{status:error instanceof UploadError ? error.status : 500});}
}
export async function DELETE() {
 const session = await getServerSession(authOptions);
 if(!session?.user.id) return Response.json({message:"Tidak terautentikasi."},{status:401});
 const user = await prisma.user.findUnique({where:{id:session.user.id},select:{customImage:true}});
 // Clear the reference first. Only delete that user's captured image, never a request URL.
 await prisma.user.update({where:{id:session.user.id},data:{customImage:null}});
 if(user?.customImage && isPrivateBlobReference(user.customImage)) await del(user.customImage).catch(()=>undefined);
 return Response.json({message:"Foto profil dihapus."});
}
