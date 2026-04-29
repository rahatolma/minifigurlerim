import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { queueTranslationJobIfNeeded } from '@/services/aiTranslationPipeline';

export async function POST(req: Request) {
  try {
    // Auth Check
    const supabaseClient = await createClient();
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'cto')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient();
    const BATCH_LIMIT = 25;

    // 1. Fetch missing/failed series or series without title_en
    // AND explicitly avoid 'manual_override', 'queued', 'generating', 'ready' 
    // Wait, since we fetch missing/failed, it implies it's not ready/queued/override.
    // Let's use a safe or query.
    const { data: seriesList, error: fetchError } = await supabaseAdmin
      .from('series')
      .select('id, title, category, content_blocks, en_source_hash, en_translation_status')
      .or('en_translation_status.in.(missing,failed),title_en.is.null,title_en.eq.')
      .not('en_translation_status', 'in', '(manual_override,queued,generating,ready)')
      .limit(BATCH_LIMIT);

    if (fetchError) {
      throw new Error(`DB Error: ${fetchError.message}`);
    }

    if (!seriesList || seriesList.length === 0) {
      return NextResponse.json({ success: true, processed: 0, queued: 0, skipped: 0 });
    }

    let queuedCount = 0;
    let skippedCount = 0;

    // 2. Loop through and queue
    for (const series of seriesList) {
      const isManualOverride = series.en_translation_status === 'manual_override';
      if (isManualOverride) {
        skippedCount++;
        continue;
      }

      const trSourceData = { 
        title: series.title, 
        category: series.category, 
        content_blocks: series.content_blocks 
      };

      const result = await queueTranslationJobIfNeeded(
        'series',
        series.id,
        trSourceData,
        series.en_source_hash || null,
        false, // Not a manual override
        false  // Not a force regenerate
      );

      if (result.queued) {
        queuedCount++;
      } else {
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: seriesList.length,
      queued: queuedCount,
      skipped: skippedCount
    });

  } catch (error: any) {
    console.error("Bulk Generate API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
