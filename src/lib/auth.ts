import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { verifyAdminLogin } from "@/lib/admin-login";
import { getAuthRedirectUrl, isUserRole } from "@/lib/authorization";

const oauthProviders = [
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
        ? GoogleProvider({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })
        : null,
].filter((provider): provider is NonNullable<typeof provider> => provider !== null);

const adapter = PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]);

export const authOptions: NextAuthOptions = {
    adapter,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers: [
        ...oauthProviders,
        CredentialsProvider({
            name: "Admin Kelurahan",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const username = typeof credentials?.username === "string" ? credentials.username.trim().toLowerCase() : "";
                const password = typeof credentials?.password === "string" ? credentials.password : "";
                if (!username || !password || username.length > 120 || password.length > 256) {
                    return null;
                }

                let user;
                try {
                    user = await prisma.user.findUnique({
                        where: { username },
                        select: { id: true, name: true, email: true, role: true, passwordHash: true },
                    });
                } catch {
                    // NextAuth serializes thrown authorize messages into an error URL.
                    // Never send a raw database error to the login page.
                    throw new Error("Configuration");
                }
                if (
                    !user ||
                    user.role !== "ADMIN_KELURAHAN" ||
                    !user.passwordHash
                ) {
                    return null;
                }

                let verification;
                try { verification = await verifyAdminLogin(prisma, user.id, password, user.passwordHash); }
                catch { throw new Error("Configuration"); }
                if (verification.blockedUntil) throw new Error(`AdminLoginLocked:${verification.blockedUntil.getTime()}`);
                if (!verification.accepted) throw new Error(`AdminLoginInvalid:${verification.attemptsRemaining}`);

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.type === "oauth") {
                return account.provider === "google" && (profile as { email_verified?: boolean } | undefined)?.email_verified !== false && (user.role === "WARGA" || !user.role);
            }
            return account?.type === "credentials" && user.role === "ADMIN_KELURAHAN";
        },
        async redirect({ url, baseUrl }) {
            return getAuthRedirectUrl(url, baseUrl);
        },
        async jwt({ token, user }) {
            if (user) {
                // Use the persisted SIPP user ID and role, never a provider ID or
                // an arbitrary WARGA default for incomplete authentication data.
                const identity = isUserRole(user.role) ? user : await prisma.user.findUnique({
                    where: { id: user.id }, select: { id: true, role: true },
                });
                if (!identity?.id || !isUserRole(identity.role)) throw new Error("SessionRequired");
                token.userId = identity.id;
                token.role = identity.role;
            }
            if (!token.userId || !isUserRole(token.role)) throw new Error("SessionRequired");
            return token;
        },
        async session({ session, token }) {
            if (!session.user || !token.userId || !isUserRole(token.role)) throw new Error("SessionRequired");
            session.user.id = token.userId;
            session.user.role = token.role;
            return session;
        },
    },
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
};
