import { NextResponse } from 'next/server';
import { createPublicClient } from '@/utils/supabase/public';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.minifigurlerim.com';
  const supabase = createPublicClient();

  const { data: figures } = await supabase
    .from('minifigures')
    .select('slug_tr, slug_en, updated_at, series!inner(slug_tr, slug_en, is_published)')
    .eq('is_published', true)
    .eq('series.is_published', true);

  if (!figures) {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' }
    });
  }

  let urlEntries = '';

  figures.forEach((f: any) => {
    if (!f.slug_tr || !f.series.slug_tr) return;

    const url = `${baseUrl}/tr/figurler/${f.series.slug_tr}/${f.slug_tr}`;
    const lastmod = f.updated_at ? new Date(f.updated_at).toISOString() : new Date().toISOString();

    const altTr = `\n      <xhtml:link rel="alternate" hreflang="tr-TR" href="${url}" />`;
    const altEn = (f.slug_en && f.series.slug_en) 
      ? `\n      <xhtml:link rel="alternate" hreflang="en-US" href="${baseUrl}/en/figures/${f.series.slug_en}/${f.slug_en}" />`
      : '';

    const xDefault = `\n      <xhtml:link rel="alternate" hreflang="x-default" href="${url}" />`;

    urlEntries += `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${altTr}${altEn}${xDefault}
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${urlEntries}
</urlset>`.trim();

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
