import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    });
    const pathname = request.nextUrl.pathname;
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);

    if (!token) {
        return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/warga") && token.role !== "warga") {
        return NextResponse.redirect(new URL("/petugas", request.url));
    }

    if (pathname.startsWith("/petugas") && token.role === "warga") {
        return NextResponse.redirect(new URL("/warga", request.url));
    }

    if (pathname.startsWith("/petugas/lurah") && token.role !== "lurah") {
        return NextResponse.redirect(new URL("/petugas", request.url));
    }

    if (pathname.startsWith("/petugas/lingkungan") && token.role !== "kepala_lingkungan") {
        return NextResponse.redirect(new URL("/petugas", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/warga/:path*", "/petugas/:path*"],
};