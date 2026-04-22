const fs = require('fs');
const code = fs.readFileSync('src/app/admin/(protected)/page.tsx', 'utf8');

// extract the return statement
const returnMatch = code.match(/return \(([\s\S]*?)\);\n}/);
if (!returnMatch) { console.log('no return found'); process.exit(1); }
const body = returnMatch[1];

let open = 0;
let lines = body.split('\n');
lines.forEach((line, i) => {
  const openMatches = line.match(/<div/g) || [];
  const closeMatches = line.match(/<\/div>/g) || [];
  const selfCloseMatches = line.match(/<div[^>]*\/>/g) || [];
  
  open += openMatches.length;
  open -= closeMatches.length;
  open -= selfCloseMatches.length; // because self-close is also counted in <div
  console.log(`${i+1}: ${open} | ${line.trim()}`);
});
console.log('Final open divs:', open);
