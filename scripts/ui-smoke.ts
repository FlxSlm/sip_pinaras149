import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", { info() {}, error() {} });

async function main() {
    const { prisma } = await import("../src/lib/prisma");
    const origin = "http://localhost:3000";
    const cookies = new Map<string, string>();
    async function request(path: string, init: RequestInit = {}) {
        const response = await fetch(origin + path, { ...init, redirect: "manual", headers: { ...init.headers, Cookie: Array.from(cookies, ([key, value]) => key + "=" + value).join("; ") } });
        for (const header of response.headers.getSetCookie()) { const pair = header.split(";")[0]; const separator = pair.indexOf("="); cookies.set(pair.slice(0, separator), pair.slice(separator + 1)); }
        return response;
    }
    try {
        for (const path of ["/", "/pengumuman", "/pengaduan", "/offline"]) {
            const response = await request(path); const html = await response.text();
            console.log(JSON.stringify({ publicPath: path, status: response.status, sharedHeaderPresent: html.includes("Navigasi publik"), sharedFooterPresent: html.includes("Navigasi footer") }));
            if (response.status !== 200 || !html.includes("Navigasi publik") || !html.includes("Navigasi footer")) process.exitCode = 1;
        }
        const user = await prisma.user.findUnique({ where: { username: "admin.pinaras" }, select: { image: true, customImage: true } });
        const published = await prisma.announcement.findFirst({ where: { status: "PUBLISHED" }, select: { id: true, slug: true, mediaType: true } });
        const draft = await prisma.announcement.findFirst({ where: { status: "DRAFT" }, select: { id: true, slug: true } });
        const csrf = await (await request("/api/auth/csrf")).json();
        await request("/api/auth/callback/credentials", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ csrfToken: csrf.csrfToken, username: "admin.pinaras", password: process.env.ADMIN_SEED_PASSWORD ?? "", callbackUrl: origin + "/admin", json: "true" }) });
        const session = await (await request("/api/auth/session")).json();
        const loggedIn = session.user?.role === "ADMIN_KELURAHAN";
        console.log(JSON.stringify({ adminLoginWorks: loggedIn, profileSource: { customPhotoPresent: Boolean(user?.customImage), providerPhotoPresent: Boolean(user?.image), customPhotoUsesBlob: user?.customImage?.includes("blob.vercel-storage.com") ?? false, blobTokenConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN) } }));
        if (!loggedIn) { process.exitCode = 1; return; }
        const photo = await request("/api/profile/photo");
        if (user?.image?.startsWith("/images/")) { const provider = await request(user.image); console.log(JSON.stringify({ defaultProfilePhotoUsesLocalAsset: true, defaultProfilePhotoExists: provider.status === 200 })); }
        console.log(JSON.stringify({ privatePhoto: { status: photo.status, imageContentType: photo.headers.get("content-type")?.startsWith("image/") ?? false, noStore: photo.headers.get("cache-control")?.includes("no-store") ?? false } }));
        for (const path of ["/admin", "/admin/pengumuman", "/admin/profil", "/admin/konten"]) { const response = await request(path); console.log(JSON.stringify({ adminPath: path, status: response.status })); if (response.status !== 200) process.exitCode = 1; }
        if (published) {
            const detail = await request("/pengumuman/" + encodeURIComponent(published.slug));
            const html = await detail.text();
            const preview = await request("/admin/pengumuman/" + encodeURIComponent(published.id));
            console.log(JSON.stringify({ publishedDetailStatus: detail.status, sharedHeaderOnDetail: html.includes("Navigasi publik"), adminDetailStatus: preview.status, mediaType: published.mediaType }));
            if (detail.status !== 200 || !html.includes("Navigasi publik") || preview.status !== 200) process.exitCode = 1;
        }
        if (draft) {
            const privateDetail = await request("/admin/pengumuman/" + encodeURIComponent(draft.id));
            const publicDetail = await request("/pengumuman/" + encodeURIComponent(draft.slug));
            const html = await publicDetail.text();
            const hidden = publicDetail.status === 404 || html.includes("NEXT_HTTP_ERROR_FALLBACK;404");
            console.log(JSON.stringify({ draftAdminDetailStatus: privateDetail.status, draftHiddenFromPublic: hidden, draftPublicStatus: publicDetail.status }));
            if (privateDetail.status !== 200 || !hidden) process.exitCode = 1;
        }
    } finally { await prisma.$disconnect(); }
}
main().catch(() => { console.log("UI smoke test failed; private details withheld."); process.exitCode = 1; });
