import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { slugify } from "@/utils/helpers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // 1. Auth Check (Must be CTO/Admin)
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              console.error("Cookie Error:", error);
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Check if user has admin role (if applicable in this project)
    // For now, having a valid session on this /cto route is our primary check.

    // 2. Parse Request
    const body = await request.json();
    const { entity_type, entity_id } = body;

    if (!entity_type || !entity_id) {
      return NextResponse.json(
        { error: "Missing entity_type or entity_id" },
        { status: 400 }
      );
    }

    // We need service role to bypass RLS for updating content if needed, 
    // or we can use the regular client if RLS allows admins to update. 
    // We'll use service role for safety in the CTO API.
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => [],
          setAll: () => {},
        },
      }
    );

    // 3. Fetch TR Data
    const { data: entityData, error: dbError } = await supabaseAdmin
      .from(entity_type)
      .select("*")
      .eq("id", entity_id)
      .single();

    if (dbError || !entityData) {
      return NextResponse.json(
        { error: "Entity not found or DB error", details: dbError },
        { status: 404 }
      );
    }

    // 4. Build Prompt
    const trDataString = JSON.stringify(entityData, null, 2);

    const systemPrompt = `
You are a professional editorial writer for a global LEGO minifigure collector platform. Your job is to rewrite content in fluent, authoritative English. You DO NOT translate.

RULES:
- DO NOT translate literally. Read the Turkish context and rewrite it as a high-quality English encyclopedia/database entry.
- DO NOT use childish or marketing language.
- DO NOT use words like: "cute", "adorable", "amazing", "buy now", "don't miss", "fun", "colorful".
- Use a neutral, editorial tone.
- Write like an archive / catalog / collector database.
- STYLE TARGET: concise, informative, credible, globally readable.
- The output MUST be a valid JSON object matching the requested schema.

If you see marketing hype in Turkish, strip it out and focus on the physical details, series context, and collector relevance.
`;

    let userPrompt = "";
    let expectedFormat = "";

    if (entity_type === "minifigures") {
      userPrompt = `Rewrite the following Turkish minifigure data into English:
Name: ${entityData.name}
Role: ${entityData.figure_role || entityData.role}
Type: ${entityData.figure_type || entityData.type}
Description: ${entityData.description}
Short Description: ${entityData.short_description_tr}
`;
      expectedFormat = `{
  "name_en": "English Name",
  "role_en": "English Role",
  "description_en": "Full English Description",
  "short_description_en": "Short English Description",
  "meta_title_en": "SEO Meta Title (Max 60 chars)",
  "meta_description_en": "SEO Meta Description (Max 160 chars)"
}`;
    } else if (entity_type === "series") {
      userPrompt = `Rewrite the following Turkish series data into English:
Title: ${entityData.title}
Category: ${entityData.category}
Summary: ${entityData.summary_tr}
Description: ${entityData.description}
Collector Comment: ${entityData.collector_comment_tr}
`;
      expectedFormat = `{
  "title_en": "English Title",
  "summary_en": "English Summary",
  "meta_title_en": "SEO Meta Title (Max 60 chars)",
  "meta_description_en": "SEO Meta Description (Max 160 chars)",
  "collector_comment_en": "English Collector Comment",
  "description_blocks_en": "English Description"
}`;
    } else if (entity_type === "news") {
      userPrompt = `Rewrite the following Turkish news data into English:
Title: ${entityData.title}
Summary: ${entityData.summary}
Content: ${entityData.content}
`;
      expectedFormat = `{
  "title_en": "English Title",
  "summary_en": "English Summary",
  "meta_title_en": "SEO Meta Title (Max 60 chars)",
  "meta_description_en": "SEO Meta Description (Max 160 chars)",
  "content_blocks_en": "Full English Content"
}`;
    } else {
      return NextResponse.json({ error: "Invalid entity_type" }, { status: 400 });
    }

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
      temperature: 0.3, // Low temperature for consistent, professional tone
    });

    const aiResponse = completion.choices[0].message.content;
    
    if (!aiResponse) {
      throw new Error("OpenAI returned empty response");
    }

    const parsedData = JSON.parse(aiResponse);

    // Slugification & Duplicate Checking
    const englishTitle = parsedData.title_en || parsedData.name_en;
    if (englishTitle) {
      let baseSlug = slugify(englishTitle);
      let duplicateCheck = await supabaseAdmin
        .from(entity_type)
        .select('id')
        .eq('slug_en', baseSlug)
        .not('id', 'eq', entity_id)
        .maybeSingle();

      if (duplicateCheck.data) {
        baseSlug = `${baseSlug}-${entity_id.split('-')[0]}`;
      }
      parsedData.slug_en = baseSlug;
    }
    
    // Set Status
    parsedData.en_status = 'draft';

    // 5. Save back to DB
    const { error: updateError } = await supabaseAdmin
      .from(entity_type)
      .update(parsedData)
      .eq("id", entity_id);

    if (updateError) {
      console.error("Update Error:", updateError);
      return NextResponse.json(
        { error: "Failed to update database", details: updateError },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: parsedData });

  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
