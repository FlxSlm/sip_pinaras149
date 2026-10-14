"use client";
import { put } from "@vercel/blob/client";
import { validUploadMetadata, type UploadKind } from "@/lib/upload-rules";
import { isHeicImage } from "@/lib/image-files";

export async function normalizeUploadImage(file: File) {
 if (!isHeicImage(file)) return file;
 if (!file.size || file.size > 5 * 1024 * 1024) throw new Error("Foto HEIC maksimal 5 MB.");
 try {
  const { heicTo } = await import("heic-to/csp");
  const jpeg = await heicTo({ blob: file, type: "image/jpeg", quality: 0.8 });
  if (jpeg.size > 5 * 1024 * 1024) throw new Error("Foto hasil konversi melebihi 5 MB. Pilih foto dengan ukuran lebih kecil.");
  return new File([jpeg], file.name.replace(/\.(heic|heif)$/i, "") + ".jpg", { type: "image/jpeg", lastModified: file.lastModified });
 } catch (error) { throw new Error(error instanceof Error && error.message.startsWith("Foto hasil") ? error.message : "Foto HEIC belum dapat dibaca. Pilih foto lain atau ekspor sebagai JPG."); }
}

export async function uploadPrivateFile(file: File, kind: UploadKind) {
 if (["PROFILE", "EVIDENCE", "STRUCTURE"].includes(kind)) file = await normalizeUploadImage(file);
 if(!validUploadMetadata(kind,file.name,file.type,file.size)) throw new Error("Jenis atau ukuran lampiran tidak valid.");
 const response = await fetch("/api/uploads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,name:file.name,mimeType:file.type,sizeBytes:file.size})});
 const intent = await response.json().catch(() => null) as {id?:string;pathname?:string;clientToken?:string;uploadUrl?:string;message?:string} | null;
 if(!response.ok) throw new Error(intent?.message ?? "Upload belum tersedia.");
 const local = typeof intent?.uploadUrl === "string" && intent.uploadUrl === `/api/uploads/${intent.id}/local`;
 const blob = intent?.uploadUrl === undefined && typeof intent?.pathname === "string" && intent.pathname.length > 0 && typeof intent?.clientToken === "string" && intent.clientToken.length > 0;
 if (typeof intent?.id !== "string" || !intent.id || (!local && !blob)) throw new Error("Persiapan unggahan belum lengkap. Muat ulang halaman lalu pilih berkas kembali.");
 if (local) {
  const uploaded = await fetch(intent.uploadUrl!, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!uploaded.ok) { const result = await uploaded.json().catch(() => ({})); throw new Error(result.message ?? "Lampiran belum dapat diunggah."); }
 } else {
  try { await put(intent.pathname!,file,{access:"private",token:intent.clientToken!,contentType:file.type,multipart:file.size>4*1024*1024}); }
  catch { throw new Error("Lampiran belum dapat diunggah. Periksa koneksi lalu coba kembali."); }
 }
 return intent.id;
}
