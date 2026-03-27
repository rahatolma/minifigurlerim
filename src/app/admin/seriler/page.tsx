'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react';

export default function SeriesListPage() {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const { data, error } = await supabase.from('series').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSeries(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('DİKKAT: Bu seriyi silerseniz, içindeki tüm figürler de silinebilir. Onaylıyor musunuz?')) return;
    await supabase.from('series').delete().eq('id', id);
    fetchSeries();
  }

  const filteredSeries = series.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto p-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">LEGO Serileri</h1>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">MINIFIG OS. ENTERPRISE SYSTEM</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Serilerde Ara..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-sm px-4 py-4 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-black w-full md:w-64"
          />
          <Link href="/admin/seriler/yeni" className="bg-black text-white px-8 py-4 rounded-sm shadow-md text-xs font-black tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all uppercase whitespace-nowrap">
            <Plus size={16} /> Yeni Seri Ekle
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-24"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
      ) : (
        <div className="bg-white border text-left border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#fcfcfc] border-b border-gray-200 text-gray-600 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-8 py-5">Görsel</th>
                  <th className="px-8 py-5">Seri Adı</th>
                  <th className="px-8 py-5">Kategori</th>
                  <th className="px-8 py-5">Figür Adedi</th>
                  <th className="px-8 py-5">Çıkış</th>
                  <th className="px-8 py-5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-semibold text-[13px] text-gray-800">
                {filteredSeries.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-16 text-center text-gray-400 font-bold">Veritabanında henüz bir seri kaydı bulunmuyor.</td></tr>
                ) : (
                  filteredSeries.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-4">
                        {s.cover_image_url ? (
                          <img src={s.cover_image_url} alt={s.title} className="h-12 w-16 object-contain rounded-md border border-gray-200 bg-white" />
                        ) : (
                          <div className="h-12 w-16 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center text-[10px] text-gray-300">YOK</div>
                        )}
                      </td>
                      <td className="px-8 py-4 font-black text-gray-900 truncate max-w-xs">{s.title}</td>
                      <td className="px-8 py-4 text-gray-600">{s.category}</td>
                      <td className="px-8 py-4">{s.figure_count || '-'}</td>
                      <td className="px-8 py-4">{s.release_date || '-'}</td>
                      <td className="px-8 py-4">
                         <div className="flex items-center justify-end gap-1">
                           <Link href={`/admin/seriler/${s.id}`} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"><Edit size={16} /></Link>
                           <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-all"><Trash2 size={16} /></button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
