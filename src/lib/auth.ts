import { scryptSync, timingSafeEqual } from "node:crypto";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const oauthProviders = [
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
        ? GoogleProvider({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })
        : null,
].filter((provider): provider is NonNullable<typeof provider> => provider !== null);

const baseAdapter = PrismaAdapter(
    prisma as unknown as Parameters<typeof PrismaAdapter>[0],
);

function normalizeUsername(value: string): string {
    const normalized = value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.+|\.+$/g, "")
        .slice(0, 24);

    return normalized || "warga";
}

async function createUniqueUsername(value: string): Promise<string> {
    const base = normalizeUsername(value);
    let username = base;
    let suffix = 2;

    while (await prisma.user.findUnique({ where: { username } })) {
        username = `${base.slice(0, 24 - String(suffix).length - 1)}-${suffix}`;
        suffix += 1;
    }

    return username;
}

const adapter: Adapter = {
    ...baseAdapter,
    async createUser(user: AdapterUser) {
        const username = await createUniqueUsername(user.name ?? user.email.split("@")[0]);
        const createdUser = await prisma.user.create({
            data: {
                id: user.id,
                username,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                image: user.image,
            },
        });

        return createdUser as unknown as AdapterUser;
    },
};

function verifyPassword(password: string, encodedHash: string): boolean {
    const [algorithm, salt, encodedKey] = encodedHash.split(":");
    if (algorithm !== "scrypt" || !salt || !encodedKey) {
        return false;
    }

    try {
        const storedKey = Buffer.from(encodedKey, "hex");
        const derivedKey = scryptSync(password, salt, storedKey.length);
        return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
    } catch {
        return false;
    }
}

function normalizeStaffUsername(username: string): string {
    const normalized = username.trim().toLowerCase();
    const legacyEnvironment = normalized.match(/^kepala\.10([1-8])$/);
    return legacyEnvironment ? `kepala.l0${legacyEnvironment[1]}` : normalized;
}

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
            name: "Staff",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const username = typeof credentials?.username === "string" ? normalizeStaffUsername(credentials.username) : "";
                const password = typeof credentials?.password === "string" ? credentials.password : "";
                if (!username || !password) {
                    return null;
                }

                const user = await prisma.user.findUnique({ where: { username } });
                if (
                    !user ||
                    (user.role !== "kepala_lingkungan" && user.role !== "lurah") ||
                    !user.passwordHash ||
                    !verifyPassword(password, user.passwordHash)
                ) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    lingkunganId: user.lingkunganId,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.type === "oauth") {
                const profileData = profile as Record<string, unknown> | undefined;
                const providerNickname = [
                    profileData?.nickname,
                    profileData?.preferred_username,
                    profileData?.login,
                ].find((value): value is string => typeof value === "string" && value.length > 0);

                if (providerNickname && user.id) {
                    const existingUser = await prisma.user.findUnique({
                        where: { id: user.id },
                        select: { username: true, name: true, email: true },
                    });
                    const fallbackUsername = normalizeUsername(user.name ?? user.email?.split("@")[0] ?? "warga");

                    if (existingUser?.username === fallbackUsername && normalizeUsername(providerNickname) !== fallbackUsername) {
                        const username = await createUniqueUsername(providerNickname);
                        await prisma.user.update({ where: { id: user.id }, data: { username } });
                    }
                }

                return user.role === "warga" || !user.role;
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.userId = user.id;
                token.role = user.role;
                token.lingkunganId = user.lingkunganId;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token.userId && token.role) {
                session.user.id = token.userId;
                session.user.role = token.role;
                session.user.lingkunganId = token.lingkunganId ?? null;
            }

            return session;
        },
    },
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
};