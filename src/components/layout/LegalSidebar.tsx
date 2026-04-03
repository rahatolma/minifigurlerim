'use client';
import { Link, usePathname } from '@/i18n/routing';

export default function LegalSidebar() {
  const pathname = usePathname();

  const links = [
    { title: 'Gizlilik Politikası', href: '/yasal/gizlilik-politikasi' },
    { title: 'Kullanım Koşulları', href: '/yasal/kullanim-kosullari' },
    { title: 'Üyelik Sözleşmesi', href: '/yasal/uyelik-sozlesmesi' },
    { title: 'Hak İhlali Bildirimi', href: '/yasal/hak-ihlali' },
  ] as const;

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 hidden lg:block">
      <h3 className="text-[13px] font-black tracking-widest text-[#D22B2B] mb-6 uppercase flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#D22B2B]"></span>
        Yasal Sayfalar
      </h3>
      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
             <Link 
              key={link.href} 
              href={link.href}
              className={`px-4 py-3.5 rounded-xl font-bold transition-all flex items-center justify-between group ${
                isActive 
                  ? 'bg-[#D22B2B] text-white shadow-[0_6px_15px_rgba(210,43,43,0.3)]' 
                  : 'text-gray-600 hover:bg-[#F8F9FA] hover:text-black'
              }`}
            >
              <span className="tracking-wide text-[14px]">{link.title}</span>
              {isActive && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
