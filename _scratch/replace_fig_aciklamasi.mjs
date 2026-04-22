import fs from 'fs';

const files = [
  'src/app/admin/(protected)/figurler/yeni/page.tsx',
  'src/app/admin/(protected)/figurler/[id]/page.tsx'
];

files.forEach(path => {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replaceAll('Figür Açıklaması', 'Minifigür Açıklaması');
  fs.writeFileSync(path, content);
  console.log(`Updated ${path}`);
});
