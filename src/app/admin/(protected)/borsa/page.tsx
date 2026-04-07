import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import BorsaRowClient from './BorsaRowClient';

export const metadata = {
  title: 'Borsa (Piyasa Yapıcı) - Minifigürlerim Admin',
};

export const revalidate = 0;

export default async function AdminBorsaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profileCheck } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profileCheck?.role !== 'admin') {
     return <div className="p-10 text-red-600 font-bold text-center mt-20">Yetkisiz Erişim (403). Sadece Yöneticiler piyasa işlemi yapabilir.</div>;
  }

  // Güvenli (Hatasız) şekilde verileri çek. Eğer affiliate_link sütunu varsa dahil olur.
  let { data: figures, error } = await supabase
    .from('minifigures')
    .select('id, name, figure_no, series_name, images, value_usd, affiliate_link')
    .order('series_name', { ascending: true })
    .order('figure_no', { ascending: true });

  let fallbackError = null;

  // Eğer affiliate_link column does not exist diye SQL patlarsa (SQL column yoksa), onsuz çekeriz
  if (error) {
     const fallback = await supabase
        .from('minifigures')
        .select('id, name, figure_no, series_name, images, value_usd')
        .order('series_name', { ascending: true })
        .order('figure_no', { ascending: true });
     figures = fallback.data as any[];
     fallbackError = fallback.error;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 p-8 sm:p-12 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6 mb-8 mt-16 gap-4">
            <div>
                <h1 className="text-3xl sm:text-4xl font-black text-[#111] tracking-tight">Borsa Yönetimi</h1>
                <p className="mt-2 text-sm text-gray-500 font-medium max-w-2xl leading-relaxed">Platformdaki figürlerin anlık USD piyasa değerlerini ve komisyonlu (Affiliate) satış bağlantılarını (Bricklink, Trendyol vs.) bu tablodan yönetin.</p>
            </div>
            
            <div className="bg-[#fff8f8] border border-red-100 text-red-600 px-4 py-3 rounded-xl shadow-sm text-xs font-bold w-full md:w-auto mt-4 md:mt-0">
               <span className="underline uppercase tracking-widest">Uyarı:</span> Fiyatı "Yayınla" tuşu ile güncellediğinizde otomatik olarak sistemde Fiyat Trendi Grafiğine yeni bir tarih damgasıyla aktarılır!
            </div>
        </div>

        {/* Tablo Tasarımı */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-x-auto">
           <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Katalog Figürü</th>
                    <th className="py-4 px-6 text-[10px] font-black text-gray-500 uppercase tracking-widest w-48">Anlık Piyasa Değeri (USD)</th>
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
                            <div className="text-red-500 font-bold mb-2">Veritabanı Hatası: {error.message}</div>
                        ) : null}
                        {fallbackError ? (
                            <div className="text-red-800 font-bold">İkinci Hata: {fallbackError.message}</div>
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
