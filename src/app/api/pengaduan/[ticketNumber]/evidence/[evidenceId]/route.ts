import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessComplaint } from "@/lib/access";
import { servePrivateBlob } from "@/lib/blob-storage";
export const runtime = "nodejs";
export async function GET(request:Request,{params}:{params:Promise<{ticketNumber:string;evidenceId:string}>}) {
 const session = await getServerSession(authOptions);
 if(!session?.user.id) return new Response("Tidak terautentikasi.",{status:401});
 const {ticketNumber,evidenceId}=await params;
 const complaint=await prisma.complaint.findUnique({where:{ticketNumber},select:{reporterUserId:true,evidences:{where:{id:evidenceId},select:{path:true,mimeType:true}}}});
 if(!complaint || !complaint.evidences.length) return new Response("Bukti tidak ditemukan.",{status:404});
 if(!canAccessComplaint({id:session.user.id,role:session.user.role},complaint)) return new Response("Akses ditolak.",{status:403});
 const evidence=complaint.evidences[0];
 return servePrivateBlob(evidence.path,request,evidence.mimeType);
}
