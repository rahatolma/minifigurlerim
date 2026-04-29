import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function check() {
  const { data, error } = await supabaseAdmin.from('series').select('title_en, slug_en, description_blocks_en, en_translation_status, title, content_blocks');
  
  if(error) {
    console.error(error);
    return;
  }
  
  let title_en_count = 0;
  let slug_en_count = 0;
  let content_blocks_en_count = 0;
  let ready_count = 0;
  
  data.forEach(r => {
      if (r.title_en && r.title_en.trim() !== '') title_en_count++;
      if (r.slug_en && r.slug_en.trim() !== '') slug_en_count++;
      if (r.description_blocks_en && Array.isArray(r.description_blocks_en) && r.description_blocks_en.length > 0 && r.description_blocks_en[0].type === 'SERIES_SHOWCASE') content_blocks_en_count++;
      if (r.en_translation_status === 'ready') ready_count++;
  });
  
  console.log("=== FINAL VERIFICATION QUERY RESULT ===");
  console.table([{
      title_en_count,
      slug_en_count,
      content_blocks_en_count,
      ready_count
  }]);
  
  const disney2 = data.find(r => r.slug_en === 'lego-minifigures-disney-2');
  if (disney2) {
      console.log("\n=== DISNEY 2 RAW ROW ===");
      console.log("title_tr:", disney2.title);
      console.log("title_en:", disney2.title_en);
      console.log("content_blocks_tr (Length):", disney2.content_blocks?.length, "Type:", disney2.content_blocks?.[0]?.type);
      console.log("description_blocks_en (Length):", disney2.description_blocks_en?.length, "Type:", disney2.description_blocks_en?.[0]?.type);
      console.log("en_translation_status:", disney2.en_translation_status);
  }
}
check();
