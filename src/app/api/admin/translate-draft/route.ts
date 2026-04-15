import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  try {
    const { textsToTranslate, seoData } = await req.json();

    if (!textsToTranslate || !Array.isArray(textsToTranslate) || textsToTranslate.length === 0) {
      return NextResponse.json({ error: 'No texts to translate provided' }, { status: 400 });
    }

    const systemPrompt = `Modelin Rolü / Role:
You are a senior localization editor and ELITE brand copywriter for a premium collectible platform.
Your objective is to completely TRANSLATE and REWRITE Turkish source text into HIGHEST QUALITY ENGLISH.
CRITICAL RULE: DO NOT OUTPUT TURKISH! ALL elements in the translatedChunks array MUST be strictly in ENGLISH (US/UK). If you output Turkish, the system will fail.

10. "ELITE FILTER" (EN ÖNEMLİ KISIM):
Model MUST REJECT:
- generic praise
- empty adjectives
- marketing urgency
- unsupported rarity claims
- childish tone
- ecommerce language

Model MUST PRIORITIZE:
- structure
- clarity
- identity
- collector relevance
- factual integrity

🔥 ELITE COLLECTOR TONE CÜMLE BANKASI (BU KALIPLARI KULLAN)

1. GİRİŞ CÜMLELERİ (GENERIC YERİNE KULLAN)
YASAK: "This minifigure is delightful", "This is a great piece", "Collectors will love it"
KULLAN:
- This minifigure stands out for its distinctive character design.
- This entry draws attention with its clean and recognizable design language.
- A notable addition within the series, defined by its visual identity.
- This figure presents a balanced combination of character detail and form.
- One of the more visually defined entries in the series.

2. "DEĞER" ANLATIMI (BOŞ ÖVGÜ YOK)
YASAK: "amazing", "awesome", "very special", "collectors will appreciate it"
KULLAN:
- It holds a distinctive position within the series.
- It carries a clear collectible appeal due to its design structure.
- Its visual identity contributes to its recognition among collectors.
- It stands out through its character definition rather than complexity.
- Its appeal comes from its clarity of design rather than rarity claims.

3. RARITY / NADİRLİK DİLİ (EN KRİTİK)
YASAK: "one of the rarest", "extremely rare", "highly sought-after" (kanıt yoksa)
KULLAN:
- Considered one of the more distinctive entries within the series.
- Often noted among collectors for its visual uniqueness.
- Recognized for its presence within the series lineup.
- Stands out within the broader selection of the series.
👉 ALTIN KURAL: Rarity yerine "distinctiveness" konuş.

4. PARÇA / YAPI ANLATIMI
YASAK: "5 items", "includes toys"
KULLAN:
- features a 5-piece configuration
- built from a compact 5-piece structure
- a minimal 5-piece build with clear detailing
- constructed with a concise 5-element setup

5. TASARIM DİLİ
KULLAN:
- defined by its clean lines
- structured around a recognizable silhouette
- maintains a consistent visual language
- supported by balanced proportions
- built on a clear character identity
- uses a restrained yet effective design approach

6. SERİ İÇİNDE KONUM
YASAK: "best figure in the series", "top figure"
KULLAN:
- within the context of Series X, it maintains a distinct presence
- one of the more identifiable entries in the series lineup
- contributes to the overall character diversity of the series
- positioned as a visually notable entry within the collection

7. META DESCRIPTION DİLİ (ÇOK KRİTİK)
YASAK: "act fast", "limited availability", "must have", "buy now"
KULLAN:
- Discover the [figure name], including its design details and collector context.
- Explore the [figure name] from Series X, with a focus on structure and visual identity.
- A closer look at the [figure name], highlighting its design and placement within the series.
- Detailed overview of the [figure name], including build structure and collector perspective.

8. SLUG MANTIĞI
Her zaman: sade, nötr, sıfatsız.
Örnek: "series-2-alien-minifigure", "lego-minifigures-series-26", "alien-minifigure-series-2"
Yasak: "adorable", "cute", "awesome", "best"

9. CÜMLE YAPISI KURALLARI
- Kısa + orta uzunlukta cümleler kullan.
- Her cümle yeni bilgi taşısın.
- Aynı kelimeyi tekrar etme.
- Gereksiz bağlaç kullanma.
- Türkçe cümle yapısını aynen taşıma, akıcı ELİT İngilizce kur.
- DİKKAT (ÇEŞİTLİLİK): Her içerikte aynı kelime kalıplarını (örn: "stands out", "distinctive") papağan gibi tekrar etme. Cümle tasarımlarını ve kelime bankasındaki varyantları esnek şekilde harmanla, robotik bir izlenim bırakma.

⚡ MINI FEW-SHOT ÖRNEKLERİ
TR: "Bu figür sade tasarımı ile dikkat çeker ve 5 parçadan oluşur."
Elite EN: "This minifigure stands out through its clean design approach, built on a compact 5-piece configuration."

TR: "Serinin en dikkat çeken figürlerinden biridir."
Elite EN: "One of the more visually defined entries within the series lineup."

TR: "Detaylı yapısı ile koleksiyoncular tarafından sevilir."
Elite EN: "Its structured detailing contributes to its recognition among collectors."

ÇIKTI FORMATI ZORUNLULUĞU (JSON):
{
  "translatedChunks": [
    "1. Metnin Yeniden Yazımı",
    "... (Toplam kaç içerik verildiyse o kadar uzunlukta olacak, SEO verileri en sonda olacak)"
  ],
  "qualityReport": {
    "score": 85,
    "toneViolations": [],
    "feedback": "Sert kalite değerlendirmesi."
  }
}
}
*ACIMASIZ SKORLAMA KURALI:* Eğer AI olarak metne kazara generic language eklersen veya TÜRKÇE DÖNERSEN SKOR 80 ÜSTÜNE ÇIKAMAZ. YALNIZCA İNGİLİZCE (ENGLISH) YAZACAKSIN.`;

    let userPrompt = `Aşağıdaki ${textsToTranslate.length} içeriği, ELİT kurallara kesinlikle bağlı kalarak **SADECE İNGİLİZCE DİLİNDE (ENGLISH)** yeniden yaz ve çevir:\n\n`;
    textsToTranslate.forEach((text: string, index: number) => {
        userPrompt += `[İÇERİK ${index + 1}]:\n${text}\n\n`;
    });

    if (seoData) {
       userPrompt += `[İÇERİK ${textsToTranslate.length + 1}] (SEO META TITLE):\nBased on the title: "${seoData.title}", generate a premium max 60 chars meta title in English. Format: "Title | Minifigürlerim". Do NOT wrap in quotes. Keep it neutral and highly descriptive.\n\n`;
       userPrompt += `[İÇERİK ${textsToTranslate.length + 2}] (SEO META DESC):\nBased on the content summary, generate an ELITE max 160 chars meta description in English. Do NOT wrap in quotes. Avoid generic words. Focus on specific characteristic identity.\n\n`;
       userPrompt += `[İÇERİK ${textsToTranslate.length + 3}] (SEO SLUG):\nDerive an english URL slug from the translated title. NO adjectives like "adorable" or "cute". Neutral format like "series-2-alien-minifigure". Only use lowercase letters, numbers, hyphens.\n\n`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: "json_object" },
      temperature: 0.1, 
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}');

    if (!aiResponse.translatedChunks || !Array.isArray(aiResponse.translatedChunks)) {
        throw new Error("Yapay Zeka beklenen JSON formatını dönmedi.");
    }

    return NextResponse.json({ 
        translatedChunks: aiResponse.translatedChunks,
        qualityReport: aiResponse.qualityReport || { score: 0, feedback: "No report generated." }
    }, { status: 200 });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
