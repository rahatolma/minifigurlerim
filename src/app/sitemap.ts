import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.minifigurlerim.com';

  // Base routes to be localized
  const routes = [
    { path: '', priority: 1, changeFrequency: 'daily' as const },
    { path: '/seriler', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/figurler', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/haberler', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/lego-hakkinda', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/hakkimizda', priority: 0.5, changeFrequency: 'monthly' as const }
  ];

  const locales = ['tr', 'en'];
  const staticRoutes: MetadataRoute.Sitemap = [];

  locales.forEach(locale => {
    routes.forEach(route => {
      // Create canonical path with locale prefix
      const localizedPath = route.path === '' ? `/${locale}` : `/${locale}${route.path}`;
      staticRoutes.push({
        url: `${baseUrl}${localizedPath}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    });
  });

  return staticRoutes;
}
