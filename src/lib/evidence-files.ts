export function mergeEvidenceFiles(current: File[], incoming: File[]) {
    const files = [...current];
    const errors: string[] = [];
    for (const file of incoming) {
        const extension = file.name.split(".").pop()?.toLowerCase();
        const valid = (file.type === "image/jpeg" && ["jpg", "jpeg"].includes(extension ?? "")) || (file.type === "image/png" && extension === "png") || (file.type === "image/webp" && extension === "webp");
        if (!valid || file.size === 0 || file.size > 5 * 1024 * 1024) { errors.push(`${file.name}: pilih JPG, PNG, atau WEBP maksimal 5 MB.`); continue; }
        if (!files.some((f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)) files.push(file);
    }
    return { files, errors };
}
