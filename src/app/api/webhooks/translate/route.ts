import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { updateTranslationAdminDal } from '@/services/action_dal';

export async function POST(req: Request) {
  let openai: OpenAI;
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is missing");
    openai = new OpenAI({ apiKey });
  } catch (envErr: any) {
    return NextResponse.json({ error: "Config Error", details: envErr.message }, { status: 500 });
  }
  try {
    const payload = await req.json();

    // Secure the webhook (Simple token check)
    // In production, configure Supabase Webhook to pass this secret
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process only INSERT or UPDATE events
    if (payload.type !== 'INSERT' && payload.type !== 'UPDATE') {
       return NextResponse.json({ message: 'Ignored, not insert/update' });
    }

    const table = payload.table;
    const record = payload.record;

    if (!record || !record.id) {
       return NextResponse.json({ error: 'Mising record info' }, { status: 400 });
    }

    let updates: any = {};
    let needsTranslation = false;

    // --- Universal Table Logic ---
    const textsToTranslate: string[] = [];
    const keysToUpdate: string[] = [];

    // Helper definition
    const queueTranslation = (trKey: string, enKey: string, isJson: boolean = false) => {
       if (record[trKey] && !record[enKey]) {
           textsToTranslate.push(isJson ? JSON.stringify(record[trKey]) : record[trKey]);
           keysToUpdate.push(enKey);
       }
    };

    if (table === 'series') {
      queueTranslation('title', 'title_en');
      queueTranslation('content_blocks', 'description_blocks_en', true);
    } 
    else if (table === 'minifigures') {
      queueTranslation('name', 'name_en');
      queueTranslation('role', 'role_en');
      queueTranslation('description', 'description_en');
    }
    else if (table === 'news') {
      queueTranslation('title', 'title_en');
      queueTranslation('content_blocks', 'content_blocks_en', true);
    }
    else if (table === 'pages') {
      queueTranslation('title', 'title_en');
      queueTranslation('content_blocks', 'content_blocks_en', true);
    }

    if (textsToTranslate.length > 0) {
      needsTranslation = true;
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Sen profesyonel bir çevirmensin. Verilen JSON içerikleri veya metinleri birebir, yapılarını bozmadan ve LEGO koleksiyoner terminolojisine tam uyumlu olacak şekilde uzman bir İngilizceye çevir. İstekten Gelen her bir bloğu araya "---SEPARATOR---" koyarak yanıtla, formatı kesinlikle bozma.' 
          },
          {
            role: 'user',
            content: `Şu ${textsToTranslate.length} içeriği İngilizceye çevir:\n\n${textsToTranslate.join('\n\n---SEPARATOR---\n\n')}`
          }
        ]
      });

      const translatedText = completion.choices[0]?.message?.content || '';
      const translatedChunks = translatedText.split('---SEPARATOR---').map((t: string) => t.trim());

      keysToUpdate.forEach((key, idx) => {
        if (key.includes('blocks')) { // If it's a JSON block field
           try {
              updates[key] = JSON.parse(translatedChunks[idx]);
           } catch {
              console.error("Failed to parse translated blocks JSON for key:", key);
           }
        } else {
           updates[key] = translatedChunks[idx];
        }
      });
    }

    // If no translation needed because it's already translated or empty
    if (!needsTranslation) {
        return NextResponse.json({ message: 'No translation needed.' });
    }

    // Save back to Database
    await updateTranslationAdminDal(table, record.id, updates);

    return NextResponse.json({ success: true, updated: Object.keys(updates) });

  } catch (err: any) {
    console.error('Translation Webhook Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
