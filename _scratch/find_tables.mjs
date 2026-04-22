import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function find() {
  const { data, error } = await supabase.from('news').select('id').limit(1);
  console.log("news:", error ? error.message : "exists");
  
  const { data: d2, error: e2 } = await supabase.from('articles').select('id').limit(1);
  console.log("articles:", e2 ? e2.message : "exists");
}
find();
