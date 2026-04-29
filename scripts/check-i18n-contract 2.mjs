import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COMPONENTS_DIR = path.join(__dirname, '../src/components');

const FORBIDDEN_PATTERNS = [
  'getLocalizedCategory',
  'getLocalizedRole',
  'getLocalizedRarity',
  '\\.series_name',
  '\\.title_tr',
  '\\.title_en',
  '\\.rarity_label',
];

const regex = new RegExp(`(${FORBIDDEN_PATTERNS.join('|')})`, 'g');

let hasViolation = false;

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const matches = content.match(regex);
      
      if (matches) {
        console.error(`\n🚨 [i18n Contract Violation] Forbidden pattern(s) found in: ${fullPath}`);
        console.error(`Matches: ${[...new Set(matches)].join(', ')}`);
        console.error(`Components must NOT perform localization or read raw DB fields. Use centralized displayMappers instead.`);
        hasViolation = true;
      }
    }
  }
}

console.log('🔍 Scanning src/components for i18n contract violations...');
scanDirectory(COMPONENTS_DIR);

if (hasViolation) {
  console.error('\n❌ Static i18n contract validation FAILED. Please fix the violations above.');
  process.exit(1);
} else {
  console.log('\n✅ Static i18n contract validation PASSED.');
  process.exit(0);
}
