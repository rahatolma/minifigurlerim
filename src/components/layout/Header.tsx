'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import LegalNoticeButton from '@/components/ui/LegalNoticeButton';
import LegalNoticeModal from '@/components/ui/LegalNoticeModal';

export default function Header() {
  const pathname = usePathname();

  // Aktif sayfa link rengini belirlemek için yardımcı fonksiyon.
  const getLinkClass = (href: string) => {
    let isActive = false;
    if (href === '/') {
      isActive = pathname === '/';
    } else {
      isActive = pathname?.startsWith(href) ?? false;
    }
    
    // Yüksek kontrastlı profesyonel "aktif" sekme tasarımı (menü siyah arka plan / beyaz metin gibi veya tersi)
    return isActive 
      ? 'bg-black text-white px-4 h-[40px] leading-[40px] rounded-sm shadow-inner' 
      : 'hover:bg-black/10 hover:text-white px-4 h-[40px] leading-[40px] transition-colors text-white rounded-sm';
  };

  return (
    <>
    <header className="w-full flex-col sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Tier: Logo & Search */}
      <div className="text-black px-8 flex flex-col md:flex-row items-center mx-auto max-w-7xl md:h-[64px]">
        {/* Logo %25 */}
        <div className="w-full md:w-1/4 mb-4 md:mb-0 hidden md:block">
            <Link href="/" className="inline-block flex items-center h-full">
            <img src="/uploads/media__1774631571720.png" alt="Minifigürlerim Logo" className="h-[36px] w-auto" />
            </Link>
        </div>
        
        {/* Önemli Yasal Bilgilendirme Butonu %75 Sağa Yaslı */}
        <div className="w-full md:w-3/4 flex justify-end items-center">
           <LegalNoticeButton className="bg-[#1D2136] text-white font-black py-2.5 px-6 rounded-sm shadow-md hover:bg-[#131627] transition-colors tracking-widest uppercase text-[10px]" />
        </div>
      </div>

      {/* Bottom Tier: Navigation */}
      <div className="bg-[var(--color-brand-red)] w-full shadow-md">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center md:h-[64px] relative">
          
          {/* Nav Links */}
          <nav className="w-full h-full flex items-center justify-center px-4 lg:px-8">
            <ul className="flex flex-wrap items-center justify-between w-full text-[14px] lg:text-[15px] font-bold tracking-wide h-full">
              <li><Link href="/" className={`block ${getLinkClass('/')}`}>Ana Sayfa</Link></li>
              <li><Link href="/seriler" className={`block ${getLinkClass('/seriler')}`}>LEGO® Minifigür Serileri</Link></li>
              <li><Link href="/figurler" className={`block ${getLinkClass('/figurler')}`}>LEGO® Minifigürleri</Link></li>
              <li><Link href="/lego-hakkinda" className={`block ${getLinkClass('/lego-hakkinda')}`}>LEGO® Hakkında</Link></li>
              <li className="group relative">
                <Link href="/hakkimizda" className={`flex items-center gap-1 ${getLinkClass('/hakkimizda')}`}>
                  Hakkımızda
                </Link>
              </li>
              <li><Link href="/haberler" className={`block ${getLinkClass('/haberler')}`}>Blog</Link></li>
              <li><Link href="/iletisim" className={`block ${getLinkClass('/iletisim')}`}>İletişim</Link></li>
            </ul>
          </nav>

        </div>
      </div>
    </header>
      
      {/* Global Yasal Uyarı Modalı */}
      <LegalNoticeModal />
    </>
  );
}
