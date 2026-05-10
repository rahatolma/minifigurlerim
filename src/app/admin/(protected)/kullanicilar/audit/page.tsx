import { redirect } from 'next/navigation';
import Link from 'next/link';
import Pagination from '@/app/cto/(protected)/kullanicilar/components/Pagination';
import { getAuthUserProfile, getAdminAuditLogsDal } from '@/services/action_dal';
import AuditFilters from '@/app/cto/(protected)/kullanicilar/audit/components/AuditFilters';

export const metadata = {
  title: 'Audit Logları - Minifigürlerim Admin',
};

export const revalidate = 0;

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const { user, profile } = await getAuthUserProfile();

  if (!user) {
    redirect('/admin/login');
  }

  if (profile?.role !== 'admin') {
     return (
        <div className="flex-1 flex flex-col p-10 mt-16 text-center">
            <h1 className="text-3xl font-black text-red-600 mb-4">Yetki Reddedildi (403)</h1>
            <p className="text-gray-500 max-w-lg mx-auto">Bu modülü sadece "Admin" rolüne sahip sistem yöneticileri görüntüleyebilir.</p>
        </div>
     )
  }

  const limit = 25;
  const page = typeof resolvedParams?.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const actionFilter = typeof resolvedParams?.action === 'string' ? resolvedParams.action : undefined;
  const targetUserId = typeof resolvedParams?.target_user === 'string' ? resolvedParams.target_user : undefined;

  let logs: any = [];
  let totalCount = 0;
  let errorMsg = null;

  try {
     const result = await getAdminAuditLogsDal(page, limit, targetUserId, actionFilter);
     logs = result.logs;
     totalCount = result.count;
  } catch (err: any) {
     console.error(err);
     errorMsg = err.message;
  }

  if (errorMsg) {
     return <div className="p-10 text-red-600">Loglar yüklenemedi: {errorMsg}</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 p-8 sm:p-12 pb-32">
        <Link href="/admin/kullanicilar" className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2 w-max mb-6">
            ← Kullanıcı Yönetimine Dön
        </Link>
        
        <div className="flex justify-between items-end border-b border-gray-200 pb-6 mb-8">
            <div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#111] tracking-tight">Sistem Audit Logları</h1>
                <p className="mt-2 text-sm text-gray-500 font-medium">Platform üzerinde gerçekleştirilen kritik yetki ve kısıtlama işlemlerinin kayıtları.</p>
            </div>
            
            <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3 w-max">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Toplam Kayıt</span>
                <span className="text-lg font-black text-gray-900">{totalCount}</span>
            </div>
        </div>

        <AuditFilters currentAction={actionFilter} currentTarget={targetUserId} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6 overflow-x-auto">
           <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Tarih</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">İşlem (Action)</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Aktör (Admin)</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Hedef Kullanıcı</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Açıklama (Reason)</th>
                 </tr>
              </thead>
              <tbody>
                 {logs?.length === 0 && (
                    <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">Log kaydı bulunamadı.</td></tr>
                 )}
                 {logs?.map((log: any) => {
                    const dateObj = new Date(log.created_at);
                    
                    return (
                        <tr key={log.id} className="bg-white hover:bg-gray-50 border-b border-gray-100 transition-colors last:border-0">
                           <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                               {dateObj.toLocaleDateString('tr-TR')} <br/>
                               <span className="text-[10px] opacity-70">{dateObj.toLocaleTimeString('tr-TR')}</span>
                           </td>
                           <td className="py-4 px-6">
                               <span className="px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-black tracking-widest uppercase rounded">
                                  {log.action}
                               </span>
                           </td>
                           <td className="py-4 px-6">
                               <div className="font-bold text-sm text-gray-900">{log.actor?.username || 'Bilinmiyor'}</div>
                               <div className="text-[10px] font-mono text-gray-500">{log.actor?.email || log.actor_admin_id}</div>
                           </td>
                           <td className="py-4 px-6">
                               <div className="font-bold text-sm text-gray-900">{log.target?.username || 'Bilinmiyor'}</div>
                               <div className="text-[10px] font-mono text-gray-500">{log.target?.email || log.target_user_id}</div>
                           </td>
                           <td className="py-4 px-6 text-xs text-gray-600">
                               {log.reason || '-'}
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
