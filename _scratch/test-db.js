const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
(async () => {
   const { data, error } = await supabase.from('user_collections').select('id, created_at, minifigure_id, minifigures(name, series_id)').limit(1);
   console.log(error || data);
})();
