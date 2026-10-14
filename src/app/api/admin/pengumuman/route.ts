import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prepareUploads, consumeUploads, UploadError } from "@/lib/uploads";
import { saveAnnouncementAttachments } from "@/lib/save-announcement-attachments";
import { attachmentViews } from "@/lib/announcement-attachments";
export const runtime = "nodejs";
const schema=z.object({title:z.string().trim().min(3).max(160),content:z.string().trim().min(1).max(20000),mediaType:z.enum(["TEXT","PDF","VIDEO"]),isPinned:z.boolean(),status:z.enum(["DRAFT","PUBLISHED"]).optional()});
const admin=(session:Session|null)=>Boolean(session?.user?.id && session.user.role==="ADMIN_KELURAHAN");
const slugify=(value:string)=>value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100);
async function notify(db:Prisma.TransactionClient,id:string,title:string,actor:string) {
 const users=await db.user.findMany({where:{id:{not:actor}},select:{id:true}});
 if(users.length) await db.notification.createMany({data:users.map(user=>({recipientId:user.id,type:"ANNOUNCEMENT_PUBLISHED",title:"Pengumuman baru",message:title,announcementId:id}))});
}
const fail=(error:unknown)=>Response.json({message:error instanceof UploadError?error.message:"Pengumuman belum dapat disimpan."},{status:error instanceof UploadError?error.status:500});
async function save(request:Request,session:Session,editing:boolean) {
 const form=await request.formData().catch(()=>null);
 if(!form) return Response.json({message:"Format tidak valid."},{status:400});
 const parsed=schema.safeParse({title:form.get("title"),content:form.get("content"),mediaType:form.get("mediaType") || "TEXT",isPinned:["on","true"].includes(String(form.get("isPinned"))),status:form.get("status") ?? undefined});
 if(!parsed.success || form.has("media")) return Response.json({message:"Data tidak valid. Lampiran harus diunggah langsung ke penyimpanan."},{status:400});
 const id=String(form.get("id") ?? "");
 if(editing && !id) return Response.json({message:"ID tidak valid."},{status:400});
 const existing=editing ? await prisma.announcement.findUnique({where:{id},include:{attachments:{orderBy:{sortOrder:"asc"}}}}) : null;
 if(editing && !existing) return Response.json({message:"Pengumuman tidak ditemukan."},{status:404});
 const data=parsed.data;
 const status=data.status ?? (existing?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
 const uploadId=String(form.get("mediaUploadId") ?? "");
 let mediaRef:string|null=null;
 try {
  if (form.has("attachmentUploads") || form.has("retainedAttachmentIds")) {
   if (form.has("mediaUploadId")) throw new UploadError("Format lampiran tidak boleh dicampur.");
   await saveAnnouncementAttachments(form,session.user.id,existing,{title:data.title,content:data.content,isPinned:data.isPinned,status});
   return Response.json({message:editing?"Pengumuman diperbarui.":"Pengumuman disimpan."},{status:editing?200:201});
  }
  if (existing?.attachments?.length) throw new UploadError("Gunakan editor lampiran terbaru untuk memperbarui pengumuman ini.");
  if(data.mediaType!=="TEXT") {
   if(uploadId) { const [file]=await prepareUploads(prisma,[uploadId],session.user.id,data.mediaType); mediaRef=file.path; }
   else if(existing?.mediaType===data.mediaType && existing.mediaRef) mediaRef=existing.mediaRef;
   else return Response.json({message:`Lampiran ${data.mediaType} wajib diunggah.`},{status:400});
  } else if(uploadId) return Response.json({message:"Pengumuman teks tidak memakai lampiran."},{status:400});
  await prisma.$transaction(async tx=>{
   if(uploadId && data.mediaType!=="TEXT") await consumeUploads(tx,[uploadId],session.user.id,data.mediaType);
   const publishedAt=status==="PUBLISHED" ? existing?.status==="PUBLISHED" ? existing.publishedAt : new Date() : existing?.publishedAt ?? null;
   const fields={title:data.title,content:data.content,mediaType:data.mediaType,isPinned:data.isPinned,status,publishedAt,mediaRef};
   const item=existing ? await tx.announcement.update({where:{id},data:fields}) : await tx.announcement.create({data:{...fields,slug:`${slugify(data.title)||"pengumuman"}-${crypto.randomUUID()}`,createdById:session.user.id}});
   if(status==="PUBLISHED" && existing?.status!=="PUBLISHED") await notify(tx,item.id,data.title,session.user.id);
  });
  return Response.json({message:editing?"Pengumuman diperbarui.":status==="PUBLISHED"?"Pengumuman diterbitkan.":"Pengumuman disimpan sebagai draft."},{status:editing?200:201});
 } catch(error) {return fail(error);}
}
export async function GET() {
 const session=await getServerSession(authOptions);
 if(!admin(session)) return Response.json({message:"Akses ditolak."},{status:403});
 const items=await prisma.announcement.findMany({orderBy:[{isPinned:"desc"},{createdAt:"desc"}],include:{attachments:{orderBy:{sortOrder:"asc"}}}});
 return Response.json(items.map(({mediaRef,attachments,...item})=>({...item,status:item.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",hasMedia:Boolean(mediaRef),attachments:attachmentViews({...item,mediaRef,attachments})})),{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(request:Request) {
 const session=await getServerSession(authOptions);
 if(!admin(session)) return Response.json({message:"Akses ditolak."},{status:403});
 return save(request,session!,false);
}
export async function PATCH(request:Request) {
 const session=await getServerSession(authOptions);
 if(!admin(session)) return Response.json({message:"Akses ditolak."},{status:403});
 if(request.headers.get("content-type")?.includes("multipart/form-data")) return save(request,session!,true);
 const parsed=z.object({id:z.string().min(1),action:z.enum(["publish","unpublish"])}).safeParse(await request.json().catch(()=>null));
 if(!parsed.success) return Response.json({message:"Aksi tidak valid."},{status:400});
 try {
  await prisma.$transaction(async tx=>{
   const existing=await tx.announcement.findUnique({where:{id:parsed.data.id}});
   if(!existing) throw new UploadError("Pengumuman tidak ditemukan.",404);
   const publish=parsed.data.action==="publish";
   await tx.announcement.update({where:{id:existing.id},data:{status:publish?"PUBLISHED":"DRAFT",...(publish?{publishedAt:existing.status==="PUBLISHED"?existing.publishedAt:new Date()}: {})}});
   if(publish && existing.status!=="PUBLISHED") await notify(tx,existing.id,existing.title,session!.user.id);
  });
  return Response.json({message:"Status diperbarui."});
 } catch(error) {return fail(error);}
}
export async function DELETE(request:Request) {
 const session=await getServerSession(authOptions);
 if(!admin(session)) return Response.json({message:"Akses ditolak."},{status:403});
 const parsed=z.object({id:z.string().min(1)}).safeParse(await request.json().catch(()=>null));
 if(!parsed.success) return Response.json({message:"ID tidak valid."},{status:400});
 try {await prisma.announcement.delete({where:{id:parsed.data.id}});return Response.json({message:"Pengumuman dihapus."});} catch {return Response.json({message:"Pengumuman tidak ditemukan."},{status:404});}
}
