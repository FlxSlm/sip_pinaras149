import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, encodedHash: string): boolean {
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
