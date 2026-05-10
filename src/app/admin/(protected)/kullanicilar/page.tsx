import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import UserAdminActions from '@/app/cto/(protected)/kullanicilar/components/UserAdminActions';
import UserAdminFilters from '@/app/cto/(protected)/kullanicilar/components/UserAdminFilters';
import Pagination from '@/app/cto/(protected)/kullanicilar/components/Pagination';
import { getAuthUserProfile, getAdminUsersDal } from '@/services/action_dal';

export const metadata = {
  title: 'Kullanıcı(Üye) Yönetimi - Minifigürlerim Admin',
};

export const revalidate = 0; // Her zaman canlı

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const { user, profile } = await getAuthUserProfile();

  if (!user) {
    redirect('/admin/login');
  }

  // Sadece Admin Rolündekiler Görebilir
  if (profile?.role !== 'admin') {
     return (
        <div className="flex-1 flex flex-col p-10 mt-16 text-center">
            <h1 className="text-3xl font-black text-red-600 mb-4">Yetki Reddedildi (403)</h1>
            <p className="text-gray-500 max-w-lg mx-auto">Bu modülü sadece "Admin" rolüne sahip sistem yöneticileri görüntüleyebilir. Lütfen veritabanından hesabınızın "role" kolonunu "admin" olarak değiştirin.</p>
        </div>
     )
  }

  const limit = 25;
  const page = typeof resolvedParams?.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const search = typeof resolvedParams?.search === 'string' ? resolvedParams.search : undefined;
  const statusFilter = typeof resolvedParams?.status === 'string' ? resolvedParams.status : undefined;

  let profiles: any = [];
  let totalCount = 0;
  let errorMsg = null;

  try {
     const result = await getAdminUsersDal(page, limit, search, statusFilter);
     profiles = result.profiles;
     totalCount = result.count;
  } catch (err: any) {
     console.error(err);
     errorMsg = err.message;
  }

  if (errorMsg) {
     return <div className="p-10 text-red-600">Profiller yüklenemedi: {errorMsg}</div>;
  }

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="flex-1 flex flex-col min-w-0 p-8 sm:p-12 pb-32">
        <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-8 mt-16">
            <div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#111] tracking-tight">Kullanıcı Yönetimi</h1>
                <p className="mt-2 text-sm text-gray-500 font-medium">Hesap onay ve yasaklama (status) durumlarını yönetin.</p>
            </div>
            
            <div className="flex items-center gap-3 w-max">
                <Link href="/admin/kullanicilar/audit" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">
                    Audit Logları
                </Link>
                <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Toplam Üye</span>
                    <span className="text-lg font-black text-gray-900">{totalCount}</span>
                </div>
            </div>
        </div>

        <UserAdminFilters />

        {/* Tablo Tasarımı */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest w-16">Profil</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Kullanıcı / ID</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Kayıt Tarihi</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Rol (Yetki)</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Durum (Status)</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Eylemler</th>
                 </tr>
              </thead>
              <tbody>
                 {profiles?.length === 0 && (
                    <tr><td colSpan={6} className="py-10 text-center text-sm text-gray-400">Henüz kayıtlı üye bulunmuyor veya arama eşleşmedi.</td></tr>
                 )}
                 {profiles?.map((p: any) => {
                    const isBanned = p.status === 'banned';
                    const isPending = p.status === 'pending';
                    const bgClass = isBanned ? 'bg-red-50/20' : (isPending ? 'bg-yellow-50/20' : 'bg-white hover:bg-gray-50');
                    const img = p.avatar_url || 'https://via.placeholder.com/150x150?text=U';
                    const dateObj = new Date(p.created_at);
                    
                    return (
                        <tr key={p.id} className={`${bgClass} border-b border-gray-100 transition-colors last:border-0`}>
                           <td className="py-4 px-6">
                               <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border border-gray-300 relative">
                                  <Image src={img} alt="Avatar" fill className="object-cover" />
                               </div>
                           </td>
                           <td className="py-4 px-6">
                               <div className="font-bold text-sm text-gray-900">{p.username || 'Google/Adsız Üye'}</div>
                               <div className="text-[10px] font-mono text-gray-500">{p.email || 'Bilinmiyor'}</div>
                               <div className="text-[10px] font-mono text-gray-400 mt-0.5" title={p.id}>{p.id.split('-')[0]}...</div>
                           </td>
                           <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                               {dateObj.toLocaleDateString('tr-TR')} <br/>
                               <span className="text-[10px] opacity-70">{dateObj.toLocaleTimeString('tr-TR')}</span>
                           </td>
                           <td className="py-4 px-6">
                               {p.role === 'admin' ? (
                                  <span className="px-2 py-1 bg-black text-white text-[10px] font-black tracking-widest uppercase rounded">Yönetici</span>
                               ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-black tracking-widest uppercase rounded">Üye</span>
                               )}
                           </td>
                           <td className="py-4 px-6">
                               {p.status === 'active' && (
                                   <div className="flex items-center gap-2 text-green-600 font-bold text-xs">
                                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                      Onaylı (Aktif)
                                   </div>
                               )}
                               {p.status === 'pending' && (
                                   <div className="flex items-center gap-2 text-yellow-600 font-bold text-xs">
                                      <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                                      İnceleme Bekliyor
                                   </div>
                               )}
                               {p.status === 'banned' && (
                                   <div className="flex items-center gap-2 text-red-600 font-bold text-xs">
                                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                      Yasaklı
                                   </div>
                               )}
                           </td>
                           <td className="py-4 px-6 text-right">
                               <UserAdminActions 
                                  userId={p.id} 
                                  status={p.status} 
                                  role={p.role}
                                  currentUserId={user.id}
                               />
                           </td>
                        </tr>
                    )
                 })}
              </tbody>
           </table>
        </div>

        <Pagination totalCount={totalCount} limit={limit} />
    </div>
  );
}
