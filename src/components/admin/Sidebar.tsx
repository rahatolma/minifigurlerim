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
            <img src="/uploads/media__1774631571720.png" alt="Minifigürlerim Logo" className="h-[32px] w-auto" />
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-0.5 overflow-y-auto">
          
          <Link href="/admin" className={`block px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors ${pathname === '/admin' ? 'bg-[#111] text-white shadow-sm' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>Dashboard</Link>
          
          <div className="mt-6 mb-1">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">İçerik</p>
          </div>
          <Link href="/admin/seriler" className={`block px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors ${pathname?.startsWith('/admin/seriler') ? 'bg-[#111] text-white shadow-sm' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>Seriler</Link>
          <Link href="/admin/figurler" className={`block px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors ${pathname?.startsWith('/admin/figurler') ? 'bg-[#111] text-white shadow-sm' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>Figürler</Link>
          <Link href="/admin/haberler" className={`block px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors ${pathname?.startsWith('/admin/haberler') ? 'bg-[#111] text-white shadow-sm' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>Haberler</Link>
          <Link href="/admin/hakkimizda" className={`block px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors ${pathname === '/admin/hakkimizda' ? 'bg-[#111] text-white shadow-sm' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>Hakkımızda</Link>
          <Link href="/admin/slaytlar" className={`block px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors ${pathname?.startsWith('/admin/slaytlar') ? 'bg-[#111] text-white shadow-sm' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>Slaytlar</Link>

          <div className="mt-6 mb-1">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">Koleksiyon Verisi</p>
          </div>
          <Link href="/admin/tanimlar" className={`block px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors ${pathname?.startsWith('/admin/tanimlar') ? 'bg-[#111] text-white shadow-sm' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>Tanımlar</Link>
          <Link href="/admin/affiliate" className={`block px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors ${pathname?.startsWith('/admin/affiliate') ? 'bg-green-600 text-white shadow-sm' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}`}>Fiyat / Affiliate</Link>

          <div className="mt-6 mb-1">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">Kitle & İletişim</p>
          </div>
          <Link href="/admin/mesajlar" className={`block px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors ${pathname?.startsWith('/admin/mesajlar') ? 'bg-[#111] text-white shadow-sm' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>Gelen Mesajlar</Link>
          <Link href="/admin/aboneler" className={`block px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors ${pathname?.startsWith('/admin/aboneler') ? 'bg-[#111] text-white shadow-sm' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>Bülten Aboneleri</Link>

          <div className="mt-6 mb-1">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">Sistem</p>
          </div>
          <Link href="/admin/kullanicilar" className={`block px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors ${pathname?.startsWith('/admin/kullanicilar') && !pathname?.startsWith('/admin/kullanicilar/audit') ? 'bg-[#111] text-white shadow-sm' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>Kullanıcı Yönetimi</Link>
          <Link href="/admin/kullanicilar/audit" className={`block px-4 py-2.5 rounded-md text-[13.5px] font-bold transition-colors ${pathname?.startsWith('/admin/kullanicilar/audit') ? 'bg-[#111] text-white shadow-sm' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}>Audit Logları</Link>
        </nav>
      </aside>
  )
}
