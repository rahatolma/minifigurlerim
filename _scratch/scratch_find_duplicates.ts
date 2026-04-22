import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('minifigures')
    .select('id, slug, name, series_id, created_at, updated_at');
    
  if (error) {
    console.error(error);
    process.exit(1);
  }
  
  const slugCounts: Record<string, any[]> = {};
  for (const fig of data) {
    if (!fig.slug) continue;
    if (!slugCounts[fig.slug]) slugCounts[fig.slug] = [];
    slugCounts[fig.slug].push(fig);
  }
  
  const duplicates: Record<string, any[]> = {};
  let totalDuplicates = 0;
  for (const [slug, figs] of Object.entries(slugCounts)) {
    if (figs.length > 1) {
      duplicates[slug] = figs;
      totalDuplicates += figs.length - 1;
    }
  }
  
  console.log(`Found ${Object.keys(duplicates).length} duplicated slugs, containing ${totalDuplicates} excess records.`);
  console.log(JSON.stringify(duplicates, null, 2));
}

run().catch(console.error);
