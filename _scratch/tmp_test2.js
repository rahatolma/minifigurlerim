require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkCols() {
    console.log("Checking columns...");
    
    // Check minifigures
    const { data: d1, error: e1 } = await supabase.from('minifigures').select('*').limit(1);
    console.log("minifigures:", d1 ? Object.keys(d1[0]) : e1);

    // Check series
    const { data: d2, error: e2 } = await supabase.from('series').select('*').limit(1);
    console.log("series:", d2 ? Object.keys(d2[0]) : e2);

    // Check news
    const { data: d3, error: e3 } = await supabase.from('news').select('*').limit(1);
    console.log("news:", d3 ? Object.keys(d3[0]) : e3);
}
checkCols();
