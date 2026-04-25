'use client';

import { useState } from 'react';
import { Home, Layers, Shapes, Menu, Box, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from 'next-intl';

export default function MobileTabBar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const t = useTranslations('Navigation');

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between px-2 h-[70px]">
          
          {/* Ana Sayfa */}
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
            <Home className={`w-6 h-6 transition-all ${isActive('/') ? 'text-[#D22B2B] fill-[#D22B2B]/10 scale-110' : 'text-gray-400 group-hover:text-gray-600'}`} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className={`text-[10px] font-bold tracking-wide ${isActive('/') ? 'text-[#D22B2B]' : 'text-gray-400'}`}>{t('Home')}</span>
          </Link>

          {/* Seriler */}
          <Link href="/seriler" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
            <Layers className={`w-6 h-6 transition-all ${isActive('/seriler') ? 'text-[#D22B2B] fill-[#D22B2B]/10 scale-110' : 'text-gray-400 group-hover:text-gray-600'}`} strokeWidth={isActive('/seriler') ? 2.5 : 2} />
            <span className={`text-[10px] font-bold tracking-wide ${isActive('/seriler') ? 'text-[#D22B2B]' : 'text-gray-400'}`}>{t('Series')}</span>
          </Link>

          {/* Koleksiyonum (Şişkin Orta Buton) */}
          <div className="flex flex-col items-center justify-center w-full h-full relative">
            <Link 
              href="/koleksiyonum" 
              className={`absolute -top-6 flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-transform active:scale-95 ${isActive('/koleksiyonum') ? 'bg-black text-white' : 'bg-[#D22B2B] text-white hover:bg-[#b92525]'}`}
            >
              <Box className="w-7 h-7" strokeWidth={2.5} />
            </Link>
            <span className={`text-[10px] font-bold tracking-wide absolute bottom-2 ${isActive('/koleksiyonum') ? 'text-black' : 'text-gray-600'}`}>{t('MyCollection')}</span>
          </div>

          {/* Figürler */}
          <Link href="/figurler" className="flex flex-col items-center justify-center w-full h-full gap-1 group">
            <Shapes className={`w-6 h-6 transition-all ${isActive('/figurler') ? 'text-[#D22B2B] fill-[#D22B2B]/10 scale-110' : 'text-gray-400 group-hover:text-gray-600'}`} strokeWidth={isActive('/figurler') ? 2.5 : 2} />
            <span className={`text-[10px] font-bold tracking-wide ${isActive('/figurler') ? 'text-[#D22B2B]' : 'text-gray-400'}`}>{t('Figures')}</span>
          </Link>

          {/* Menü (Drawer Tetikleyici) */}
          <button onClick={() => setDrawerOpen(true)} className="flex flex-col items-center justify-center w-full h-full gap-1 group">
            <Menu className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-all font-bold" strokeWidth={2} />
            <span className="text-[10px] font-bold tracking-wide text-gray-400">{t('Menu')}</span>
          </button>
          
        </div>
      </div>

      {/* Siyah Arka Plan Overlay */}
      {drawerOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Alttan Çıkan Mobil Menü (Drawer) */}
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[32px] p-6 shadow-2xl transition-transform duration-300 ease-out transform ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tighter">{t('MenuTitle')}</h2>
          <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600">
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Kullanıcı Profili Quick Action */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 flex items-center justify-between">
           <div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('MyAccount')}</p>
             <p className="text-sm font-black text-gray-900">{user?.email || t('GuestUser')}</p>
           </div>
           {!user ? (
             <Link href="/login" onClick={() => setDrawerOpen(false)} className="bg-black text-white text-xs font-bold px-4 py-2 rounded-lg">{t('Login')}</Link>
           ) : (
             <Link href="/koleksiyonum/ayarlar" onClick={() => setDrawerOpen(false)} className="bg-white border border-gray-200 text-gray-900 shadow-sm text-xs font-bold px-4 py-2 rounded-lg">{t('Settings')}</Link>
           )}
        </div>

        <nav className="flex flex-col gap-2">
          <Link href="/lego-hakkinda" onClick={() => setDrawerOpen(false)} className="px-4 py-3 bg-white rounded-xl font-bold text-gray-700 active:bg-gray-50 border border-transparent active:border-gray-100">{t('AboutLego')}</Link>
          <Link href="/hakkimizda" onClick={() => setDrawerOpen(false)} className="px-4 py-3 bg-white rounded-xl font-bold text-gray-700 active:bg-gray-50 border border-transparent active:border-gray-100">{t('AboutUs')}</Link>
          <Link href="/haberler" onClick={() => setDrawerOpen(false)} className="px-4 py-3 bg-white rounded-xl font-bold text-gray-700 active:bg-gray-50 border border-transparent active:border-gray-100">{t('Blog')}</Link>
          <Link href="/iletisim" onClick={() => setDrawerOpen(false)} className="px-4 py-3 bg-white rounded-xl font-bold text-gray-700 active:bg-gray-50 border border-transparent active:border-gray-100">{t('Contact')}</Link>
          <div className="h-px bg-gray-100 my-4"></div>
          <button onClick={() => {
            setDrawerOpen(false);
            if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('open-legal-modal'));
          }} className="px-4 py-3 bg-gray-50 rounded-xl font-bold text-gray-500 text-left flex items-center justify-between">
            {t('LegalNotice')} <span className="text-gray-400 text-xs">{t('Open')}</span>
          </button>
        </nav>
      </div>
    </>
  );
}
