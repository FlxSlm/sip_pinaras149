import { beforeEach, describe, expect, it, vi } from "vitest";
import { isPrivateBlobReference, servePrivateBlob } from "./blob-storage";
const m=vi.hoisted(()=>({head:vi.fn(),get:vi.fn()}));
vi.mock("@vercel/blob",()=>({head:m.head,get:m.get}));
beforeEach(()=>{vi.clearAllMocks();m.head.mockResolvedValue({size:100,contentType:"video/mp4"});m.get.mockResolvedValue({statusCode:200,stream:new ReadableStream({start(c){c.enqueue(new Uint8Array([1]));c.close();}}),headers:new Headers()});});
const ref="https://test.private.blob.vercel-storage.com/sipp/video/fixture.mp4";
describe("authorized private streaming",()=>{
 it("new development upload references cannot be served in production",async()=>{vi.stubEnv("NODE_ENV","production");expect((await servePrivateBlob("storage/uploads/video/00000000-0000-0000-0000-000000000000.mp4")).status).toBe(404);expect(m.head).not.toHaveBeenCalled();vi.unstubAllEnvs();});
 it("Vercel never reads a legacy local reference, including development deployments",async()=>{vi.stubEnv("NODE_ENV","development");vi.stubEnv("VERCEL","1");expect((await servePrivateBlob("storage/evidence/private.png")).status).toBe(404);expect(m.head).not.toHaveBeenCalled();vi.unstubAllEnvs();});
 it.each(["storage/evidence/private.png","https://attacker.local/x","https://test.public.blob.vercel-storage.com/x"])("refuses nonprivate reference %s",async(value)=>{expect(isPrivateBlobReference(value)).toBe(false);expect((await servePrivateBlob(value)).status).toBe(404);expect(m.head).not.toHaveBeenCalled();});
 it("streams rather than redirects or discloses the storage URL",async()=>{const response=await servePrivateBlob(ref);expect(response.status).toBe(200);expect(response.headers.get("location")).toBeNull();expect(response.headers.get("cache-control")).toBe("private, no-store");expect(m.get).toHaveBeenCalledWith(ref,{access:"private",useCache:false});});
 it("maps SDK 200/raw partial response to HTTP 206 correctly",async()=>{m.get.mockResolvedValue({...await m.get(),headers:new Headers({"Content-Range":"bytes 10-19/100"})});const response=await servePrivateBlob(ref,new Request("http://localhost/file",{headers:{Range:"bytes=10-19"}}));expect(response.status).toBe(206);expect(response.headers.get("content-range")).toBe("bytes 10-19/100");expect(response.headers.get("content-length")).toBe("10");});
 it("invalid ranges do not fetch file content",async()=>{expect((await servePrivateBlob(ref,new Request("http://localhost/file",{headers:{Range:"bytes=100-"}}))).status).toBe(416);expect(m.get).not.toHaveBeenCalled();});
 it("fails safely if storage ignores a range",async()=>{expect((await servePrivateBlob(ref,new Request("http://localhost/file",{headers:{Range:"bytes=10-19"}}))).status).toBe(502);});
});
