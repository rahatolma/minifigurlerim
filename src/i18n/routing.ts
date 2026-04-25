import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  pathnames: {
    '/seriler': {
      tr: '/seriler',
      en: '/series'
    },
    '/seriler/[slug]': {
      tr: '/seriler/[slug]',
      en: '/series/[slug]'
    },
    '/figurler': {
      tr: '/figurler',
      en: '/figures'
    },
    '/figurler/[seriesSlug]/[figureSlug]': {
      tr: '/figurler/[seriesSlug]/[figureSlug]',
      en: '/figures/[seriesSlug]/[figureSlug]'
    },
    '/': '/',
    '/koleksiyonum': {
      tr: '/koleksiyonum',
      en: '/collection'
    },
    '/koleksiyonum/ayarlar': {
      tr: '/koleksiyonum/ayarlar',
      en: '/collection/settings'
    },
    '/login': '/login',
    '/lego-hakkinda': {
      tr: '/lego-hakkinda',
      en: '/about-lego'
    },
    '/hakkimizda': {
      tr: '/hakkimizda',
      en: '/about-us'
    },
    '/haberler': {
      tr: '/haberler',
      en: '/news'
    },
    '/iletisim': {
      tr: '/iletisim',
      en: '/contact'
    },
    '/yasal/gizlilik-politikasi': {
      tr: '/yasal/gizlilik-politikasi',
      en: '/legal/privacy-policy'
    },
    '/yasal/kullanim-kosullari': {
      tr: '/yasal/kullanim-kosullari',
      en: '/legal/terms-of-use'
    },
    '/yasal/uyelik-sozlesmesi': {
      tr: '/yasal/uyelik-sozlesmesi',
      en: '/legal/membership-agreement'
    },
    '/yasal/hak-ihlali': {
      tr: '/yasal/hak-ihlali',
      en: '/legal/rights-violation'
    },
    '/yasal/cerez-politikasi': {
      tr: '/yasal/cerez-politikasi',
      en: '/legal/cookie-policy'
    }
  }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
