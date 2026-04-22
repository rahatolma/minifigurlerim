import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
const envFile = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/["']/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
   // The 4 missing ones belong to series:
   // Alien - col21-3 (Series 21)
   // Fitness Instructor - col25-4 (Series 25)
   // Fencer - col25-8 (Series 25)
   // Space Fan - col26-12 (Series 26)
   const slugs = ['alien', 'fitness-instructor', 'fencer', 'space-fan'];
   
   const { data } = await supabase.from('minifigures').select('id, name, slug, figure_code').in('slug', slugs);
   console.log("Zombies blocking the way:", data);
   
   for(let z of data) {
      if(!z.figure_code || z.figure_code !== 'xxx') {
          // just rename their slug to free the unique constraint
          await supabase.from('minifigures').update({ slug: z.slug + '-zombie', slug_tr: z.slug_tr + '-zombie' }).eq('id', z.id);
      }
   }
   console.log("Zombies neutralized.");
}
run();
