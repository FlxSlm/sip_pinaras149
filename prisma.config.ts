import { loadEnvConfig } from "@next/env";
import { defineConfig, env } from "prisma/config";

loadEnvConfig(process.cwd());

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx prisma/seed.ts",
    },
    datasource: {
        // CLI migrations use the direct URL; runtime DATABASE_URL may be pooled.
        url: process.env.DIRECT_URL ?? env("DATABASE_URL"),
    },
});
