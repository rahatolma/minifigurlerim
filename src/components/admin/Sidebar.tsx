'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Slaytlar', href: '/admin/slaytlar' },
    { name: 'Gelen Mesajlar', href: '/admin/mesajlar' },
  ];
  
  const defItems = [
    { name: 'Tanımlar', href: '/admin/tanimlar' },
    { name: 'Seriler', href: '/admin/seriler' },
    { name: 'Figürler', href: '/admin/figurler' },
    { name: 'Haberler', href: '/admin/haberler' },
    { name: 'Sıkça Sorular', href: '/admin/sss' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-white text-gray-900 border-r border-gray-200 flex flex-col z-50">
        <div className="h-24 px-8 flex items-center justify-start border-b border-gray-100">
          <Link href="/admin" className="hover:opacity-80 transition-opacity">
            <img src="/images/site-logo.png" alt="Minifigürlerim Logo" className="h-[32px] w-auto" />
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-0.5 overflow-y-auto">
          
          <Link href="/admin" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname === '/admin' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Dashboard</Link>
          
          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-extrabold px-4 tracking-[0.2em] uppercase">Kullanıcılar</p>
          </div>
          <Link href="/admin/kullanicilar" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/admin/kullanicilar') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Kullanıcı Yönetimi</Link>
          <Link href="/admin/hakkimizda" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname === '/admin/hakkimizda' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Hakkımızda</Link>
          <Link href="/admin/haberler" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/admin/haberler') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Haberler</Link>
          <Link href="/admin/sss" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/admin/sss') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Sıkça Sorular</Link>

          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-extrabold px-4 tracking-[0.2em] uppercase">Koleksiyon</p>
          </div>
          <Link href="/admin/tanimlar" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/admin/tanimlar') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Özellikler (Definitions)</Link>
          <Link href="/admin/seriler" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/admin/seriler') ? 'bg-[#D22B2B] text-white shadow-md shadow-[#D22B2B]/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Seriler</Link>
          <Link href="/admin/figurler" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/admin/figurler') ? 'bg-[#D22B2B] text-white shadow-md shadow-[#D22B2B]/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Figürler</Link>
          <Link href="/admin/borsa" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/admin/borsa') ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:scale-[0.98]'}`}>Borsa / Fiyatlar</Link>
          <Link href="/admin/slaytlar" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/admin/slaytlar') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Slaytlar</Link>

          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-extrabold px-4 tracking-[0.2em] uppercase">İletişim</p>
          </div>
          <Link href="/admin/mesajlar" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/admin/mesajlar') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Gelen Mesajlar</Link>

          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-extrabold px-4 tracking-[0.2em] uppercase">Ayarlar</p>
          </div>
          <Link href="/admin/settings" className={`block px-4 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all duration-200 ${pathname?.startsWith('/admin/settings') ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 hover:scale-[0.98]'}`}>Authentication & Keys</Link>
        </nav>
      </aside>
  )
}
