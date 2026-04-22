import fs from 'fs';

const path = 'src/services/dal.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace .select(String('xyz')) with .select('xyz')
// The regex finds .select(String(' and replaces it with .select('
// and then the closing ')) replaces with ')
content = content.replace(/\.select\(String\('([^']+)'\)\)/g, ".select('$1')");

fs.writeFileSync(path, content);
console.log("Fixed String() wrapping in dal.ts");
