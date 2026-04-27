export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { queueTranslationJobIfNeeded, processTranslationJob } from '@/services/aiTranslationPipeline';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const supabase = createAdminClient();
  const testResults: any[] = [];
  
  function assert(condition: boolean, testName: string, details?: any) {
    testResults.push({
      test: testName,
      status: condition ? 'PASS' : 'FAIL',
      details
    });
    if (!condition) console.error(`TEST FAILED: ${testName}`, details);
  }

  try {
    const mockId = '00000000-0000-4000-a000-000000000000';
    
    // We mock the entity in DB using admin client
    await supabase.from('series').delete().eq('id', mockId); // Clean if exists
    
    await supabase.from('series').insert({
      id: mockId,
      slug: 'test-pipeline-' + Date.now(),
      title: 'TEST Pipeline Series ' + Date.now(),
      category: 'Karakter Paketleri',
      series_no: '99',
      brand: 'LEGO®',
      content_blocks: [{ type: 'paragraph', data: { text: 'Test content block' } }]
    });

    const initialPayload = {
      title: 'TEST Pipeline Series',
      category: 'Karakter Paketleri',
      content_blocks: [{ type: 'paragraph', data: { text: 'Test content block' } }]
    };

    // Test 1: TR save edince translation_jobs row oluşuyor.
    const res1 = await queueTranslationJobIfNeeded('series', mockId, initialPayload, null, false);
    assert(res1.queued === true, "Test 1a: TR Save successfully queues job", res1.error);

    const { data: jobs1 } = await supabase.from('translation_jobs').select('*').eq('entity_id', mockId).eq('status', 'queued');
    assert(!!jobs1 && jobs1.length === 1, "Test 1b: translation_jobs row created", { count: jobs1?.length });

    // Test 2: Aynı TR içerik tekrar kaydedilince source_hash aynıysa duplicate job oluşmuyor.
    const res2 = await queueTranslationJobIfNeeded('series', mockId, initialPayload, res1.hash || null, false);
    assert(res2.queued === false && res2.reason === 'hash_match', "Test 2: Duplicate job not created on identical hash", res2.reason);

    // Test 3: manual_override varsa TR değişse bile EN overwrite/job oluşmuyor.
    const updatePayload2 = { ...initialPayload, title: 'TEST Pipeline Series Changed' };
    const res3 = await queueTranslationJobIfNeeded('series', mockId, updatePayload2, res1.hash || null, true);
    assert(res3.queued === false && res3.reason === 'manual_override', "Test 3: manual_override prevents new jobs even if TR changes", res3.reason);

    // Test 4: Force Regenerate manual_override’ı kaldırıp yeni job oluşturuyor.
    const res4 = await queueTranslationJobIfNeeded('series', mockId, updatePayload2, res1.hash || null, true, true); // forceRegenerate = true
    assert(res4.queued === true, "Test 4: Force Regenerate creates new job overriding manual_override", res4.error);

    // Test 5: Job processor
    const jobId = jobs1?.[0]?.id;
    if (jobId) {
      const procRes = await processTranslationJob(jobId, 'series', mockId, res4.hash || res1.hash || '');
      assert(procRes.success === true, "Test 5a: Job processor successful", procRes.error);
      
      const { data: finalEntity } = await supabase.from('series').select('en_translation_status, title_en').eq('id', mockId).single();
      assert(finalEntity?.en_translation_status === 'ready' && !!finalEntity?.title_en, "Test 5b: EN fields written and status ready", finalEntity);
    }

    // Clean up
    await supabase.from('series').delete().eq('id', mockId);

    return NextResponse.json({ results: testResults });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, results: testResults });
  }
}
