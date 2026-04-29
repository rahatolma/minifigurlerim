import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function check() {
  const { data, error } = await supabaseAdmin.from('series').select('id, title, title_en, slug_en, description_blocks_en, content_blocks, en_translation_status');
  if (error) {
      console.error(error);
      return;
  }
  
  let title_en_count = 0;
  let slug_en_count = 0;
  let desc_blocks_en_count = 0;
  let content_blocks_en_count = 0;
  let ready_count = 0;
  
  data.forEach(row => {
      if (row.title_en) title_en_count++;
      if (row.slug_en) slug_en_count++;
      if (row.description_blocks_en && Object.keys(row.description_blocks_en).length > 0) desc_blocks_en_count++;
      if (row.content_blocks && Object.keys(row.content_blocks).length > 0) content_blocks_en_count++; // Just to compare TR
      if (row.en_translation_status === 'ready') ready_count++;
  });
  
  console.log("=== COUNTS ===");
  console.log("title_en_count:", title_en_count);
  console.log("slug_en_count:", slug_en_count);
  console.log("description_blocks_en_count:", desc_blocks_en_count);
  console.log("TR_content_blocks_count:", content_blocks_en_count);
  console.log("ready_count:", ready_count);
  
  // Show Disney 2 Example
  const disney = data.find(d => d.slug_en === 'lego-minifigures-disney-2' || d.title?.includes('Disney 2'));
  if (disney) {
      console.log("\n=== DISNEY 2 ===");
      console.log(JSON.stringify(disney, null, 2));
  }
}
check();
