'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { Search } from 'lucide-react';
import { logOut } from '@/app/[locale]/(auth)/login/actions';
import LegalNoticeButton from '@/components/ui/LegalNoticeButton';
import LegalNoticeModal from '@/components/ui/LegalNoticeModal';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTransition } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function Header({ isAuthMode = false }: { isAuthMode?: boolean }) {
  const { user, loading } = useAuth();
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
      startTransition(async () => {
         try {
           const supabase = createClient();
           await supabase.auth.signOut();
           await logOut(locale);
         } catch (error) {
           // If redirect throws, let it pass. For safety, we can hard reload if needed.
           // But since AuthProvider now listens to pathname, soft navigation is fine.
           throw error;
         }
      });
  };

  useEffect(() => {
    const handleScroll = () => {
      // Üst logonun yüksekliği yaklaşık 75px (md:h-[75px])
      if (window.scrollY > 75) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // İlk render'da kontrol
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Aktif sayfa link rengini belirlemek için yardımcı fonksiyon.
  const getLinkClass = (href: string) => {
    let isActive = false;
    if (href === '/') {
      isActive = pathname === '/';
    } else {
      isActive = pathname?.startsWith(href) ?? false;
    }
    
    // Yüksek kontrastlı profesyonel "aktif" sekme tasarımı
    return isActive 
      ? 'bg-black text-white px-4 h-[40px] leading-[40px] rounded-sm shadow-inner' 
      : `hover:bg-black/10 px-4 h-[40px] leading-[40px] transition-colors rounded-sm ${isSticky ? 'text-gray-900 hover:text-black font-extrabold' : 'text-white hover:text-white'}`;
  };

  return (
    <>
    <header className="w-full flex-col bg-white shadow-sm relative z-[70]">
      {/* Top Tier: Logo & Right Tools */}
      <div className="text-black px-4 md:px-8 flex items-center justify-between mx-auto max-w-7xl h-[60px] md:h-[75px]">
        {/* Logo Container (Always Visible) */}
        <div className="flex-1 md:flex-none">
            <Link href="/" className="inline-block flex items-center h-full">
               <img src="/images/site-logo.png" alt="Minifigürlerim Logo" className="h-[28px] md:h-[36px] w-auto" />
            </Link>
        </div>
        
        {/* Utilities Container */}
        <div className="flex justify-end items-center gap-3">
           {/* Language Switcher her zaman kalsın */}
           <LanguageSwitcher />
           
           {/* Masaüstüne özel butonlar */}
           <div className="hidden md:flex items-center gap-4">
              {!isAuthMode && (
                <LegalNoticeButton className="bg-[#1D2136] text-white font-black py-2.5 px-6 rounded-sm shadow-md hover:bg-[#131627] transition-colors tracking-widest uppercase text-[10px]" />
              )}
              
              {loading ? (
                <div className="w-[100px] h-[36px] bg-gray-200 animate-pulse rounded-sm"></div>
              ) : user ? (
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="bg-gray-100 text-gray-800 font-black py-2.5 px-6 rounded-sm shadow-sm hover:bg-gray-200 border border-gray-200 transition-colors tracking-widest uppercase text-[10px] flex items-center gap-2">
                      {user.user_metadata?.full_name || user.user_metadata?.name || 'Koleksiyoner'} ▼
                   </button>
                   
                   {menuOpen && (
                     <>
                       <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)}></div>
                       <div className="absolute right-0 top-full pt-2 z-[60]" style={{ width: '200px' }}>
                          <div className="bg-white border border-gray-100 shadow-xl rounded-xl flex flex-col py-2">
                              {user.email && (
                                <div className="px-4 pb-2 pt-1 mb-1 border-b border-gray-100 text-[10px] text-gray-400 break-all">
                                  {user.email}
                                </div>
                              )}
                              <Link onClick={() => setMenuOpen(false)} href="/koleksiyonum" className="px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-700">{t('MyCollection')}</Link>
                              <Link onClick={() => setMenuOpen(false)} href="/koleksiyonum/ayarlar" className="px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-700">{t('Settings')}</Link>
                              <div className="w-full h-px bg-gray-100 my-1"></div>
                              <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-xs font-bold text-red-600 cursor-pointer">
                                 {t('SafeLogout')}
                              </button>
                          </div>
                       </div>
                     </>
                   )}
                </div>
              ) : !isAuthMode ? (
                <Link href="/login" className="bg-gray-100 text-gray-800 font-black py-2.5 px-6 rounded-sm shadow-sm hover:bg-gray-200 border border-gray-200 transition-colors tracking-widest uppercase text-[10px]">
                   {t('Login')}
                </Link>
              ) : null}
           </div>
        </div>
      </div>
    </header>

      {/* Bottom Tier: Navigation (SADECE MASAÜSTÜNDE GÖRÜNÜR MDC) */}
      {!isAuthMode && (
        <nav className={`hidden md:block w-full shadow-md sticky top-0 z-[60] transition-colors duration-300 ${isSticky ? 'bg-[#F2CD37]' : 'bg-[var(--color-brand-red)]'}`}>
          <div className="mx-auto max-w-7xl flex items-center h-[75px] relative">
            {/* Nav Links */}
            <nav className="w-full h-full flex items-center justify-center px-8">
              <ul className="flex items-center justify-between w-full text-[15px] font-bold tracking-wide h-full">
                <li><Link href="/" className={`block ${getLinkClass('/')}`}>{t('Home')}</Link></li>
                <li><Link href="/seriler" className={`block ${getLinkClass('/seriler')}`}>{t('Series')}</Link></li>
                <li><Link href="/figurler" className={`block ${getLinkClass('/figurler')}`}>{t('Figures')}</Link></li>
                <li><Link href="/lego-hakkinda" className={`block ${getLinkClass('/lego-hakkinda')}`}>{t('AboutLego')}</Link></li>
                <li className="group relative">
                  <Link href="/hakkimizda" className={`flex items-center gap-1 ${getLinkClass('/hakkimizda')}`}>
                    {t('AboutUs')}
                  </Link>
                </li>
                <li><Link href="/haberler" className={`block ${getLinkClass('/haberler')}`}>{t('Blog')}</Link></li>
                <li><Link href="/iletisim" className={`block ${getLinkClass('/iletisim')}`}>{t('Contact')}</Link></li>
              </ul>
            </nav>
          </div>
        </nav>
      )}
      
      {/* Global Yasal Uyarı Modalı */}
      {!isAuthMode && <LegalNoticeModal />}
    </>
  );
}
