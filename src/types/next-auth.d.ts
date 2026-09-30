import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/generated/prisma/client";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: UserRole;
            lingkunganId: string | null;
        } & DefaultSession["user"];
    }

    interface User {
        role?: UserRole;
        lingkunganId?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId?: string;
        role?: UserRole;
        lingkunganId?: string | null;
    }
}