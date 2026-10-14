import type { PrismaClient } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { verifyPassword } from "@/lib/password";

export function nextLoginState(failures: number, now: number) {
    const count = failures + 1;
    // Saturate only at JavaScript's maximum representable date, never wrap.
    const until = count < 5 ? null : new Date(Math.min(8_640_000_000_000_000, now + 60_000 * 3 ** (count - 5)));
    return { failedAttempts: count, blockedUntil: until };
}

export async function verifyAdminLogin(db: PrismaClient, userId: string, password: string, hash: string) {
    return db.$transaction(async (tx) => {
        // Native INSERT avoids first-login races between server instances.
        await tx.$executeRaw(Prisma.sql`INSERT INTO "AdminLoginThrottle" ("userId", "failedAttempts") VALUES (${userId}, 0) ON CONFLICT ("userId") DO NOTHING`);
        const [state] = await tx.$queryRaw<Array<{ failedAttempts: number; blockedUntil: Date | null }>>(
            Prisma.sql`SELECT "failedAttempts", "blockedUntil" FROM "AdminLoginThrottle" WHERE "userId" = ${userId} FOR UPDATE`,
        );
        const now = Date.now();
        if (state.blockedUntil && state.blockedUntil.getTime() > now) return { accepted: false, blockedUntil: state.blockedUntil, attemptsRemaining: 0 };
        if (verifyPassword(password, hash)) {
            await tx.adminLoginThrottle.update({ where: { userId }, data: { failedAttempts: 0, blockedUntil: null } });
            return { accepted: true, blockedUntil: null, attemptsRemaining: 5 };
        }
        const next = nextLoginState(state.failedAttempts, now);
        await tx.adminLoginThrottle.update({ where: { userId }, data: next });
        // Return instead of throwing: failed-attempt state must commit.
        return { accepted: false, blockedUntil: next.blockedUntil, attemptsRemaining: Math.max(0, 5 - next.failedAttempts) };
    });
}
