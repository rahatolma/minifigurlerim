'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SlidersPage() {
  const [sliders, setSliders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSliders();
  }, []);

  async function loadSliders() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('home_sliders').select('*').order('sort_order', { ascending: true });
      
      if (error) {
        console.error("Supabase fetch error:", error);
        toast.error("Slaytlar yüklenirken bir hata oluştu.");
      } else if (data) {
        setSliders(data);
      }
    } catch (err) {
      console.error("Unexpected fetch error:", err);
      toast.error("Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu slaytı silmek istediğinize emin misiniz?')) return;
    
    // Once resimleri (storage'dan) silebiliriz, ama idareten sadece veriyi siliyoruz.
    const { error } = await supabase.from('home_sliders').delete().eq('id', id);
    if (error) {
      toast.error('Silinirken hata oluştu.');
    } else {
      toast.success('Slayt başarıyla silindi.');
      loadSliders();
    }
  }

  return (
    <div className="p-12 space-y-8 pb-32">
        <div className="flex justify-between items-center bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <div>
              <h1 className="text-xl font-black uppercase tracking-widest text-[#0A0A0A]">Kapak / Slayt Yönetimi</h1>
              <p className="text-gray-500 font-medium text-sm mt-1">Ana sayfa kapak (Hero) görsellerini ve butonlarını yönetin.</p>
            </div>
            <Link href="/admin/sayfalar/yeni" className="bg-black hover:bg-[#D22B2B] text-white transition-colors px-6 py-3 rounded-sm flex items-center gap-2 text-[11px] font-black uppercase tracking-widest shadow-md">
                <Plus size={16} /> YENİ SLAYT EKLE
            </Link>
        </div>

        {loading ? (
            <div className="bg-white rounded-md border border-gray-200 p-12 text-center text-gray-500 font-bold">
                Yükleniyor...
            </div>
        ) : sliders.length === 0 ? (
            <div className="bg-white rounded-md border border-gray-200 p-12 text-center text-gray-400 font-bold border-dashed">
                Henüz slayt eklenmedi.
            </div>
        ) : (
            <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden text-[13px] font-bold">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-200">
                            <th className="p-4 pl-6">Sıra</th>
                            <th className="p-4">Görsel</th>
                            <th className="p-4">Başlık</th>
                            <th className="p-4">Durum</th>
                            <th className="p-4 text-right pr-6">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sliders.map(s => (
                            <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 pl-6 font-black text-gray-400">{s.sort_order}</td>
                                <td className="p-4">
                                    <div className="w-24 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center border border-gray-200">
                                       {s.image_url ? (
                                           <img src={s.image_url} alt="Slide Preview" className="w-full h-full object-cover" />
                                       ) : (
                                           <span className="text-[9px] text-gray-400">GÖRSEL YOK</span>
                                       )}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-900 line-clamp-2">{s.title}</td>
                                <td className="p-4">
                                    {s.is_active ? 
                                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-sm text-[9px] uppercase tracking-widest font-black"><Eye size={12}/> Aktif</span> : 
                                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-sm text-[9px] uppercase tracking-widest font-black"><EyeOff size={12}/> Pasif</span>
                                    }
                                </td>
                                <td className="p-4 pr-6 flex justify-end gap-2">
                                    <Link href={`/admin/sayfalar/${s.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                        <Pencil size={18} />
                                    </Link>
                                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
}
