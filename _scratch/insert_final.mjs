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
   const figs = parseCSV('./public/uploads/import/Minifigures.csv');
   const { data: dbSeries } = await supabase.from('series').select('id, slug_tr');
   let sMap = {};
   dbSeries.forEach(s => sMap[s.slug_tr] = s.id);
   
   let targets = ['colSM6-6', 'colSM6-8', 'col25-4', 'col25-8'];
   for(let fig of figs) {
      if(targets.includes(fig.figure_code)) {
         const insertFigPayload = {
            series_id: sMap[fig.series_slug_tr],
            name: fig.figure_name,
            slug: fig.figure_slug_tr,
            code: fig.figure_code,
            role: fig.figure_role,
            type: fig.figure_type,
            figure_no: fig.figure_number,
            description: fig.short_description_tr,
            figure_name: fig.figure_name,
            slug_tr: fig.figure_slug_tr,
            slug_en: fig.figure_slug_en,
            figure_number: fig.figure_number,
            figure_code: fig.figure_code,
            character_name: fig.character_name,
            short_description_tr: fig.short_description_tr,
            short_description_en: fig.short_description_en,
            figure_role: fig.figure_role,
            figure_type: fig.figure_type,
            rarity_level: fig.rarity_level,
            accessory_count: fig.accessory_count ? parseInt(fig.accessory_count) : null,
            main_color: fig.main_color,
            thumbnail_url: fig.thumbnail_url,
            is_featured: fig.is_featured,
            is_active: fig.is_active,
            is_published: fig.is_published
         };
         let {error} = await supabase.from('minifigures').insert([insertFigPayload]);
         console.log("Insert", fig.figure_code, error ? error.message : 'SUCCESS');
      }
   }
}
run();
