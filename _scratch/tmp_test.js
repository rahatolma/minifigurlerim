require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    console.log("Testing Dal functions...");
    
    // test getPreviewFiguresForSeries
    const { data: d1, error: e1 } = await supabase
        .from('minifigures')
        .select(`id, name, slug, figure_no`).limit(1);
    if(e1) console.error("Error 1:", e1);

    // test getAllMinifigures
    const { data: d2, error: e2 } = await supabase
    .from('minifigures')
    .select(`id, name, slug, series_name, status, figure_no`).limit(1);
    if(e2) console.error("Error 2:", e2);

    // check dal.ts queries
    const { data: d3, error: e3 } = await supabase.from('minifigures').select(`id, name, slug, series_name, images, rarity, release_year, value_usd, created_at, is_featured`).limit(1);
    if(e3) console.error("Error 3:", e3);

    const { data: d4, error: e4 } = await supabase.from('series').select(`id, title, slug, cover_image_url, is_featured, created_at`).limit(1);
    if(e4) console.error("Error 4:", e4);

    const { data: d5, error: e5 } = await supabase.from('news').select(`id, title, slug, cover_image, is_published, published_at, created_at`).limit(1);
    if(e5) console.error("Error 5:", e5);
}
test();
