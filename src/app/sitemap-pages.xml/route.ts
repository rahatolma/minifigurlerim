import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.minifigurlerim.com';

  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/seriler', priority: 0.9, changeFrequency: 'daily' },
    { path: '/figurler', priority: 0.9, changeFrequency: 'daily' },
    { path: '/haberler', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/hakkimizda', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/lego-hakkinda', priority: 0.6, changeFrequency: 'monthly' }
  ];

  const locales = ['tr', 'en'];
  
  let urlEntries = '';

  locales.forEach(locale => {
    routes.forEach(route => {
      const localizedPath = route.path === '' ? `/${locale}` : `/${locale}${route.path}`;
      const url = `${baseUrl}${localizedPath}`;
      
      // Build xhtml:link for hreflang
      const alternates = locales.map(l => {
        const altPath = route.path === '' ? `/${l}` : `/${l}${route.path}`;
        return `<xhtml:link rel="alternate" hreflang="${l === 'tr' ? 'tr-TR' : 'en-US'}" href="${baseUrl}${altPath}" />`;
      }).join('\n      ');
      
      // x-default
      const defaultAltPath = route.path === '' ? `/en` : `/en${route.path}`;
      const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${defaultAltPath}" />`;

      urlEntries += `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
    ${alternates}
    ${xDefault}
  </url>`;
    });
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
