import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('categories').select('id, name');
  
  if (error) {
    console.error(error);
    return;
  }
  
  let updatedCount = 0;
  
  for (const row of data) {
    let newVal = row.name.replace(/\bFigür/g, 'Minifigür').replace(/\bfigür/g, 'minifigür');
    if (newVal !== row.name) {
        const { error: upErr } = await supabase.from('categories').update({ name: newVal }).eq('id', row.id);
        if (upErr) console.error("Error updating", row.id, upErr);
        else updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} categories in DB.`);
}

run();
