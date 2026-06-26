import { PrismaClient } from '@/lib/generated/prisma/client';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

// Prisma 6 CLI resolves file: paths relative to schema location (prisma/).
// Next.js bundles route handlers into .next/server/..., so relative paths resolve
// against that directory instead. Convert to absolute so both CLI and runtime
// hit the same physical file.
if (process.env.DATABASE_URL?.startsWith('file:./')) {
  const filename = process.env.DATABASE_URL.slice('file:./'.length);
  process.env.DATABASE_URL = `file:${path.join(process.cwd(), 'prisma', filename)}`;
}

// Auto-setup: migrate + seed on first run so `npm run dev` just works.
if (process.env.NODE_ENV !== 'production') {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  if (!existsSync(dbPath)) {
    console.log('📦 Database not found — running setup...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });
      execSync('npx prisma db seed', { stdio: 'inherit', env: process.env });
      console.log('✅ Database ready');
    } catch {
      console.error('❌ Auto-setup failed — run npm run db:setup manually');
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
