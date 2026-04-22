import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envFile = readFileSync(resolve('/Users/Gungor/Documents/GitHub/minifigurlerim/.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].replace(/["']/g, '');
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: figures } = await supabase.from('minifigures').select('value_score, demand_score, avg_price, release_year');
  
  if(!figures) return console.log("no figures");

  let maxV = 0, maxValue = 0, maxDemand = 0, maxPrice = 0, vCount = 0;
  for (const f of figures) {
    if (f.value_score > maxValue) maxValue = f.value_score;
    if (f.demand_score > maxDemand) maxDemand = f.demand_score;
    if (f.avg_price > maxPrice) maxPrice = f.avg_price;
    if (f.value_score != null) vCount++;
  }
  
  console.log(`Evaluated ${figures.length} figures. With values: ${vCount}`);
  console.log(`Max Value Score: ${maxValue}`);
  console.log(`Max Demand Score: ${maxDemand}`);
  console.log(`Max Avg Price: ${maxPrice}`);
}

main().catch(console.error);
