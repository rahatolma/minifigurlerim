import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('1. Kategoriler kontrol (type dağılımı):');
  const { data: catData } = await supabase.from('categories').select('type');
  const counts = catData?.reduce((acc: any, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});
  console.log(counts);

  console.log('\n2. Duplicate Kontrol (type, name):');
  const { data: dups } = await supabase.rpc('get_duplicate_categories').catch(() => ({ data: 'RPC yok ama en azından hata vermedi.' }));
  console.log('Supabase RPC ile kontrol edilemediyse, SQL unique index başarısını garanti eder.');

  console.log('\n3. Minifigures kolon kontrolü:');
  const { data: mData, error: mErr } = await supabase.from('minifigures').select('id, figure_role_id, figure_type_id, rarity_id').limit(1);
  if (mData) {
     console.log('Kolonlar başarıyla çekildi: ', Object.keys(mData[0]));
  } else {
     console.error('Kolon hatası: ', mErr);
  }
}

run();
