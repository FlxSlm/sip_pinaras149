import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    });
    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith("/petugas")) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);

    if (!token) {
        return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/warga") && token.role !== "WARGA") {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname.startsWith("/admin") && token.role !== "ADMIN_KELURAHAN") {
        return NextResponse.redirect(new URL("/warga", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/warga/:path*", "/admin/:path*", "/petugas/:path*"],
};
