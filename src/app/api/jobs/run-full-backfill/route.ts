import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { queueTranslationJobIfNeeded, processTranslationJob } from '@/services/aiTranslationPipeline';

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    
    // 1) Queue everything
    let totalQueued = 0;
    let totalSkipped = 0;
    while (true) {
      const { data: seriesList, error: fetchError } = await supabaseAdmin
        .from('series')
        .select('id, title, category, content_blocks, en_source_hash, en_translation_status')
        .or('en_translation_status.in.(missing,failed),title_en.is.null,title_en.eq.')
        .not('en_translation_status', 'in', '(manual_override,queued,generating,ready)')
        .limit(50);
        
      if (fetchError) throw fetchError;
      if (!seriesList || seriesList.length === 0) break;
      
      for (const series of seriesList) {
        if (series.en_translation_status === 'manual_override') {
          totalSkipped++;
          continue;
        }
        const trSourceData = { title: series.title, category: series.category, content_blocks: series.content_blocks };
        const result = await queueTranslationJobIfNeeded('series', series.id, trSourceData, series.en_source_hash || null, false, false);
        if (result.queued) totalQueued++;
        else totalSkipped++;
      }
    }

    // 2) Process all queued
    while (true) {
      const { data: queuedJobs, error: qError } = await supabaseAdmin
        .from('translation_jobs')
        .select('*')
        .eq('status', 'queued')
        .limit(10); // Process in batches of 10
        
      if (qError) throw qError;
      if (!queuedJobs || queuedJobs.length === 0) break;

      for (const job of queuedJobs) {
        try {
          await processTranslationJob(job.id, job.entity_type, job.entity_id, job.source_hash);
        } catch (err: any) {
          console.error(`Error processing job ${job.id}:`, err.message);
        }
      }
    }

    // 3) Generate Report
    const { data: seriesData } = await supabaseAdmin.from('series').select('id, title, en_translation_status');
    const seriesCount: Record<string, number> = { ready: 0, queued: 0, generating: 0, failed: 0, missing: 0, manual_override: 0 };
    const failedSeries = [];

    for (const s of (seriesData || [])) {
      const status = s.en_translation_status;
      if (status && seriesCount[status] !== undefined) {
        seriesCount[status]++;
      } else if (!status) {
        seriesCount.missing++;
      }
      if (status === 'failed') failedSeries.push(s);
    }
    
    const { data: jobsData } = await supabaseAdmin.from('translation_jobs').select('status, error_message, entity_id');
    const jobsCount: Record<string, number> = { queued: 0, generating: 0, completed: 0, failed: 0 };
    
    for (const j of (jobsData || [])) {
      const status = j.status;
      if (status && jobsCount[status] !== undefined) {
        jobsCount[status]++;
      }
    }

    return NextResponse.json({
      success: true,
      queueStats: { totalQueued, totalSkipped },
      seriesReport: seriesCount,
      jobsReport: jobsCount,
      failedSeries: failedSeries.map(s => {
        const job = jobsData?.find(j => j.entity_id === s.id && j.status === 'failed');
        return { id: s.id, title: s.title, error: job?.error_message || 'Unknown error' };
      })
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
