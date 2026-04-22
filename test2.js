const fs = require('fs');
const code = fs.readFileSync('src/app/admin/(protected)/page.tsx', 'utf8');

const returnMatch = code.match(/return \(([\s\S]*?)\);\n}/);
const body = returnMatch[1];

let open = 0;
let lines = body.split('\n');
lines.forEach((line, i) => {
  const lineNoString = line.replace(/(['"`]).*?\1/g, ''); // rough string removal to avoid matching div in classNames
  
  const openMatches = lineNoString.match(/<div/g) || [];
  const closeMatches = lineNoString.match(/<\/div>/g) || [];
  const selfCloseMatches = lineNoString.match(/<div[^>]*\/>/g) || [];
  
  open += openMatches.length;
  open -= closeMatches.length;
  open -= selfCloseMatches.length;
  
  console.log(`${i+1}: [depth: ${open}] | ${line.trim()}`);
});
console.log('Final open divs:', open);
