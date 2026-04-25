import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const isDryRun = process.argv.includes('--execute') === false;

async function run() {
  console.log(`\n===========================================`);
  console.log(`🧩 DUPLICATE SLUG CLEANUP SCRIPT (Phase A)`);
  console.log(`MODE: ${isDryRun ? 'DRY-RUN (No modifications)' : 'EXECUTE (Running modifications!)'}`);
  console.log(`===========================================\n`);

  // 1. Fetch all figures to analyze slugs
  const { data: figures, error } = await supabase
    .from('minifigures')
    .select('id, slug, name, series_id, created_at, thumbnail_url, description, short_description_tr, is_published, figure_name');
    
  if (error) {
    console.error('❌ Failed to fetch figures:', error);
    process.exit(1);
  }

  // 2. Identify duplicates
  const slugCounts: Record<string, any[]> = {};
  for (const fig of figures) {
    if (!fig.slug) continue;
    if (!slugCounts[fig.slug]) slugCounts[fig.slug] = [];
    slugCounts[fig.slug].push(fig);
  }

  const duplicates: Record<string, any[]> = {};
  for (const [slug, figs] of Object.entries(slugCounts)) {
    if (figs.length > 1) {
      duplicates[slug] = figs;
    }
  }

  const duplicateSlugsCount = Object.keys(duplicates).length;
  if (duplicateSlugsCount === 0) {
    console.log('✅ No duplicate slugs found! Data is hygienic. You can apply the UNIQUE constraint safely.');
    return;
  }

  console.log(`🔥 AUDIT: Found ${duplicateSlugsCount} slugs with multiple entries.\n`);
  let totalEliminated = 0;

  for (const [slug, figs] of Object.entries(duplicates)) {
    console.log(`-------------------------------------------`);
    console.log(`📝 Analyzing Slug: "${slug}" (${figs.length} rows)`);

    // Rule engine for canonical id
    let canonicalId = figs[0].id;
    let bestScore = -1;

    figs.forEach((f, idx) => {
      let score = 0;
      if (f.thumbnail_url) score += 10;
      if (f.description || f.short_description_tr) score += 5;
      if (f.series_id) score += 5;
      if (f.is_published) score += 100;

      const fDate = new Date(f.created_at).getTime();
      
      console.log(`   [Row ${idx+1}] ID: ${f.id} | is_published: ${f.is_published} | rulesCore: ${score} | update: ${f.created_at}`);

      if (score > bestScore) {
        bestScore = score;
        canonicalId = f.id;
      } else if (score === bestScore) {
        // tiebreaker: latest created_at
        const cDate = new Date(figs.find((x: any) => x.id === canonicalId)!.created_at).getTime();
        if (fDate > cDate) {
          canonicalId = f.id;
        }
      }
    });

    const canonicalItem = figs.find((f: any) => f.id === canonicalId)!;
    const deleteIds = figs.filter((f: any) => f.id !== canonicalId).map((f: any) => f.id);

    console.log(`\n   👑 CANONICAL CHOSEN: => ${canonicalId} (name: ${canonicalItem.figure_name || canonicalItem.name})`);
    console.log(`   🗑️ TARGET FOR DELETION => [ ${deleteIds.join(', ')} ]`);

    totalEliminated += deleteIds.length;

    if (!isDryRun) {
      // 3. Migrate Relations for ALL deleteIds before dropping them
      for (const dId of deleteIds) {
        console.log(`      > Attempting migration of relationships from ${dId} to Canonical ${canonicalId}...`);

        // Migrate User Collections
        const { error: collErr } = await supabase
          .from('user_collections')
          .update({ minifigure_id: canonicalId })
          .eq('minifigure_id', dId);
        if (collErr) console.warn(`      ⚠️ Warning linking collections: ${collErr.message}`);

        // Migrate Series Stats progression fallback (if any referencing this id explicitly, not used often but defensive)
        
        // Remove the duplicate record
        console.log(`      > DELETING orphan duplication record ${dId}...`);
        const { error: delErr } = await supabase
          .from('minifigures')
          .delete()
          .eq('id', dId);
        if (delErr) {
           console.error(`      ❌ ERROR deleting ${dId}: ${delErr.message}`);
        } else {
           console.log(`      ✅ Successfully deleted duplicate ${dId}.`);
        }
      }
    }
  }

  console.log(`\n===========================================`);
  if (isDryRun) {
    console.log(`📊 DRY-RUN COMPLETE. ${totalEliminated} rows would be deleted.`);
    console.log(`To execute the cleanup and migrate relationships, run: \n   npx tsx scripts/cleanup-duplicate-minifigure-slugs.ts --execute`);
  } else {
    console.log(`🚀 EXECUTION COMPLETE. ${totalEliminated} rows migrated and deleted.`);
  }
  console.log(`===========================================\n`);
}

run().catch(console.error);
