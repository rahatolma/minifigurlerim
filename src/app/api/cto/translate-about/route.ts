import { NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

export async function POST(request: Request) {
  try {
    let openai: OpenAI;
    try {
      openai = getOpenAIClient();
    } catch (envError: any) {
      return NextResponse.json({ error: "Configuration Error", message: envError.message }, { status: 500 });
    }
    const body = await request.json();
    
    // Yalnızca TR alanlarını al
    const trData = {
      quote_text: body.quote_text,
      quote_author: body.quote_author,
      boss_title: body.boss_title,
      boss_subtitle: body.boss_subtitle,
      boss_desc: body.boss_desc,
      main_title: body.main_title,
      main_text: body.main_text,
      mid_title: body.mid_title,
      mid_subtitle: body.mid_subtitle,
      mid_desc: body.mid_desc,
      small_title: body.small_title,
      small_subtitle: body.small_subtitle,
      small_desc: body.small_desc,
      join_title: body.join_title,
      join_text: body.join_text,
      join_btn_text: body.join_btn_text,
    };

    const systemPrompt = `
You are a professional editorial writer and translator for a global LEGO minifigure collector platform.
Your job is to translate the provided Turkish content into fluent, authoritative, and natural English.

RULES:
- Translate accurately but ensure it sounds natural to native English speakers.
- Maintain the formatting (especially HTML tags in 'main_text').
- DO NOT translate literally if an English idiom or phrasing fits better.
- Keep the tone professional, engaging, and suitable for a collector community.
- Output MUST be a valid JSON object matching the requested schema.
`;

    const userPrompt = `Translate the following Turkish texts to English:
${JSON.stringify(trData, null, 2)}
`;

    const expectedFormat = `{
  "quote_text_en": "string",
  "quote_author_en": "string",
  "boss_title_en": "string",
  "boss_subtitle_en": "string",
  "boss_desc_en": "string",
  "main_title_en": "string",
  "main_text_en": "string (keep HTML tags if any)",
  "mid_title_en": "string",
  "mid_subtitle_en": "string",
  "mid_desc_en": "string",
  "small_title_en": "string",
  "small_subtitle_en": "string",
  "small_desc_en": "string",
  "join_title_en": "string",
  "join_text_en": "string",
  "join_btn_text_en": "string"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `${userPrompt}\n\nProvide the output in exactly this JSON structure:\n${expectedFormat}` 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0].message.content;
    
    if (!aiResponse) {
      throw new Error("OpenAI returned empty response");
    }

    const parsedData = JSON.parse(aiResponse);

    return NextResponse.json({ success: true, data: parsedData });

  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
