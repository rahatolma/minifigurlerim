'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { logOut } from '@/app/(auth)/login/actions';
import LegalNoticeButton from '@/components/ui/LegalNoticeButton';
import LegalNoticeModal from '@/components/ui/LegalNoticeModal';

export default function Header({ user }: { user?: any }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="text-black px-8 flex flex-col md:flex-row items-center mx-auto max-w-7xl md:h-[75px]">
        {/* Logo %25 */}
        <div className="w-full md:w-1/4 mb-4 md:mb-0 hidden md:block">
            <Link href="/" className="inline-block flex items-center h-full">
            <img src="/uploads/media__1774631571720.png" alt="Minifigürlerim Logo" className="h-[36px] w-auto" />
            </Link>
        </div>
        
        {/* Önemli Yasal Bilgilendirme Butonu %75 Sağa Yaslı */}
        <div className="w-full md:w-3/4 flex justify-end items-center gap-3">
           <LegalNoticeButton className="bg-[#1D2136] text-white font-black py-2.5 px-6 rounded-sm shadow-md hover:bg-[#131627] transition-colors tracking-widest uppercase text-[10px]" />
           {user ? (
             <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="bg-gray-100 text-gray-800 font-black py-2.5 px-6 rounded-sm shadow-sm hover:bg-gray-200 border border-gray-200 transition-colors tracking-widest uppercase text-[10px] flex items-center gap-2">
                   {user.email?.split('@')[0] || 'Hesabım'} ▼
                </button>
                
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)}></div>
                    <div className="absolute right-0 top-full pt-2 z-[60]" style={{ width: '200px' }}>
                       <div className="bg-white border border-gray-100 shadow-xl rounded-xl flex flex-col py-2">
                           <Link onClick={() => setMenuOpen(false)} href="/koleksiyonum" className="px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-700">Koleksiyonum</Link>
                           <Link onClick={() => setMenuOpen(false)} href="/koleksiyonum/ayarlar" className="px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-700">Ayarlar</Link>
                           <div className="w-full h-px bg-gray-100 my-1"></div>
                           <form action={logOut}>
                              <button type="submit" className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs font-bold text-red-600 cursor-pointer">
                                 Güvenli Çıkış Yap
                              </button>
                           </form>
                       </div>
                    </div>
                  </>
                )}
             </div>
           ) : (
             <Link href="/login" className="bg-gray-100 text-gray-800 font-black py-2.5 px-6 rounded-sm shadow-sm hover:bg-gray-200 border border-gray-200 transition-colors tracking-widest uppercase text-[10px]">
                Giriş Yap
             </Link>
           )}
        </div>
      </div>

      {/* Bottom Tier: Navigation */}
      <div className="bg-[var(--color-brand-red)] w-full shadow-md">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center md:h-[75px] relative">
          
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
