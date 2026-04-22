import fs from 'fs';
const path = 'src/services/action_dal.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replaceAll('series(slug_tr, slug_en)', 'series(id, title, title_en, slug_tr, slug_en)');

fs.writeFileSync(path, content);
console.log("Updated select queries in action_dal.ts");
