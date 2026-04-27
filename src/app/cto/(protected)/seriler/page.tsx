'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { Plus, Loader2, Edit, Trash2, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { deleteSeriesData } from '@/app/cto/actions/series';
import toast from 'react-hot-toast';

export default function SeriesListPage() {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

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
    
    const result = await deleteSeriesData(id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
      fetchSeries();
    }
  }

  const filteredSeries = series.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedSeries = filteredSeries.reduce((acc, currentSeries) => {
    const category = currentSeries.category || 'Atanmamış Kategoriler';
    if (!acc[category]) acc[category] = [];
    acc[category].push(currentSeries);
    return acc;
  }, {} as Record<string, any[]>);

  // Arama metni değiştiğinde, eğer arama varsa kategorileri aç
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setOpenCategories(Object.keys(groupedSeries));
    } else {
      setOpenCategories([]);
    }
  }, [searchQuery]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleBulkGenerate = async () => {
    setIsBulkGenerating(true);
    const toastId = toast.loading('Eksik çeviriler taranıyor ve kuyruğa alınıyor...');
    try {
      const res = await fetch('/api/jobs/bulk-generate-missing-en', {
        method: 'POST'
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'İşlem başarısız');
      
      toast.success(`İşlem Tamamlandı! İşlenen: ${data.processed}, Kuyruğa Alınan: ${data.queued}, Atlanan: ${data.skipped}`, { id: toastId, duration: 6000 });
      
      // Refresh list to update UI states
      fetchSeries();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsBulkGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">LEGO Serileri</h1>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">MINIFIG OS. ENTERPRISE SYSTEM</p>
          <div className="mt-3 inline-flex bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider">
            ⚠️ Not: Web arayüzündeki Popüler sıralama şu an "total_views" bazlıdır (geçici)
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Serilerde Ara..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-sm px-4 py-4 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-black w-full md:w-64"
          />
          <button 
            onClick={handleBulkGenerate}
            disabled={isBulkGenerating}
            className="bg-blue-600 text-white px-6 py-4 rounded-sm shadow-md text-xs font-black tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all uppercase whitespace-nowrap disabled:opacity-50"
          >
            {isBulkGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Toplu Çeviri Kuyruğu (25)
          </button>
          <Link href="/cto/seriler/yeni" className="bg-black text-white px-8 py-4 rounded-sm shadow-md text-xs font-black tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all uppercase whitespace-nowrap">
            <Plus size={16} /> Yeni Seri Ekle
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-24"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
      ) : (
        <div className="space-y-4">
          {Object.keys(groupedSeries).length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-16 text-center text-gray-400 font-bold">
              Veritabanında henüz bir seri kaydı bulunmuyor veya arama eşleşmedi.
            </div>
          ) : (
            Object.keys(groupedSeries).map(categoryName => {
              const isOpen = openCategories.includes(categoryName);
              const categorySeries = groupedSeries[categoryName];

              return (
                <div key={categoryName} className="bg-white border text-left border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all duration-300">
                  {/* Akordeon Başlığı */}
                  <div 
                    onClick={() => toggleCategory(categoryName)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
                         <ChevronRight size={20} strokeWidth={2.5} />
                      </div>
                      <h2 className="font-black text-gray-900 tracking-tight text-[15px] uppercase">{categoryName}</h2>
                      <span className="bg-gray-100 text-gray-600 font-bold px-2.5 py-0.5 rounded text-[10px] ml-2 tracking-widest">{categorySeries.length} Kategori İçi Seri</span>
                    </div>
                  </div>

                  {/* Akordeon İçeriği (Tablo) */}
                  {isOpen && (
                    <div className="border-t border-gray-100 overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap table-fixed">
                        <thead className="bg-[#fcfcfc] border-b border-gray-100 text-gray-500 font-black uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-4 py-4 w-[6%] min-w-[70px]">Görsel</th>
                            <th className="px-6 py-4 w-[30%] min-w-[200px]">Seri Adı</th>
                            <th className="px-6 py-4 w-[8%]">Seri No</th>
                            <th className="px-6 py-4 w-[15%]">Kategori</th>
                            <th className="px-6 py-4 w-[11%]">Figür Adedi</th>
                            <th className="px-6 py-4 w-[10%]">Çıkış</th>
                            <th className="px-6 py-4 w-[10%]">Nadirlik</th>
                            <th className="px-6 py-4 w-[10%] text-right min-w-[80px]">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-semibold text-[13px] text-gray-800">
                          {categorySeries.map((s: any) => {
                            const releaseText = `${s.release_month || ''} ${s.release_year || ''}`.trim() || '-';
                            return (
                              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 w-[6%]">
                                  {s.cover_image_url ? (
                                    <img src={s.cover_image_url} alt={s.title} className="h-10 w-14 object-contain rounded border border-gray-200 bg-white" />
                                  ) : (
                                    <div className="h-10 w-14 bg-gray-50 rounded border border-gray-100 flex items-center justify-center text-[9px] text-gray-400 font-bold tracking-widest">YOK</div>
                                  )}
                                </td>
                                <td className="px-6 py-3 font-black text-gray-900 truncate w-[30%]">{s.title}</td>
                                <td className="px-6 py-3 text-gray-600 font-bold w-[8%]">{s.series_no || '-'}</td>
                                <td className="px-6 py-3 text-gray-500 truncate w-[15%]">{s.category}</td>
                                <td className="px-6 py-3 w-[11%]">{s.figure_count || '-'}</td>
                                <td className="px-6 py-3 truncate w-[10%]">{releaseText}</td>
                                <td className="px-6 py-3 w-[10%]">
                                  {s.final_rarity ? (
                                    <span className="bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded text-[9px] uppercase tracking-widest">{s.final_rarity}</span>
                                  ) : '-'}
                                </td>
                                <td className="px-6 py-3 w-[10%]">
                                   <div className="flex items-center justify-end gap-1">
                                     <Link href={`/cto/seriler/${s.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"><Edit size={16} /></Link>
                                     <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"><Trash2 size={16} /></button>
                                   </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
