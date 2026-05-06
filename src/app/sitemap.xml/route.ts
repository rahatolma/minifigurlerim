import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.minifigurlerim.com';

  const sitemaps = [
    `${baseUrl}/sitemap-series-tr.xml`,
    `${baseUrl}/sitemap-series-en.xml`,
    `${baseUrl}/sitemap-figures-tr.xml`,
    `${baseUrl}/sitemap-figures-en.xml`,
    `${baseUrl}/sitemap-blog-tr.xml`,
    `${baseUrl}/sitemap-blog-en.xml`,
    `${baseUrl}/sitemap-pages.xml`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps
    .map(
      (url) => `
  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
    )
    .join('')}
</sitemapindex>
  `.trim();

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
