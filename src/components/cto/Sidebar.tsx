'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/cto' },
    { name: 'Slaytlar', href: '/cto/slaytlar' },
    { name: 'Gelen Mesajlar', href: '/cto/mesajlar' },
  ];
  
  const defItems = [
    { name: 'Tanımlar', href: '/cto/tanimlar' },
    { name: 'Seriler', href: '/cto/seriler' },
    { name: 'Figürler', href: '/cto/figurler' },
    { name: 'Haberler', href: '/cto/haberler' },
    { name: 'Sıkça Sorular', href: '/cto/sss' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-white text-gray-900 border-r border-gray-200 flex flex-col z-50">
        <div className="h-24 px-8 flex items-center justify-start border-b border-gray-100">
          <Link href="/cto" className="hover:opacity-80 transition-opacity">
            <img src="/images/site-logo.png" alt="Minifigürlerim Logo" className="h-[32px] w-auto" />
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-0.5 overflow-y-auto">
          
          <Link href="/cto" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname === '/cto' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Dashboard</Link>
          
          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-extrabold px-4 tracking-[0.2em] uppercase">İçerik</p>
          </div>
          <Link href="/cto/seriler" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/cto/seriler') ? 'bg-[#D22B2B] text-white shadow-md shadow-[#D22B2B]/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Seriler</Link>
          <Link href="/cto/figurler" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/cto/figurler') ? 'bg-[#D22B2B] text-white shadow-md shadow-[#D22B2B]/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Figürler</Link>
          <Link href="/cto/haberler" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/cto/haberler') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Haberler</Link>
          <Link href="/cto/hakkimizda" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname === '/cto/hakkimizda' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Hakkımızda</Link>
          <Link href="/cto/slaytlar" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/cto/slaytlar') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Slaytlar</Link>

          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-extrabold px-4 tracking-[0.2em] uppercase">Koleksiyon Verisi</p>
          </div>
          <Link href="/cto/tanimlar" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/cto/tanimlar') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Tanımlar</Link>
          <Link href="/cto/borsa" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/cto/borsa') ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:scale-[0.98]'}`}>Fiyat / Affiliate</Link>

          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-extrabold px-4 tracking-[0.2em] uppercase">Kitle & İletişim</p>
          </div>
          <Link href="/cto/mesajlar" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/cto/mesajlar') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Gelen Mesajlar</Link>
          <Link href="/cto/aboneler" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/cto/aboneler') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Bülten Aboneleri</Link>

          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-extrabold px-4 tracking-[0.2em] uppercase">Sistem</p>
          </div>
          <Link href="/cto/kullanicilar" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/cto/kullanicilar') && !pathname?.startsWith('/cto/kullanicilar/audit') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Kullanıcı Yönetimi</Link>
          <Link href="/cto/kullanicilar/audit" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/cto/kullanicilar/audit') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Audit Logları</Link>
        </nav>
      </aside>
  )
}
