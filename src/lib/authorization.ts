import type { UserRole } from "@/generated/prisma/client";

export function isUserRole(role: unknown): role is UserRole {
    return role === "WARGA" || role === "ADMIN_KELURAHAN";
}

export function getRoleHome(role: UserRole | undefined): string {
    if (role === "ADMIN_KELURAHAN") return "/admin";
    if (role === "WARGA") return "/warga";
    return "/login";
}

export function getInternalCallbackPath(value: unknown, baseUrl = "http://sipp.invalid"): string | null {
    if (typeof value !== "string" || !value || /[\\\u0000-\u001f]/.test(value)) return null;
    try {
        const base = new URL(baseUrl);
        const url = new URL(value, base);
        if (url.origin !== base.origin || !value.startsWith("/") && !value.startsWith(`${base.origin}/`)) return null;
        if (/[\\\u0000-\u001f]/.test(decodeURIComponent(url.pathname))) return null;
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return null;
    }
}

export function getLoginDestination(role: UserRole | undefined, callbackUrl?: unknown): string {
    const home = getRoleHome(role);
    if (!isUserRole(role)) return home;
    const path = getInternalCallbackPath(callbackUrl);
    if (!path) return home;
    const pathname = new URL(path, "http://sipp.invalid").pathname;
    return pathname === home || pathname.startsWith(`${home}/`) ? path : home;
}

export function getAuthRedirectUrl(url: string, baseUrl: string): string {
    const path = getInternalCallbackPath(url, baseUrl);
    const pathname = path ? new URL(path, baseUrl).pathname : "";
    // The redirect callback is also used by signOut, so retain the public root.
    if (!path || pathname === "/login" || pathname.startsWith("/api/auth")) return new URL("/warga", baseUrl).href;
    return new URL(path, baseUrl).href;
}
