const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/\/admin/g, '/cto');
  // Revert /cto/api or similar if they existed, but we only want to change routing admin
  // Wait, `createAdminClient` from `@/utils/supabase/admin` will become `@/utils/supabase/cto`. We should NOT rename that.
  newContent = newContent.replace(/@\/utils\/supabase\/cto/g, '@/utils/supabase/admin');
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated: ' + filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir('./src');
