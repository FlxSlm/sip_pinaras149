import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
const m=vi.hoisted(()=>({session:vi.fn(),count:vi.fn(),create:vi.fn(),token:vi.fn()}));
vi.mock("next-auth",()=>({getServerSession:m.session}));
vi.mock("@/lib/auth",()=>({authOptions:{}}));
vi.mock("@/lib/prisma",()=>({prisma:{uploadIntent:{count:m.count,create:m.create}}}));
vi.mock("@vercel/blob/client",()=>({generateClientTokenFromReadWriteToken:m.token}));
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv("BLOB_READ_WRITE_TOKEN","synthetic-token");m.session.mockResolvedValue({user:{id:"owner",role:"WARGA"}});m.count.mockResolvedValue(0);m.token.mockResolvedValue("scoped-client-token");});
afterEach(() => vi.unstubAllEnvs());
const request=(data:unknown={kind:"EVIDENCE",name:"file.png",mimeType:"image/png",sizeBytes:16})=>new Request("http://localhost/api/uploads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
describe("direct client uploads",()=>{
 it("rejects guest before issuing token",async()=>{m.session.mockResolvedValue(null);expect((await POST(request())).status).toBe(401);expect(m.token).not.toHaveBeenCalled();});
 it("rejects warga announcement uploads",async()=>{expect((await POST(request({kind:"PDF",name:"p.pdf",mimeType:"application/pdf",sizeBytes:16}))).status).toBe(403);expect(m.token).not.toHaveBeenCalled();});
 it("rejects MIME-extension mismatch before issuing token",async()=>{expect((await POST(request({kind:"PROFILE",name:"p.exe",mimeType:"image/png",sizeBytes:16}))).status).toBe(400);expect(m.token).not.toHaveBeenCalled();});
 it("missing Blob never falls back to filesystem",async()=>{vi.stubEnv("BLOB_READ_WRITE_TOKEN","");expect((await POST(request())).status).toBe(503);expect(m.create).not.toHaveBeenCalled();});
 it("offers a private local upload only for loopback development, without a Blob token",async()=>{vi.stubEnv("BLOB_READ_WRITE_TOKEN","");vi.stubEnv("NODE_ENV","development");vi.stubEnv("VERCEL","");vi.stubEnv("DATABASE_URL","postgresql://localhost/sipp_test");const response=await POST(request());const body=await response.json();expect(response.status).toBe(200);expect(body.uploadUrl).toMatch(/^\/api\/uploads\/[a-f0-9-]+\/local$/);expect(body.pathname).toBeUndefined();expect(body.clientToken).toBeUndefined();expect(m.token).not.toHaveBeenCalled();});
 it("issues token for server-generated path with exact MIME/size and no overwrite",async()=>{const response=await POST(request());const body=await response.json();expect(response.status).toBe(200);expect(body.pathname).toMatch(/^sipp\/evidence\/[a-f0-9-]+\.png$/);expect(m.token).toHaveBeenCalledWith(expect.objectContaining({pathname:body.pathname,allowedContentTypes:["image/png"],maximumSizeInBytes:16,validUntil:expect.any(Number),allowOverwrite:false,addRandomSuffix:false}));expect(m.create.mock.calls[0][0].data).toMatchObject({ownerId:"owner",kind:"EVIDENCE",mimeType:"image/png",sizeBytes:16});expect(response.headers.get("cache-control")).toBe("private, no-store");expect(JSON.stringify(body)).not.toContain("synthetic-token");});
 it("limits active uploads per user",async()=>{m.count.mockResolvedValue(20);expect((await POST(request())).status).toBe(429);expect(m.token).not.toHaveBeenCalled();});
});
