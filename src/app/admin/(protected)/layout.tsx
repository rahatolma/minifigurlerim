import Sidebar from '@/components/admin/Sidebar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Yetki Yok (Giriş Yapılmamış)
  if (!user) {
     redirect('/admin/login');
  }

  // Admin Kontrolü
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
     return (
       <div className="flex min-h-screen bg-[#F8F9FA] justify-center items-center text-center p-6">
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-red-100 max-w-lg w-full">
             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
             </div>
             <h1 className="text-2xl font-black text-gray-900 tracking-tight">Erişim Reddedildi (403)</h1>
             <p className="mt-2 text-gray-500 text-sm font-medium">
               Bu paneli görüntülemek için "admin" yetkisine sahip olmalısınız.<br/><br/>
               (Eğer kurucuysanız Supabase üzerinden profiles tablonuzdaki role değerini 'admin' yapın.)
             </p>
             <a href="/" className="mt-8 inline-block px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-colors">Siteye Dön</a>
          </div>
       </div>
     );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] antialiased text-black w-full" style={{ paddingLeft: '280px' }}>
      <Sidebar />
      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        {children}
      </main>
    </div>
  );
}
