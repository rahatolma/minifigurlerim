import { NextResponse } from 'next/server';
import { createPublicClient } from '@/utils/supabase/public';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.minifigurlerim.com';
  const supabase = createPublicClient();

  const { data: series } = await supabase
    .from('series')
    .select('slug_tr, slug_en, updated_at')
    .eq('is_published', true);

  if (!series) {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' }
    });
  }

  let urlEntries = '';

  series.forEach(s => {
    if (!s.slug_tr) return;
    
    const url = `${baseUrl}/tr/seriler/${s.slug_tr}`;
    const lastmod = s.updated_at ? new Date(s.updated_at).toISOString() : new Date().toISOString();

    // hreflang
    const altEn = s.slug_en ? `\n      <xhtml:link rel="alternate" hreflang="en-US" href="${baseUrl}/en/series/${s.slug_en}" />` : '';
    const altTr = `\n      <xhtml:link rel="alternate" hreflang="tr-TR" href="${url}" />`;
    
    const xDefault = s.slug_en 
      ? `\n      <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/en/series/${s.slug_en}" />`
      : `\n      <xhtml:link rel="alternate" hreflang="x-default" href="${url}" />`;

    urlEntries += `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${altTr}${altEn}${xDefault}
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
