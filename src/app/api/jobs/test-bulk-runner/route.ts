import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { queueTranslationJobIfNeeded, processTranslationJob } from '@/services/aiTranslationPipeline';

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    const BATCH_LIMIT = 25;

    // 1) Simulate Bulk Button
    const { data: seriesList, error: fetchError } = await supabaseAdmin
      .from('series')
      .select('id, title, slug_tr, slug_en, category, content_blocks, en_source_hash, en_translation_status')
      .or('en_translation_status.in.(missing,failed),title_en.is.null,title_en.eq.')
      .not('en_translation_status', 'in', '(manual_override,queued,generating,ready)')
      .limit(BATCH_LIMIT);

    if (fetchError) throw fetchError;

    let queuedCount = 0;
    let skippedCount = 0;

    for (const series of (seriesList || [])) {
      const isManualOverride = series.en_translation_status === 'manual_override';
      if (isManualOverride) {
        skippedCount++;
        continue;
      }
      const trSourceData = { title: series.title, category: series.category, content_blocks: series.content_blocks };
      const result = await queueTranslationJobIfNeeded('series', series.id, trSourceData, series.en_source_hash || null, false, false);
      if (result.queued) queuedCount++;
      else skippedCount++;
    }

    // 2) Count total translation_jobs
    const { count: totalJobs } = await supabaseAdmin.from('translation_jobs').select('*', { count: 'exact', head: true });

    // 3) Process ONE job
    const { data: queuedJobs } = await supabaseAdmin.from('translation_jobs').select('*').eq('status', 'queued').limit(1);
    let processResult = null;
    let finalStatus = null;
    let targetSlug = null;

    if (queuedJobs && queuedJobs.length > 0) {
      const job = queuedJobs[0];
      processResult = await processTranslationJob(job.id, job.entity_type, job.entity_id, job.source_hash);
      
      const { data: finalSeries } = await supabaseAdmin.from('series').select('slug_en, en_translation_status').eq('id', job.entity_id).single();
      finalStatus = finalSeries?.en_translation_status;
      targetSlug = finalSeries?.slug_en;
    }

    return NextResponse.json({
      bulkButton: {
        processed: seriesList?.length || 0,
        queued: queuedCount,
        skipped: skippedCount
      },
      translationJobsCount: totalJobs,
      processResult,
      finalStatus,
      targetSlug
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
