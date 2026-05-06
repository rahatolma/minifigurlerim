import { NextResponse } from 'next/server';
import { createPublicClient } from '@/utils/supabase/public';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.minifigurlerim.com';
  const supabase = createPublicClient();

  const { data: news } = await supabase
    .from('news')
    .select('slug, slug_en, created_at')
    .eq('status', 'published');

  if (!news) {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' }
    });
  }

  let urlEntries = '';

  news.forEach(n => {
    if (!n.slug_en) return;

    const url = `${baseUrl}/en/news/${n.slug_en}`;
    const lastmod = n.created_at ? new Date(n.created_at).toISOString() : new Date().toISOString();

    const altEn = `\n      <xhtml:link rel="alternate" hreflang="en-US" href="${url}" />`;
    const altTr = n.slug 
      ? `\n      <xhtml:link rel="alternate" hreflang="tr-TR" href="${baseUrl}/tr/haberler/${n.slug}" />`
      : '';

    const xDefault = n.slug 
      ? `\n      <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/tr/haberler/${n.slug}" />`
      : `\n      <xhtml:link rel="alternate" hreflang="x-default" href="${url}" />`;

    urlEntries += `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
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
