import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { prisma } from './src/lib/prisma';

async function main() {
    const migrations = await prisma.$queryRawUnsafe(`SELECT migration_name, checksum FROM _prisma_migrations`);
    console.log(migrations);
}

main().catch(console.error).finally(() => prisma.$disconnect());

main().catch(console.error).finally(() => prisma.$disconnect());
