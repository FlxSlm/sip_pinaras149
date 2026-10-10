export function validateProfileImage(file: File, bytes: Buffer): string | null {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (file.size === 0 || file.size > 5 * 1024 * 1024) return null;
    if (file.type === "image/jpeg" && ["jpg", "jpeg"].includes(extension ?? "") && bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
    if (file.type === "image/png" && extension === "png" && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
    if (file.type === "image/webp" && extension === "webp" && bytes.length >= 12 && bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") return "webp";
    return null;
}
