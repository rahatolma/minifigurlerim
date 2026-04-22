import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function slugify(text) {
  if (!text) return '';
  let result = text.toString();
  const trMap = {
    'ç': 'c', 'Ç': 'c', 
    'ğ': 'g', 'Ğ': 'g', 
    'ş': 's', 'Ş': 's', 
    'ü': 'u', 'Ü': 'u', 
    'ı': 'i', 'İ': 'i', 
    'ö': 'o', 'Ö': 'o'
  };
  for (let key in trMap) {
    result = result.replace(new RegExp(key, 'g'), trMap[key]);
  }
  return result.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function run() {
  console.log("Starting Migration via Anon Key...");
  let successSeries = 0;
  let successFigures = 0;
  
  const { data: sData, error: sErr } = await supabase.from('series').select('id, title, category');
  if (sErr) return console.error("RLS is active preventing reading series?", sErr);
  
  for (const s of sData || []) {
     let slug = slugify(`${s.title} ${s.category || ''}`);
     const { error } = await supabase.from('series').update({ slug }).eq('id', s.id);
     if (error) console.error("Error updating series:", s.id, error.message);
     else successSeries++;
  }
  
  const { data: fData, error: fErr } = await supabase.from('minifigures').select('id, name, series_name, code');
  for (const f of fData || []) {
     let str = f.name + " " + (f.series_name||'') + " " + (f.code||'');
     let slug = slugify(str);
     const { error } = await supabase.from('minifigures').update({ slug }).eq('id', f.id);
     if (error) console.error("Error updating figure:", f.id, error.message);
     else successFigures++;
  }
  
  console.log(`Success! Updated ${successSeries} series and ${successFigures} figures.`);
}

run();
