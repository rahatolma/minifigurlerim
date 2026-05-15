import { redirect } from 'next/navigation';
import BorsaRowClient from './BorsaRowClient';
import { getAuthUserProfile, getAdminBorsaFiguresDal } from '@/services/action_dal';

export const metadata = {
  title: 'Fiyat & Affiliate Yönetimi - Minifigürlerim Admin',
};

export const revalidate = 0;

export default async function AdminBorsaPage() {
  const { user, profile } = await getAuthUserProfile();

  if (!user) redirect('/admin/login');

  if (profile?.role !== 'admin') {
     return <div className="p-10 text-red-600 font-bold text-center mt-20">Yetkisiz Erişim (403). Sadece Yöneticiler işlem yapabilir.</div>;
  }

  const { figures, error, fallbackError } = await getAdminBorsaFiguresDal();

  return (
    <div className="flex-1 flex flex-col min-w-0 p-8 sm:p-12 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6 mb-8 mt-16 gap-4">
            <div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#111] tracking-tight">Fiyat / Affiliate Yönetimi</h1>
                <p className="mt-2 text-sm text-gray-500 font-medium max-w-2xl leading-relaxed">Platformdaki figürlerin referans USD değerlerini ve komisyonlu (Affiliate) satış bağlantılarını bu tablodan yönetin.</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-xl shadow-sm text-xs font-bold w-full md:w-auto mt-4 md:mt-0">
               <span className="underline uppercase tracking-widest">Bilgi:</span> Fiyatı "Kaydet" tuşu ile güncelleyebilirsiniz. Bu fiyatlar gösterge niteliğindedir.
            </div>
        </div>

        {/* Tablo Tasarımı */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-x-auto">
           <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Katalog Figürü</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest w-48">Referans Fiyat (USD)</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Satın Al Linki (Affiliate URL)</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right w-40">Eylem</th>
                 </tr>
              </thead>
              <tbody>
                 {figures?.map((fig: any) => (
                    <BorsaRowClient key={fig.id} figure={fig} />
                 ))}
                  {(!figures || figures.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-sm text-gray-400 font-medium">
                        {error ? (
                            <div className="text-red-500 font-bold mb-2">Veritabanı Hatası: {error}</div>
                        ) : null}
                        {fallbackError ? (
                            <div className="text-red-800 font-bold">İkinci Hata: {fallbackError}</div>
                        ) : null}
                        {(!error && !fallbackError) ? 'Sistemde kaydedilmiş minifigür bulunmuyor.' : ''}
                      </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
    </div>
  );
}
