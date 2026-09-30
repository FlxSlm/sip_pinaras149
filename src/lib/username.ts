import { z } from "zod";

export const usernameSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username minimal 3 karakter.")
    .max(24, "Username maksimal 24 karakter.")
    .regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/, "Username hanya boleh berisi huruf, angka, titik, dan tanda hubung.");

const reservedUsernames = new Set([
    "admin",
    "api",
    "auth",
    "login",
    "petugas",
    "profile",
    "system",
    "warga",
]);

export function isReservedUsername(username: string): boolean {
    return reservedUsernames.has(username);
}