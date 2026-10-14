import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { complaintInputSchema, createComplaint } from "@/lib/complaints";
import { prisma } from "@/lib/prisma";
import { prepareUploads, consumeUploads, UploadError } from "@/lib/uploads";
export const runtime = "nodejs";
export async function POST(request:Request) {
 const session = await getServerSession(authOptions);
 if(!session?.user.id) return Response.json({message:"Tidak terautentikasi."},{status:401});
 if(session.user.role!=="WARGA") return Response.json({message:"Akses ditolak."},{status:403});
 const form = await request.formData().catch(()=>null);
 if(!form) return Response.json({message:"Format permintaan tidak valid."},{status:400});
 const parsed = complaintInputSchema.safeParse({title:form.get("title"),category:form.get("category"),description:form.get("description"),location:form.get("location") || undefined,neighborhood:form.get("neighborhood") ?? undefined});
 if(!parsed.success) return Response.json({message:parsed.error.issues[0]?.message ?? "Data tidak valid."},{status:400});
 if(form.getAll("evidence").length) return Response.json({message:"Unggah bukti melalui penyimpanan file terlebih dahulu."},{status:400});
 let ids:unknown;
 try { ids = JSON.parse(String(form.get("evidenceUploadIds") ?? "[]")); } catch {ids=null;}
 if(!Array.isArray(ids) || ids.some(id=>typeof id!=="string") || ids.length>8) return Response.json({message:"Daftar bukti tidak valid. Maksimal 8 foto."},{status:400});
 try {
  const evidence = await prepareUploads(prisma,ids,session.user.id,"EVIDENCE");
  const complaint = await createComplaint(prisma,parsed.data,session.user.id,evidence,tx=>consumeUploads(tx,ids,session.user.id,"EVIDENCE"));
  return Response.json({message:"Pengaduan berhasil dikirim.",complaint},{status:201});
 } catch(error) {return Response.json({message:error instanceof UploadError ? error.message : "Pengaduan tidak dapat disimpan."},{status:error instanceof UploadError ? error.status : 500});}
}
