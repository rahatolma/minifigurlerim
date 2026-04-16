import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve('./src');

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fullPath.includes('/node_modules/') || fullPath.includes('/dist/')) continue;
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
      let code = fs.readFileSync(fullPath, 'utf8');
      
      const catchRegex = /catch\s*\(\s*([^)]+)\s*\)\s*\{/g;
      
      let newCode = "";
      let lastIndex = 0;
      let match;
      let mutated = false;
      
      while ((match = catchRegex.exec(code)) !== null) {
          const catchStart = match.index;
          const braceIndex = catchStart + match[0].length - 1;
          
          // Find the closing brace
          let open = 1;
          let closeIndex = -1;
          for(let i = braceIndex + 1; i < code.length; i++) {
              if (code[i] === '{') open++;
              if (code[i] === '}') open--;
              if (open === 0) {
                  closeIndex = i;
                  break;
              }
          }
          
          if (closeIndex !== -1) {
              const body = code.substring(braceIndex + 1, closeIndex);
              const errNameMatch = match[1].split(':')[0].trim(); // "err: any" -> "err"
              
              if (!body.includes('unstable_rethrow') && !body.includes('throw ') && !body.includes('console.error') && !body.includes('Sentry.captureException') && !body.includes('captureDalError')) {
                  mutated = true;
                  newCode += code.substring(lastIndex, braceIndex + 1);
                  newCode += `\nconsole.error(${errNameMatch});`;
                  newCode += body;
                  newCode += "}";
                  lastIndex = closeIndex + 1;
              }
          }
      }
      
      newCode += code.substring(lastIndex);
      
      if (mutated) {
         fs.writeFileSync(fullPath, newCode, 'utf8');
         console.log('Fixed', fullPath.replace(process.cwd(), ''));
      }
    }
  }
}

walkDir(ROOT_DIR);
