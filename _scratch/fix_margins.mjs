import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/app/[locale]/(public)', filePath => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replaceAll('pb-32', 'pb-16');
    
    if (filePath.includes('seriler/page.tsx')) {
       content = content.replaceAll("pb-24", "pb-12");
       content = content.replaceAll("mb-12", "mb-6");
    }

    if (original !== content) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed margins in:', filePath);
    }
  }
});
