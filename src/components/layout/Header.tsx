import Link from 'next/link';
import { Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full flex-col font-sans">
      {/* Top Tier: Logo & Search */}
      <div className="bg-white text-black py-4 px-8 flex flex-col md:flex-row items-center justify-between mx-auto max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--color-brand-red)'}}>
            <span className="text-xl">🙂</span>
          </div>
          <span className="text-3xl font-black tracking-tighter uppercase">Minifigürlerim</span>
        </Link>
        
        {/* Search Bar */}
        <div className="flex w-full md:w-auto md:min-w-[500px]">
          <input 
            type="text" 
            placeholder="Koleksiyon içinde arama yap..." 
            className="flex-1 border border-gray-300 rounded-l-md px-4 py-3 font-medium focus:outline-none focus:ring-1 focus:ring-black placeholder:text-sm placeholder:opacity-70"
          />
          <button className="bg-black text-white px-6 py-3 rounded-r-md hover:bg-gray-800 transition-colors">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Tier: Navigation */}
      <div className="bg-[var(--color-brand-red)] w-full text-white shadow-md">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center relative">
          
          {/* Minifigür Evi Button */}
          <Link href="/" className="px-10 py-5 font-bold text-lg hover:bg-black/20 transition-colors whitespace-nowrap hidden md:block" style={{ backgroundColor: 'rgba(0,0,0,0.15)'}}>
            Minifigür Evi
          </Link>
          
          {/* Nav Links */}
          <nav className="flex-1 flex justify-center py-4 md:py-0">
            <ul className="flex flex-wrap justify-center gap-10 text-[15px] font-bold tracking-wide">
              <li><Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link></li>
              <li><Link href="/seriler" className="hover:text-black transition-colors">LEGO® Minifigür Serileri</Link></li>
              <li><Link href="/figurler" className="hover:text-black transition-colors">LEGO® Minifigürleri</Link></li>
              <li className="group relative">
                <Link href="/hakkimizda" className="flex items-center gap-1 hover:text-black transition-colors">
                  Hakkımızda
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
              </li>
              <li><Link href="/iletisim" className="hover:text-black transition-colors">İletişim</Link></li>
            </ul>
          </nav>

        </div>
      </div>
    </header>
  );
}
