export const imageFileAccept = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";
export function isHeicImage(file: Pick<File, "name" | "type">) {
    return /\.(heic|heif)$/i.test(file.name) || ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"].includes(file.type);
}
