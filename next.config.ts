import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Fix: a package-lock.json in the home dir confuses Next.js workspace root detection.
  // This pins file tracing to the actual project root.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
