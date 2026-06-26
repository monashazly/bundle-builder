import '@testing-library/jest-dom';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

// Bootstrap test DB once if it doesn't exist yet
if (!existsSync('./prisma/test.db')) {
  execSync('npx prisma migrate deploy', {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
  execSync('npx prisma db seed', {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
}
