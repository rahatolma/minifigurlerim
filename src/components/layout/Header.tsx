import Link from 'next/link';
import { Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full flex-col font-sans sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Tier: Logo & Search */}
      <div className="text-black py-4 px-8 flex flex-col md:flex-row items-center mx-auto max-w-7xl">
        {/* Logo %25 */}
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
            <Link href="/" className="inline-block">
            <img src="/uploads/media__1774631571720.png" alt="Minifigürlerim Logo" className="h-[30px] w-auto" />
            </Link>
        </div>
        
        {/* Search Bar %75 Sağa Yaslı */}
        <div className="w-full md:w-3/4 flex justify-end">
          <div className="flex w-full md:max-w-md">
              <input 
                type="text" 
                placeholder="Koleksiyon içinde arama yap..." 
                className="flex-1 border border-gray-300 rounded-l-md px-4 py-3 font-medium focus:outline-none focus:ring-1 focus:ring-black placeholder:text-sm placeholder:opacity-70"
              />
              <button className="bg-black text-white px-6 py-3 rounded-r-md hover:bg-gray-800 transition-colors flex flex-shrink-0 items-center justify-center">
                <Search size={20} />
              </button>
          </div>
        </div>
      </div>

      {/* Bottom Tier: Navigation */}
      <div className="bg-[var(--color-brand-red)] w-full text-white shadow-md">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center relative">
          
          {/* Nav Links */}
          <nav className="w-full flex justify-end py-0 pr-8">
            <ul className="flex flex-wrap items-center justify-end gap-8 text-[15px] font-bold tracking-wide">
              <li><Link href="/" className="hover:text-black transition-colors py-5 block">Ana Sayfa</Link></li>
              <li><Link href="/seriler" className="hover:text-black transition-colors py-5 block">LEGO® Minifigür Serileri</Link></li>
              <li><Link href="/figurler" className="hover:text-black transition-colors py-5 block">LEGO® Minifigürleri</Link></li>
              <li className="group relative">
                <Link href="/hakkimizda" className="flex items-center gap-1 hover:text-black transition-colors py-5">
                  Hakkımızda
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
              </li>
              <li><Link href="/iletisim" className="hover:text-black transition-colors py-5 block">İletişim</Link></li>
            </ul>
          </nav>

        </div>
      </div>
    </header>
  );
}
