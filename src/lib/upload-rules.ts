export const uploadKinds = ["PROFILE", "EVIDENCE", "PDF", "VIDEO", "STRUCTURE"] as const;
export type UploadKind = typeof uploadKinds[number];
const imageTypes: Record<string, string[]> = { "image/jpeg": ["jpg", "jpeg"], "image/png": ["png"], "image/webp": ["webp"] };
export const uploadRules = {
 PROFILE: { types: imageTypes, max: 5 * 1024 * 1024 },
 EVIDENCE: { types: imageTypes, max: 5 * 1024 * 1024 },
 STRUCTURE: { types: imageTypes, max: 5 * 1024 * 1024 },
 PDF: { types: { "application/pdf": ["pdf"] }, max: 10 * 1024 * 1024 },
 VIDEO: { types: { "video/mp4": ["mp4"], "video/webm": ["webm"] }, max: 50 * 1024 * 1024 },
} as const;
export function validUploadMetadata(kind: UploadKind, name: string, mime: string, size: number) {
 const extensions = (uploadRules[kind].types as Record<string,string[]>)[mime];
 return Boolean(extensions?.includes(name.split(".").pop()?.toLowerCase() ?? "") && Number.isSafeInteger(size) && size > 0 && size <= uploadRules[kind].max);
}
export function uploadRoleAllowed(kind: UploadKind, role: string) {
 return role === "ADMIN_KELURAHAN" ? kind !== "EVIDENCE" : role === "WARGA" && (kind === "PROFILE" || kind === "EVIDENCE");
}
export function validMediaSignature(mime: string, bytes: Uint8Array) {
 const matches = (offset:number, values:number[]) => values.every((value,index)=>bytes[offset+index]===value);
 if (mime === "image/jpeg") return matches(0,[255,216,255]);
 if (mime === "image/png") return matches(0,[137,80,78,71,13,10,26,10]);
 if (mime === "image/webp") return matches(0,[82,73,70,70]) && matches(8,[87,69,66,80]);
 if (mime === "application/pdf") return matches(0,[37,80,68,70,45]);
 if (mime === "video/mp4") return matches(4,[102,116,121,112]);
 if (mime === "video/webm") return matches(0,[26,69,223,163]);
 return false;
}
