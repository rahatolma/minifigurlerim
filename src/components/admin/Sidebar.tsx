'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/admin' },
  ];
  
  const defItems = [
    { name: 'Tanımlar', href: '/admin/tanimlar' },
    { name: 'Seriler', href: '/admin/seriler' },
    { name: 'Figürler', href: '/admin/figurler' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0A0A0A] text-white border-r border-[#1A1A1A] flex flex-col z-50">
        <div className="h-24 px-8 flex flex-col justify-center border-b border-[#1A1A1A]">
          <h1 className="text-xl font-black tracking-widest uppercase">MINIFIG<br/>OS.</h1>
          <p className="text-[9px] text-gray-500 font-bold tracking-[0.2em] mt-1">ENTERPRISE SYSTEM</p>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          {/* System */}
          <div className="mb-2">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">System</p>
          </div>
          {navItems.map(item => {
              const isActive = pathname === item.href;
              return (
                  <Link key={item.name} href={item.href} className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${isActive ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                      {item.name}
                  </Link>
              )
          })}
          
          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">Definitions</p>
          </div>
          {defItems.map(item => {
              // Exact match or sub-route match (e.g. /admin/seriler/yeni starts with /admin/seriler)
              const isStrictActive = pathname ? (pathname === item.href || pathname.startsWith(item.href + '/')) : false;
              return (
                  <Link key={item.name} href={item.href} className={`block px-4 py-3 rounded-md text-[13px] font-bold transition-colors ${isStrictActive ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                      {item.name}
                  </Link>
              )
          })}

          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">Settings</p>
          </div>
          <Link href="/admin/settings" className="block px-4 py-3 rounded-md text-[13px] font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Authentication</Link>
        </nav>
      </aside>
  )
}
