import fs from 'fs';

const files = [
  'src/app/[locale]/(public)/figurler/[seriesSlug]/[figureSlug]/page.tsx',
  'src/components/ui/CollectionActions.tsx',
  'src/components/ui/CollectorPodium.tsx'
];

files.forEach(path => {
  let content = fs.readFileSync(path, 'utf8');
  
  // Table Rows in page.tsx
  content = content.replace('label="Figür Adı"', 'label="Minifigür Adı"');
  content = content.replace('label="Figür Sıra No"', 'label="Minifigür Sıra No"');
  content = content.replace('label="Figür Rolü"', 'label="Minifigür Rolü"');
  content = content.replace('label="Figür Tipi"', 'label="Minifigür Tipi"');
  content = content.replace('label="Figür Kodu"', 'label="Minifigür Kodu"');
  content = content.replace('Figür açıklaması girilmemiş', 'Minifigür açıklaması girilmemiş');
  content = content.replace('Figür Bulunamadı', 'Minifigür Bulunamadı');
  content = content.replace('Figür Bozuk', 'Minifigür Bozuk');
  
  // CollectionActions & CollectorPodium & page
  content = content.replaceAll('Figüre Puan Ver', 'Minifigüre Puan Ver');
  content = content.replaceAll('Figürü Oyla', 'Minifigürü Oyla');
  content = content.replaceAll('Figürü Değerlendir', 'Minifigürü Değerlendir');
  content = content.replaceAll('bu figürün kalitesini', 'bu minifigürün kalitesini');
  content = content.replaceAll('Bu figür kasana', 'Bu minifigür kasana');
  content = content.replaceAll('Bu figürü ilk değerlendiren', 'Bu minifigürü ilk değerlendiren');
  content = content.replaceAll('Bu figürde henüz', 'Bu minifigürde henüz');
  content = content.replaceAll('Bu figüre olan', 'Bu minifigüre olan');
  
  fs.writeFileSync(path, content);
  console.log(`Updated ${path}`);
});
