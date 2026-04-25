'use client';
import { Link, usePathname } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { legalContent } from '@/content/legal/legalContent';

export default function LegalBreadcrumb() {
  const pathname = usePathname() || '';
  const locale = useLocale();
  const content = legalContent[locale] || legalContent['tr'];

  const breadcrumbs: Record<string, string> = {
    '/yasal/gizlilik-politikasi': content['gizlilik-politikasi'].title,
    '/yasal/kullanim-kosullari': content['kullanim-kosullari'].title,
    '/yasal/uyelik-sozlesmesi': content['uyelik-sozlesmesi'].title,
    '/yasal/cerez-politikasi': content['cerez-politikasi'].title,
    '/yasal/hak-ihlali': content['hak-ihlali'].title,
  };

  const currentPageName = breadcrumbs[pathname] || (locale === 'en' ? 'LEGAL PAGES' : 'YASAL SAYFALAR');

  return (
    <div className="border-b border-gray-100 bg-white relative z-20 w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ minHeight: '70px' }}>
           <Link href="/" className="hover:text-black transition-colors">{locale === 'en' ? 'Home' : 'Ana Sayfa'}</Link> 
           <span className="mx-3 text-gray-200">/</span> 
           <span className="text-gray-900">{currentPageName}</span>
      </div>
    </div>
  );
}
