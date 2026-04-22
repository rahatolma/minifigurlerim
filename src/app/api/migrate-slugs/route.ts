import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';
import { slugify } from '@/utils/helpers';

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const results = { series_updated: 0, figures_updated: 0, errors: [] as string[] };

    // 1. Serileri Güncelle
    const { data: seriesList, error: seriesError } = await supabase.from('series').select('id, title, category');
    if (seriesError) throw new Error("Seriler çekilemedi: " + seriesError.message);

    for (const s of seriesList || []) {
      // Slug mantığı: Sadece Başlık
      let generatedSlug = slugify(s.title);
      if (!generatedSlug) generatedSlug = `series-${s.id.substring(0, 6)}`;

      const { error } = await supabase.from('series').update({ slug: generatedSlug }).eq('id', s.id);
      
      if (error && error.code === '23505') {
          // Eğer benzersiz isim hatası çıkarsa (Unique Constraint) arkasına ID kırpmasını atıyoruz.
          await supabase.from('series').update({ slug: `${generatedSlug}-${s.id.substring(0,4)}` }).eq('id', s.id);
          results.series_updated++;
      } else if (error) {
          results.errors.push(`Series ${s.id}: ${error.message}`);
      } else {
          results.series_updated++;
      }
    }

    // 2. Figürleri Güncelle
    const { data: figuresList, error: figuresError } = await supabase.from('minifigures').select('id, name, code, series_name');
    if (figuresError) throw new Error("Figürler çekilemedi: " + figuresError.message);

    for (const f of figuresList || []) {
      // Slug mantığı: FigurAdi-Kod (Varsa)
      let generatedSlug = slugify(`${f.name} ${f.code || ''}`);
      if (!generatedSlug) generatedSlug = `figure-${f.id.substring(0, 6)}`;

      const { error } = await supabase.from('minifigures').update({ slug: generatedSlug }).eq('id', f.id);
      
      if (error && error.code === '23505') {
          await supabase.from('minifigures').update({ slug: `${generatedSlug}-${f.id.substring(0,6)}` }).eq('id', f.id);
          results.figures_updated++;
      } else if (error) {
          results.errors.push(`Figure ${f.id}: ${error.message}`);
      } else {
          results.figures_updated++;
      }
    }

    return NextResponse.json({ success: true, message: "Migration (Göç) Bitti! UUID'ler başarıyla SEO Sluglarına dönüştürüldü.", results });
  } catch (error: any) {
console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
