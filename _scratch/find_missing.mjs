import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/["']/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  function split(row) {
    let res = [], cur = '', inQ = false;
    for(let i=0; i<row.length; i++){
      let c = row[i];
      if(inQ){
        if(c==='"' && row[i+1]==='"') { cur+='"'; i++; }
        else if(c==='"') inQ=false;
        else cur+=c;
      } else {
        if(c==='"') inQ=true;
        else if(c===',') { res.push(cur); cur=''; }
        else cur+=c;
      }
    }
    res.push(cur); return res;
  }
  const hdrs = split(lines[0]).map(h=>h.replace(/^\uFEFF/,'').trim());
  let rows = [];
  for(let i=1; i<lines.length; i++){
    let c = split(lines[i]);
    let o = {};
    hdrs.forEach((h,idx)=> o[h]=c[idx]||null);
    rows.push(o);
  }
  return rows;
}

async function run() {
  const csvFigs = parseCSV('./public/uploads/import/Minifigures.csv');
  const { data: dbFigs } = await supabase.from('minifigures').select('figure_code, slug_tr');
  
  const dbCodes = new Set(dbFigs.map(f => f.figure_code).filter(Boolean));
  const dbSlugs = new Set(dbFigs.map(f => f.slug_tr).filter(Boolean));

  let missing = [];
  for(let f of csvFigs) {
     if(!dbCodes.has(f.figure_code) && !dbSlugs.has(f.figure_slug_tr)){
        missing.push(f.figure_name + " (" + f.series_name + ")");
     }
  }

  console.log(`Missing count: ${missing.length}`);
  console.log('--- Missing List ---');
  missing.forEach(m => console.log(m));
}
run();
