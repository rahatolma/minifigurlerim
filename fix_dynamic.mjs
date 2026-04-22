import fs from 'fs';

const pages = [
  'src/app/[locale]/(public)/page.tsx',
  'src/app/[locale]/(public)/explore/page.tsx',
  'src/app/[locale]/(public)/seriler/page.tsx',
  'src/app/[locale]/(public)/figurler/page.tsx'
];

pages.forEach(page => {
  if (fs.existsSync(page)) {
    let content = fs.readFileSync(page, 'utf8');
    
    // Remove export const revalidate = 86400; if it exists
    content = content.replace(/export const revalidate = \d+;[^\n]*\n/g, '');
    
    // Remove export const dynamic = ... if it exists
    content = content.replace(/export const dynamic = '[^']+';[^\n]*\n/g, '');
    
    // Add export const dynamic = 'force-dynamic'; right after imports
    const importMatch = content.match(/import [^\n]+;\n+(?!import)/);
    if (importMatch) {
      const splitIndex = importMatch.index + importMatch[0].length;
      content = content.slice(0, splitIndex) + "\nexport const dynamic = 'force-dynamic';\n" + content.slice(splitIndex);
      fs.writeFileSync(page, content);
      console.log(`Added force-dynamic to ${page}`);
    } else {
        console.log(`Could not find imports in ${page}`);
    }
  } else {
      console.log(`${page} does not exist.`);
  }
});
