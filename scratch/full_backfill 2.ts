import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { queueTranslationJobIfNeeded, processTranslationJob } from '../src/services/aiTranslationPipeline';

dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function runBackfill() {
  console.log("=== STARTING FULL BACKFILL ===");

  // 1) Queue everything that is missing or failed or null title_en
  let totalQueued = 0;
  let totalSkipped = 0;
  while (true) {
    const { data: seriesList, error: fetchError } = await supabaseAdmin
      .from('series')
      .select('id, title, category, content_blocks, en_source_hash, en_translation_status')
      .or('en_translation_status.in.(missing,failed),title_en.is.null,title_en.eq.')
      .not('en_translation_status', 'in', '(manual_override,queued,generating,ready)')
      .limit(50); // Get all remaining

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      break;
    }

    if (!seriesList || seriesList.length === 0) {
      console.log("No more series to queue.");
      break;
    }

    console.log(`Processing batch of ${seriesList.length} items to queue...`);
    for (const series of seriesList) {
      const isManualOverride = series.en_translation_status === 'manual_override';
      if (isManualOverride) {
        totalSkipped++;
        continue;
      }
      const trSourceData = { title: series.title, category: series.category, content_blocks: series.content_blocks };
      const result = await queueTranslationJobIfNeeded('series', series.id, trSourceData, series.en_source_hash || null, false, false);
      if (result.queued) totalQueued++;
      else totalSkipped++;
    }
  }

  console.log(`Total Queued this session: ${totalQueued}, Skipped: ${totalSkipped}`);

  // 2) Process all queued jobs
  while (true) {
    const { data: queuedJobs, error: qError } = await supabaseAdmin
      .from('translation_jobs')
      .select('*')
      .eq('status', 'queued');
      
    if (qError) {
      console.error("Error fetching queued jobs:", qError);
      break;
    }

    if (!queuedJobs || queuedJobs.length === 0) {
      console.log("Queue is empty. Processing complete.");
      break;
    }

    console.log(`Found ${queuedJobs.length} queued jobs to process. Processing sequentially...`);
    for (const job of queuedJobs) {
      try {
        console.log(`Processing job ${job.id} for ${job.entity_type} ${job.entity_id}...`);
        const result = await processTranslationJob(job.id, job.entity_type, job.entity_id, job.source_hash);
        console.log(`Result:`, result);
      } catch (err: any) {
        console.error(`Error processing job ${job.id}:`, err.message);
      }
    }
  }

  // 3) Final DB Report
  console.log("\n=== FINAL DB REPORT ===");

  const { data: seriesData } = await supabaseAdmin.from('series').select('id, title, en_translation_status');
  const seriesCount = { ready: 0, queued: 0, generating: 0, failed: 0, missing: 0, manual_override: 0 };
  const failedSeries: any[] = [];

  for (const s of (seriesData || [])) {
    const status = s.en_translation_status as keyof typeof seriesCount;
    if (seriesCount[status] !== undefined) {
      seriesCount[status]++;
    } else if (!status) {
      seriesCount.missing++;
    }
    
    if (status === 'failed') {
      failedSeries.push(s);
    }
  }
  
  console.log("Series Table Status Counts:");
  console.table(seriesCount);

  const { data: jobsData } = await supabaseAdmin.from('translation_jobs').select('status, error_message, entity_id');
  const jobsCount = { queued: 0, generating: 0, completed: 0, failed: 0 };
  
  for (const j of (jobsData || [])) {
    const status = j.status as keyof typeof jobsCount;
    if (jobsCount[status] !== undefined) {
      jobsCount[status]++;
    }
  }

  console.log("\nTranslation Jobs Table Status Counts:");
  console.table(jobsCount);

  if (failedSeries.length > 0) {
    console.log("\nFailed Series Details:");
    for (const s of failedSeries) {
      const job = jobsData?.find(j => j.entity_id === s.id && j.status === 'failed');
      console.log(`- ${s.title} (ID: ${s.id}): ${job?.error_message || 'Unknown error'}`);
    }
  }
}

runBackfill().catch(console.error);
