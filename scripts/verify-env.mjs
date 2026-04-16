import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
console.log('🛡️  [Verify-Env] Checking project stability shield...');

const cwd = process.cwd();

// 1. Dependency Integrity Check
const criticalModules = [
  '@sentry/nextjs',
  '@opentelemetry/api', // Historical failure point
  '@supabase/ssr',
  'next'
];

let failed = false;

for (const mod of criticalModules) {
  try {
    const modPath = path.join(cwd, 'node_modules', mod, 'package.json');
    if (!fs.existsSync(modPath)) {
      throw new Error('Not found');
    }
  } catch (err) {
    console.error(`❌ [Verify-Env] CRITICAL MODULE MISSING OR CORRUPT: ${mod}`);
    failed = true;
  }
}

if (failed) {
  console.error('\n🚨 [Verify-Env] DEPENDENCY SHIELD FAILED!');
  console.error('👉 The node_modules directory appears to be corrupted or missing required critical dependencies.');
  console.error('👉 Action Required: Run `npm ci` to cleanly rebuild the environment.');
  process.exit(1);
}

console.log('✅ [Verify-Env] Module shield intact. Proceeding to startup...\n');
