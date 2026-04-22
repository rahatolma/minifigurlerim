import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const envFile = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/["']/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
   // 1. Toplam minifigure sayısı
   const { count, error: err1 } = await supabase.from('minifigures').select('*', { count: 'exact', head: true });
   
   // 2. Duplicate figure_code var mı?
   const { data: allCodes } = await supabase.from('minifigures').select('figure_code');
   let codes = {};
   let duplicateCodes = [];
   allCodes.forEach(x => {
      if(x.figure_code && x.figure_code.trim() !== '') {
          codes[x.figure_code] = (codes[x.figure_code] || 0) + 1;
          if (codes[x.figure_code] === 2) duplicateCodes.push(x.figure_code);
      }
   });

   // 3. series_id boş figür var mı?
   const { count: nullSeriesCount } = await supabase.from('minifigures').select('*', { count: 'exact', head: true }).is('series_id', null);

   // 4. Spesifik çakışan örneklerin incelenmesi
   const slugs = ['lifeguard', 'alien', 'fencer', 'fitness-instructor', 'swoop', 'baby-penguin'];
   const { data: conflicts } = await supabase.from('minifigures')
      .select('name, slug, figure_code, series_id')
      .in('slug', slugs);

   console.log("=== V1. EXACT RECORD COUNT ===");
   console.log("Total Minifigures:", count);

   console.log("\n=== V2. DUPLICATE FIGURE_CODE ===");
   console.log("Duplicate figure_code Count:", duplicateCodes.length);
   if (duplicateCodes.length > 0) console.log("Duplicates:", duplicateCodes);

   console.log("\n=== V3. ORPHAN CHECK (NULL series_id) ===");
   console.log("Orphaned Figures Count:", nullSeriesCount);

   console.log("\n=== V4. CONFLICT RESOLUTION PROOF ===");
   console.log("Found surviving distinct records for previously colliding slugs:");
   slugs.forEach(s => {
       const group = conflicts.filter(c => c.slug === s);
       console.log(`SLUG: [${s}] -> Exists ${group.length} times with different codes:`);
       group.forEach(g => console.log(`   - Code: ${g.figure_code} | Series ID: ${g.series_id}`));
   });
}
verify();
