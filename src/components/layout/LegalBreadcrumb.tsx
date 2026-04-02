'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LegalBreadcrumb() {
  const pathname = usePathname() || '';

  let currentPageName = 'YASAL SAYFALAR';
  if (pathname.includes('/gizlilik')) currentPageName = 'GİZLİLİK POLİTİKASI';
  else if (pathname.includes('/kullanim-kosullari')) currentPageName = 'KULLANIM KOŞULLARI';
  else if (pathname.includes('/uyelik-sozlesmesi')) currentPageName = 'ÜYELİK SÖZLEŞMESİ';
  else if (pathname.includes('/hak-ihlali')) currentPageName = 'HAK İHLALİ BİLDİRİMİ';

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
