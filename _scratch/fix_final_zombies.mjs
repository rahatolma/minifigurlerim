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
   const slugs = ['swoop', 'baby-penguin', 'fitness-instructor', 'fencer'];
   const codes = ['colSM6-6', 'colSM6-8', 'col25-4', 'col25-8'];
   
   const { data } = await supabase.from('minifigures').select('id, name, slug, figure_code').in('slug', slugs);
   console.log("Found zombies:", data);
   
   for(let z of data) {
      if(!codes.includes(z.figure_code)) {
          await supabase.from('minifigures').update({ slug: z.slug + '-zom2', slug_tr: z.slug_tr + '-zom2' }).eq('id', z.id);
      }
   }
}
run();
