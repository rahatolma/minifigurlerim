'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react';

export default function FiguresListPage() {
  const [figures, setFigures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFigures();
  }, []);

  const fetchFigures = async () => {
    try {
      const { data, error } = await supabase.from('minifigures').select('*, series(title)').order('created_at', { ascending: false });
      if (error) throw error;
      setFigures(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if(!confirm(`DİKKAT: "${name}" figürünü silmek istediğinize emin misiniz?`)) return;
    await supabase.from('minifigures').delete().eq('id', id);
    fetchFigures();
  }

  return (
    <div className="p-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">LEGO Figürleri</h1>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">MINIFIG OS. ENTERPRISE SYSTEM</p>
        </div>
        <Link href="/admin/figurler/yeni" className="bg-black text-white px-8 py-4 rounded-sm shadow-md text-xs font-black tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all uppercase">
          <Plus size={16} /> Yeni Figür Ekle
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-24"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fcfcfc] border-b border-gray-200 text-gray-600 font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-8 py-5">Görsel</th>
                  <th className="px-8 py-5">Figür Adı</th>
                  <th className="px-8 py-5">Bağlı Olduğu Seri</th>
                  <th className="px-8 py-5">Nadir / Değer</th>
                  <th className="px-8 py-5 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-semibold text-[13px] text-gray-800">
                {figures.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-16 text-center text-gray-400 font-bold">Veritabanında henüz bir figür kaydı bulunmuyor.</td></tr>
                ) : (
                  figures.map(f => {
                    const firstImage = (f.images && f.images.length > 0) ? f.images[0] : null;
                    return (
                      <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-4">
                          {firstImage ? (
                            <img src={firstImage} alt={f.name} className="h-16 w-12 object-contain rounded-sm" />
                          ) : (
                            <div className="h-16 w-12 bg-gray-50 rounded-sm border border-gray-100 flex items-center justify-center text-[10px] text-gray-300">YOK</div>
                          )}
                        </td>
                        <td className="px-8 py-4 font-black text-gray-900 truncate max-w-[200px]">{f.name}</td>
                        <td className="px-8 py-4 text-gray-600 truncate max-w-[200px]">{f.series?.title || f.series_name || '-'}</td>
                        <td className="px-8 py-4">
                          <span className="block">{f.rarity || '-'}</span>
                          <span className="text-green-600 font-black text-[11px] block mt-1">{f.value_usd ? `$${f.value_usd}` : '-'}</span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(f.id, f.name)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
