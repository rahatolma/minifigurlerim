import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Setup clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const adminClient = createClient(supabaseUrl, supabaseServiceKey);
const publicClient = createClient(supabaseUrl, supabaseAnonKey);

const timestamp = Date.now();
const testBossUrl = "https://example.com/boss-" + timestamp + ".png";
const testMainText = "<p>Test Render Flow " + timestamp + "</p>";

console.log("=== UÇTAN UCA KANIT RAPORU ===\n");

// 1. Admin save payload
const payload = {
  boss_image_url: testBossUrl,
  main_text: testMainText
};
console.log("1. Admin save payload");
console.log(JSON.stringify(payload, null, 2) + "\n");

// 2. DB write sonrasi dönen row
const { data: writeData, error: writeError } = await adminClient
  .from('about_settings')
  .upsert({ id: 1, ...payload })
  .select('boss_image_url, main_text')
  .single();

if (writeError) console.error("WRITE ERROR", writeError);

console.log("2. DB write sonrasi donen row");
console.log(JSON.stringify(writeData, null, 2) + "\n");

// 3. Public DAL query sonucu
// Simulating getAboutSettings() completely!
const { data: queryData, error: queryError } = await publicClient
  .from('about_settings')
  .select('id, hero_image_url, quote_text, quote_author, boss_image_url, boss_title, boss_subtitle, boss_desc, main_title, main_text, mid_image_url, mid_title, mid_subtitle, mid_desc, small_image_url, small_title, small_subtitle, small_desc, join_image_url, join_title, join_text, join_btn_text, join_btn_link, created_at, updated_at')
  .eq('id', 1)
  .single();

if (queryError) console.error("QUERY ERROR", queryError);

console.log("3. Public DAL query sonucu");
console.log(JSON.stringify({ boss_image_url: queryData?.boss_image_url, main_text: queryData?.main_text }, null, 2) + "\n");

console.log("4. Page component'e giden final values");
const finalValues = {
  boss_image_url: queryData?.boss_image_url || '/images/placeholder.svg',
  main_text: queryData?.main_text ? queryData.main_text : null
};
console.log(JSON.stringify(finalValues, null, 2) + "\n");

console.log("5. Render branch");
if (finalValues.main_text) {
   console.log("-> main_text TRUE olarak degerlendirildi. RichTextContent calisacak.");
} else {
   console.log("-> main_text FALSY olarak degerlendirildi. Fallback metne (LEGO...) dusecek.");
}
if (finalValues.boss_image_url !== '/images/placeholder.svg') {
   console.log("-> boss_image_url DB'den gelen guncel URL ile render edilecek.");
} else {
   console.log("-> boss_image_url falsy oldugu veya null oldugu icin placeholder render edilecek.");
}
