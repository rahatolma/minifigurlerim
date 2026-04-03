'use client';
import { Link, usePathname } from '@/i18n/routing';

export default function LegalBreadcrumb() {
  const pathname = usePathname() || '';

  const breadcrumbs: Record<string, string> = {
    '/yasal/gizlilik-politikasi': 'Gizlilik Politikası',
    '/yasal/kullanim-kosullari': 'Kullanım Koşulları',
    '/yasal/uyelik-sozlesmesi': 'Üyelik Sözleşmesi',
    '/yasal/hak-ihlali': 'Hak İhlali Bildirimi',
  };

  const currentPageName = breadcrumbs[pathname] || 'YASAL SAYFALAR';

  return (
    <div className="border-b border-gray-100 bg-white relative z-20 w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ minHeight: '70px' }}>
           <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link> 
           <span className="mx-3 text-gray-200">/</span> 
           <span className="text-gray-900">{currentPageName}</span>
      </div>
    </div>
  );
}
