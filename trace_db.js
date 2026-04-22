const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testTrace() {
  console.log("=== DB TRACE ===");
  const { data: before } = await supabase.from('about_settings').select('boss_image_url').eq('id', 1).single();
  console.log("1. DB BEFORE UPDATE:", before);
  
  const payloadUrl = "https://example.com/trace-" + Date.now() + ".png";
  console.log("2. ACTION RECEIVING PAYLOAD: { boss_image_url: '" + payloadUrl + "' }");
  
  const { data: updateData, error: err } = await supabase.from('about_settings').upsert({ id: 1, boss_image_url: payloadUrl }).select('boss_image_url');
  if (err) console.error("UPSERT ERROR:", err);
  console.log("3. UPSERT RETURNED:", updateData);
  
  const { data: after } = await supabase.from('about_settings').select('boss_image_url').eq('id', 1).single();
  console.log("4. DB AFTER UPDATE:", after);
}
testTrace();
