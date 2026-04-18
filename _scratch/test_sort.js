const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'});
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('series').select('*').order('created_at', { ascending: false });
  if(error) { console.error(error); return; }
  
  let mapped = data.map(s => ({
     id: s.id,
     title: s.title,
     release_year: s.release_year,
     created_at: s.created_at,
     computedYear: parseInt(s.release_year) || (s.created_at ? new Date(s.created_at).getFullYear() : 2010)
  }));
  console.log("Raw from DB (Top 5):", mapped.slice(0, 5));

  let sorted = [...data].sort((a, b) => {
      const yearA = parseInt(a.release_year) || (a.created_at ? new Date(a.created_at).getFullYear() : 2010);
      const yearB = parseInt(b.release_year) || (b.created_at ? new Date(b.created_at).getFullYear() : 2010);
      if (yearB !== yearA) return yearB - yearA;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
  
  console.log("Sorted (Top 5):", sorted.map(s => ({
     title: s.title,
     release_year: s.release_year,
     computedYear: parseInt(s.release_year) || (s.created_at ? new Date(s.created_at).getFullYear() : 2010)
  })).slice(0, 5));
}
test();
