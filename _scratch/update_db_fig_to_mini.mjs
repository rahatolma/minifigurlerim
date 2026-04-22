import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('minifigures').select('id, name, figure_name, short_description_tr, description, figure_role, figure_type');
  
  if (error) {
    console.error(error);
    return;
  }
  
  let updatedCount = 0;
  
  for (const row of data) {
    let needsUpdate = false;
    let updates = {};
    
    const replaceFn = (text) => {
        if (!text) return text;
        const newText = text.replace(/\bFigür/g, 'Minifigür').replace(/\bfigür/g, 'minifigür');
        return newText !== text ? newText : null;
    };
    
    ['name', 'figure_name', 'short_description_tr', 'description', 'figure_role', 'figure_type'].forEach(field => {
        const newVal = replaceFn(row[field]);
        if (newVal !== null) {
            updates[field] = newVal;
            needsUpdate = true;
        }
    });
    
    if (needsUpdate) {
        const { error: upErr } = await supabase.from('minifigures').update(updates).eq('id', row.id);
        if (upErr) console.error("Error updating", row.id, upErr);
        else updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} records in DB.`);
}

run();
