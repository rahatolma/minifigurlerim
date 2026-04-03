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
    '/figurler': {
      tr: '/figurler',
      en: '/figures'
    },
    '/': '/',
    '/koleksiyonum': '/koleksiyonum',
    '/koleksiyonum/ayarlar': '/koleksiyonum/ayarlar',
    '/login': '/login',
    '/lego-hakkinda': '/lego-hakkinda',
    '/hakkimizda': '/hakkimizda',
    '/haberler': '/haberler',
    '/iletisim': '/iletisim',
    '/yasal/gizlilik-politikasi': '/yasal/gizlilik-politikasi',
    '/yasal/kullanim-kosullari': '/yasal/kullanim-kosullari',
    '/yasal/uyelik-sozlesmesi': '/yasal/uyelik-sozlesmesi',
    '/yasal/hak-ihlali': '/yasal/hak-ihlali'
  }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
