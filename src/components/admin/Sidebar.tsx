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
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0A0A0A] text-white border-r border-[#1A1A1A] flex flex-col z-50">
        <div className="h-24 px-8 flex flex-col justify-center border-b border-[#1A1A1A]">
          <h1 className="text-xl font-black tracking-widest uppercase">MINIFIG<br/>OS.</h1>
          <p className="text-[9px] text-gray-500 font-bold tracking-[0.2em] mt-1">ENTERPRISE SYSTEM</p>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          
          <Link href="/admin" className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${pathname === '/admin' ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>Dashboard</Link>
          
          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">Sayfalar</p>
          </div>
          <Link href="/admin/kullanicilar" className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${pathname?.startsWith('/admin/kullanicilar') ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>Kullanıcı(Üye) Yönetimi</Link>
          <Link href="/admin/hakkimizda" className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${pathname === '/admin/hakkimizda' ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>Hakkımızda</Link>
          <Link href="/admin/haberler" className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${pathname?.startsWith('/admin/haberler') ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>Haberler</Link>
          <Link href="/admin/sss" className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${pathname?.startsWith('/admin/sss') ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>Sıkça Sorular</Link>

          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">Özellikler</p>
          </div>
          <Link href="/admin/tanimlar" className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${pathname?.startsWith('/admin/tanimlar') ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>Özellikler (Tanımlar)</Link>
          <Link href="/admin/seriler" className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${pathname?.startsWith('/admin/seriler') ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>Seriler</Link>
          <Link href="/admin/figurler" className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${pathname?.startsWith('/admin/figurler') ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>Figürler</Link>
          <Link href="/admin/borsa" className={`block px-4 py-3 rounded-md text-[13px] font-black tracking-wide transition-colors ${pathname?.startsWith('/admin/borsa') ? 'bg-green-500 text-white shadow-sm' : 'text-[#5CB85C] hover:text-white hover:bg-[#5CB85C]/10'}`}>Borsa (Piyasa Yapıcı)</Link>
          <Link href="/admin/slaytlar" className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${pathname?.startsWith('/admin/slaytlar') ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>Slaytlar</Link>

          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">İletişim</p>
          </div>
          <Link href="/admin/mesajlar" className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${pathname?.startsWith('/admin/mesajlar') ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>Gelen Mesajlar</Link>

          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">Ayarlar</p>
          </div>
          <Link href="/admin/settings" className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${pathname?.startsWith('/admin/settings') ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>Authentication</Link>
        </nav>
      </aside>
  )
}
