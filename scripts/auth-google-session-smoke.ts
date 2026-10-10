import { loadEnvConfig } from "@next/env";
import { encode } from "next-auth/jwt";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", { info() {}, error() {} });

// Read-only adapter lookup + locally signed session. This does not perform
// Google's consent screen or authorization-code exchange, and writes no users.
async function main() {
    const { authOptions } = await import("../src/lib/auth");
    const { prisma } = await import("../src/lib/prisma");
    try {
        const account = await prisma.account.findFirst({ where: { provider: "google", user: { role: "WARGA" } }, select: { provider: true, providerAccountId: true } });
        if (!account || !authOptions.secret || !authOptions.adapter?.getUserByAccount) throw new Error("Unavailable fixture");
        const user = await authOptions.adapter.getUserByAccount(account);
        if (!user || user.role !== "WARGA") throw new Error("Invalid fixture");
        const jwtCallback = authOptions.callbacks!.jwt as unknown as (value: unknown) => Promise<Record<string, unknown>>;
        const token = await jwtCallback({ token: {}, user });
        const encrypted = await encode({ token, secret: authOptions.secret, maxAge: 300 });
        const request = (path: string) => fetch(`http://localhost:3000${path}`, { redirect: "manual", headers: { Cookie: `next-auth.session-token=${encrypted}` } });
        const session = await (await request("/api/auth/session")).json();
        const dashboard = await request("/warga");
        const wrongRole = await request("/admin");
        const login = await request("/login?callbackUrl=%2Fadmin");
        const html = await login.text();
        const meta = html.match(/<meta[^>]*http-equiv="refresh"[^>]*content="[^\"]*url=([^\"]+)"/i)?.[1];
        const path = (response: Response) => response.headers.get("location") ? new URL(response.headers.get("location")!, "http://localhost:3000").pathname : null;
        const checks = {
            adapterLookupWorks: true,
            persistedUserIdPreserved: session.user?.id === user.id,
            sessionRoleWarga: session.user?.role === "WARGA",
            wargaDashboardWorks: dashboard.status === 200,
            wargaCannotAccessAdmin: path(wrongRole) === "/warga",
            existingSessionLoginRedirectsToWarga: path(login) === "/warga" || meta === "/warga",
            realGoogleOAuthExchangeTested: false,
        };
        console.log(JSON.stringify(checks));
        if (Object.entries(checks).some(([key, value]) => key !== "realGoogleOAuthExchangeTested" && !value)) process.exitCode = 1;
    } finally { await prisma.$disconnect(); }
}
main().catch(() => { console.log("Google session smoke test failed; secret details withheld."); process.exitCode = 1; });
