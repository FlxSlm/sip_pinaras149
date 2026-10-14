import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./[ticketNumber]/evidence/[evidenceId]/route";
const m=vi.hoisted(()=>({session:vi.fn(),find:vi.fn(),serve:vi.fn()}));
vi.mock("next-auth",()=>({getServerSession:m.session}));
vi.mock("@/lib/auth",()=>({authOptions:{}}));
vi.mock("@/lib/prisma",()=>({prisma:{complaint:{findUnique:m.find}}}));
vi.mock("@/lib/blob-storage",()=>({servePrivateBlob:m.serve}));
beforeEach(()=>{vi.clearAllMocks();m.find.mockResolvedValue({reporterUserId:"owner",evidences:[{path:"private-key",mimeType:"image/png"}]});m.serve.mockResolvedValue(new Response("image"));});
const request=new Request("http://localhost/api/evidence");
const params={params:Promise.resolve({ticketNumber:"fixture",evidenceId:"image"})};
describe("evidence ownership enforced before storage",()=>{
 it("guest cannot access",async()=>{m.session.mockResolvedValue(null);expect((await GET(request,params)).status).toBe(401);expect(m.find).not.toHaveBeenCalled();});
 it("warga B cannot fetch warga A's evidence",async()=>{m.session.mockResolvedValue({user:{id:"other",role:"WARGA"}});expect((await GET(request,params)).status).toBe(403);expect(m.serve).not.toHaveBeenCalled();});
 it.each([{id:"owner",role:"WARGA"},{id:"admin",role:"ADMIN_KELURAHAN"}])("owner/admin can stream after access check %j",async(user)=>{m.session.mockResolvedValue({user});expect((await GET(request,params)).status).toBe(200);expect(m.serve).toHaveBeenCalledWith("private-key",request,"image/png");});
});
