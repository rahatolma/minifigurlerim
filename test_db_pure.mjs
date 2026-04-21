import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const { data, error } = await supabase.from('about_settings').select('id, hero_image_url, quote_text, quote_author, boss_image_url, boss_title, boss_subtitle, boss_desc, main_title, main_text, mid_image_url, mid_title, mid_subtitle, mid_desc, small_image_url, small_title, small_subtitle, small_desc, join_image_url, join_title, join_text, join_btn_text, join_btn_link, created_at, updated_at').eq('id', 1).single();

console.log("Error:", error);
console.log("Data keys:", data ? Object.keys(data) : 'null');
