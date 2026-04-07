import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { texts, targetLang = 'en', context = '' } = await req.json();

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ error: 'texts as array is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // API Key yoksa fallback (Geliştirme için uyarı)
      return NextResponse.json({ 
        error: "OPENAI_API_KEY bulunamadı.", 
        simulated: true, 
        translations: texts.map(t => `${t} (EN_SIMULATED)`) 
      });
    }

    // OpenAI'a atılacak sistem mesajı. "LEGO Collector Tone"
    const systemMessage = `
You are a professional translator and an expert in LEGO terminology.
Translate the following array of JSON strings from Turkish to ${targetLang.toUpperCase()}.
Use premium, collector-focused language. Maintain all HTML tags or Markdown structures exactly if they exist.
Only return a valid JSON array of strings in the exact same order as the input.
Context to consider: ${context || 'LEGO Minifigure entries'}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: JSON.stringify(texts) }
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || 'Failed fetching translation.');
    }

    let parsedTranslations = [];
    try {
        const rawContent = data.choices[0].message.content;
        // Clean markdown block if models return it
        const cleaned = rawContent.replace(/```json\n|\n```/g, '');
        parsedTranslations = JSON.parse(cleaned);
    } catch(err) {
        console.error("Failed to parse OpenAI response as JSON array", err);
        return NextResponse.json({ error: 'Failed to process AI response' }, { status: 500 });
    }

    return NextResponse.json({ translations: parsedTranslations });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
