import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { processTranslationJob } from '@/services/aiTranslationPipeline';

export const maxDuration = 300; // Allow up to 5 minutes for AI processing if on Vercel Pro

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || process.env.API_SECRET;
    
    // Require secret if configured (Production Best Practice)
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Find jobs that are queued
    // We limit to 5 per invocation to avoid timeouts, though ideally we pass an exact ID or do it one by one.
    // If the request body has a specific jobId, we prioritize that.
    
    let jobIdToProcess = null;
    try {
      const body = await req.json();
      if (body.jobId) {
        jobIdToProcess = body.jobId;
      }
    } catch (e) {
      // Body might be empty
    }

    let query = supabaseAdmin
      .from('translation_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true });
      
    if (jobIdToProcess) {
      query = query.eq('id', jobIdToProcess);
    }

    const { data: jobs, error } = await query.limit(1);

    if (error) {
      console.error("Error fetching jobs:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ success: true, message: "No queued jobs found." });
    }

    const job = jobs[0];

    // 2. Process the job
    const result = await processTranslationJob(
      job.id, 
      job.entity_type, 
      job.entity_id, 
      job.source_hash
    );

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Process Translation Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
