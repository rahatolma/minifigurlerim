import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans antialiased text-black">
      {/* Sidebar (TWG Enterprise OS Dark Theme) */}
      <aside className="w-[260px] bg-[#0A0A0A] text-white flex flex-col h-screen sticky top-0 shrink-0">
        <div className="p-8 border-b border-white/10 mb-4">
          <h2 className="text-xl font-black tracking-widest uppercase text-white">MINIFIG<br/>OS.</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1 font-bold">Enterprise System</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto pb-6 flex flex-col gap-1 px-4">
          <p className="text-[10px] text-gray-400 font-bold px-4 mb-2 tracking-widest uppercase">System</p>
          <Link href="/admin" className="px-4 py-3 rounded-md text-[13px] font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Dashboard</Link>
          
          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">Definitions</p>
          </div>
          <Link href="/admin/seriler" className="px-4 py-3 rounded-md text-[13px] font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors">Seriler</Link>
          
          <div className="bg-white/10 rounded-md my-1 p-1">
            <Link href="/admin/figurler" className="block px-3 py-2 rounded-sm text-[13px] font-bold bg-white text-black shadow-sm">Figürler</Link>
          </div>
          
          <div className="mt-8 mb-2">
            <p className="text-[10px] text-gray-400 font-bold px-4 tracking-widest uppercase">Settings</p>
          </div>
          <Link href="/admin/ayarlar" className="px-4 py-3 rounded-md text-[13px] font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2">Authentication</Link>
        </nav>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
