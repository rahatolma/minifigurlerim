import fs from 'fs';

const files = [
  'src/app/admin/(protected)/figurler/[id]/page.tsx',
  'src/app/admin/(protected)/figurler/yeni/page.tsx'
];

files.forEach(path => {
  let content = fs.readFileSync(path, 'utf8');
  
  content = content.replaceAll('FİGÜR ADI', 'MİNİFİGÜR ADI');
  content = content.replaceAll('FİGÜR SIRA NO', 'MİNİFİGÜR SIRA NO');
  content = content.replaceAll('FİGÜR ROLÜ', 'MİNİFİGÜR ROLÜ');
  content = content.replaceAll('FİGÜR TİPİ', 'MİNİFİGÜR TİPİ');
  content = content.replaceAll('FİGÜR KODU', 'MİNİFİGÜR KODU');
  
  // also label/text cases:
  content = content.replaceAll('Figür Adı', 'Minifigür Adı');
  content = content.replaceAll('Figür Sıra No', 'Minifigür Sıra No');
  content = content.replaceAll('Figür Rolü', 'Minifigür Rolü');
  content = content.replaceAll('Figür Tipi', 'Minifigür Tipi');
  content = content.replaceAll('Figür Kodu', 'Minifigür Kodu');

  fs.writeFileSync(path, content);
  console.log(`Updated ${path}`);
});
