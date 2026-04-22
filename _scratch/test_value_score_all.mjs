import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('minifigures').select('value_score, rarity, rarity_level');
  if (data) {
    const scores = [...new Set(data.map(d => d.value_score).filter(v => v !== null && v !== undefined))].sort((a,b) => b-a);
    console.log("Distinct Scores:", scores);
    
    // Check distribution
    const dist = {};
    data.forEach(d => {
       if (!dist[d.value_score]) dist[d.value_score] = 0;
       dist[d.value_score]++;
    });
    console.log("Distribution:", dist);
  }
}
check();
