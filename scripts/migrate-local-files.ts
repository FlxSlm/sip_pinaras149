import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { put } from "@vercel/blob";
import { readFile, mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { validMediaSignature } from "../src/lib/upload-rules";
loadEnvConfig(process.cwd(), true, {info(){},error(){}});
async function main() {
 const apply = process.argv.includes("--apply");
 if(apply && (!process.argv.includes("--confirm-target") || process.env.VERCEL_ENV==="production" || process.env.NODE_ENV==="production")) throw new Error("Apply requires an explicitly confirmed nonproduction target");
 if(apply && !process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Missing private Blob configuration");
 const connectionString=process.env.DIRECT_URL ?? process.env.DATABASE_URL;
 if(!connectionString) throw new Error("Missing database");
 const pool=new Pool({connectionString,connectionTimeoutMillis:5000,max:1});
 const prisma=new PrismaClient({adapter:new PrismaPg(pool)});
 const counts={mode:apply?"apply":"dry-run",localReferences:0,filesAvailable:0,filesMissing:0,invalidFiles:0,updated:0,concurrentChanges:0};
 try {
  const rows:Array<{type:"profile"|"evidence"|"announcement"|"gallery";id:string;ref:string;mime:string}>=[];
  for(const item of await prisma.user.findMany({where:{customImage:{startsWith:"storage/"}},select:{id:true,customImage:true}})) rows.push({type:"profile",id:item.id,ref:item.customImage!,mime:""});
  for(const item of await prisma.complaintEvidence.findMany({where:{path:{startsWith:"storage/"}},select:{id:true,path:true,mimeType:true}})) rows.push({type:"evidence",id:item.id,ref:item.path,mime:item.mimeType});
  for(const item of await prisma.announcement.findMany({where:{mediaRef:{startsWith:"storage/"}},select:{id:true,mediaRef:true}})) rows.push({type:"announcement",id:item.id,ref:item.mediaRef!,mime:""});
  for(const item of await prisma.galleryMedia.findMany({where:{storageKey:{startsWith:"storage/"}},select:{id:true,storageKey:true,mimeType:true}})) rows.push({type:"gallery",id:item.id,ref:item.storageKey,mime:item.mimeType});
  for(const row of rows) {
   counts.localReferences++;
   const root=path.resolve("storage",({profile:"profile",evidence:"evidence",announcement:"announcements",gallery:"gallery"})[row.type]);
   const absolute=path.resolve(row.ref);
   if(!absolute.startsWith(root+path.sep)) {counts.invalidFiles++;continue;}
   const bytes=await readFile(absolute).catch(()=>null);
   if(!bytes) {counts.filesMissing++;continue;} counts.filesAvailable++;
   const extension=path.extname(absolute).slice(1).toLowerCase();
   const mime=({jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",pdf:"application/pdf",mp4:"video/mp4",webm:"video/webm"} as Record<string,string>)[extension];
   const max=mime?.startsWith("video/")?50*1024*1024:mime==="application/pdf"?10*1024*1024:5*1024*1024;
   if(!mime || !bytes.length || bytes.length>max || (row.mime && row.mime!==mime) || !validMediaSignature(mime,bytes)) {counts.invalidFiles++;continue;}
   if(!apply) continue;
   await mkdir(".deployment-qa",{recursive:true});
   await appendFile(".deployment-qa/storage-reference-backup.jsonl",JSON.stringify(row)+"\n");
   const blob=await put(`sipp/${row.type}/${randomUUID()}.${extension}`,bytes,{access:"private",contentType:mime,addRandomSuffix:false});
   const result=row.type==="profile"?await prisma.user.updateMany({where:{id:row.id,customImage:row.ref},data:{customImage:blob.url}}):
    row.type==="evidence"?await prisma.complaintEvidence.updateMany({where:{id:row.id,path:row.ref},data:{path:blob.url,mimeType:mime,sizeBytes:bytes.length}}):
    row.type==="announcement"?await prisma.announcement.updateMany({where:{id:row.id,mediaRef:row.ref},data:{mediaRef:blob.url}}):
    await prisma.galleryMedia.updateMany({where:{id:row.id,storageKey:row.ref},data:{storageKey:blob.url,mimeType:mime,sizeBytes:bytes.length}});
   if(result.count) counts.updated++; else counts.concurrentChanges++;
  }
  console.log(JSON.stringify(counts));
  if(counts.filesMissing || counts.invalidFiles || counts.concurrentChanges) process.exitCode=1;
 } finally {await prisma.$disconnect();await pool.end();}
}
main().catch(()=>{console.error("Migrasi file gagal; periksa target, konfigurasi, dan backup. Detail privat tidak dicetak.");process.exitCode=1;});
