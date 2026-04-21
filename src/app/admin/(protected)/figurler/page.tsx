'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { ChevronRight, Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { deleteFigureData } from '@/app/admin/actions/figure';
import { MINIFIGURES_SELECT_FIELDS } from '@/utils/queries';
import toast from 'react-hot-toast';

export default function FiguresListPage() {
  const [figures, setFigures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  useEffect(() => {
    fetchFigures();
  }, []);

  const fetchFigures = async () => {
    try {
      const { data, error } = await supabase.from('minifigures').select(`${MINIFIGURES_SELECT_FIELDS}, series(title, release_year, release_month, series_no)`).order('created_at', { ascending: false });
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
    
    const result = await deleteFigureData(id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
      fetchFigures();
    }
  }

  // Filtering
  const filteredFigures = figures.filter(f => 
       f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       (f.series?.title && f.series.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
       (f.series_name && f.series_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group by series
  const groupedFigures = filteredFigures.reduce((acc, f) => {
    const seriesName = f.series?.title || f.series_name || '🚀 Serisiz / Bağımsız Figürler';
    if (!acc[seriesName]) acc[seriesName] = [];
    acc[seriesName].push(f);
    return acc;
  }, {} as Record<string, any[]>);

  // Arama metni değiştiğinde, eğer arama varsa grupları aç
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setExpandedGroups(Object.keys(groupedFigures));
    } else {
      setExpandedGroups([]);
    }
  }, [searchQuery]);

  // Arama metni değiştiğinde veya figürler yüklendiğinde tüm grupları açık hale getir
  useEffect(() => {
    setExpandedGroups(Object.keys(groupedFigures));
  }, [figures, searchQuery]);

  const toggleGroup = (groupName: string) => {
    if (expandedGroups.includes(groupName)) {
      setExpandedGroups(expandedGroups.filter(g => g !== groupName));
    } else {
      setExpandedGroups([...expandedGroups, groupName]);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">LEGO Figürleri</h1>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">MINIFIG OS. ENTERPRISE SYSTEM</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto bg-gray-100 p-1 rounded-sm border border-gray-200">
            <button onClick={() => setExpandedGroups(Object.keys(groupedFigures))} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all">Tümünü Aç</button>
            <button onClick={() => setExpandedGroups([])} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all">Tümünü Kapat</button>
          </div>
          <input 
            type="text" 
            placeholder="Koleksiyonda Ara..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-sm px-4 py-3.5 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-black w-full md:w-64"
          />
          <Link href="/admin/figurler/yeni" className="bg-black text-white px-8 py-3.5 rounded-sm shadow-md text-xs font-black tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all uppercase whitespace-nowrap">
            <Plus size={16} /> Yeni Figür
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-24"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedFigures)
            .sort((a, b) => {
               const sampleA = a[1][0];
               const sampleB = b[1][0];
               
               // Tarih Bilgilerini Al
               const yearA = Number(sampleA.series?.release_year || sampleA.release_year || 0);
               const yearB = Number(sampleB.series?.release_year || sampleB.release_year || 0);
               
               const monthMap: Record<string, number> = {
                   'Ocak': 1, 'Şubat': 2, 'Mart': 3, 'Nisan': 4, 'Mayıs': 5, 'Haziran': 6,
                   'Temmuz': 7, 'Ağustos': 8, 'Eylül': 9, 'Ekim': 10, 'Kasım': 11, 'Aralık': 12
               };
               
               const monthA = monthMap[sampleA.series?.release_month || sampleA.release_month || ''] || 0;
               const monthB = monthMap[sampleB.series?.release_month || sampleB.release_month || ''] || 0;
               
               // Öncelikle Yıla Göre (Büyükten Küçüğe - Yeni En Üstte)
               if (yearA !== yearB) return yearB - yearA;
               
               // Yıllar aynıysa, Aya Göre (Büyükten Küçüğe - Yeni En Üstte)
               if (monthA !== monthB) return monthB - monthA;
               
               // Tarih yoksa veya eşitse, Seri Numarasına (veya İsme) göre Doğal Sıralama
               return a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' });
            })
            .map(([groupName, groupFigs]: [string, any]) => {
            const isExpanded = expandedGroups.includes(groupName);
            return (
              <div key={groupName} className="bg-white border text-left border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all duration-300">
                <div 
                  onClick={() => toggleGroup(groupName)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                       <ChevronRight size={20} strokeWidth={2.5} />
                    </div>
                    <h2 className="font-black text-gray-900 tracking-tight text-[15px] uppercase">{groupName}</h2>
                    <span className="bg-gray-100 text-gray-600 font-bold px-2.5 py-0.5 rounded text-[10px] ml-2 tracking-widest">{groupFigs.length} Seri İçi Figür</span>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#fcfcfc] border-b border-gray-100 text-gray-500 font-black uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-8 py-4">Görsel</th>
                            <th className="px-8 py-4">Figür Adı</th>
                            <th className="px-8 py-4">Nadir / Değer</th>
                            <th className="px-8 py-4 text-right">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-semibold text-[13px] text-gray-800">
                          {groupFigs
                            .sort((a: any, b: any) => {
                                // İçeride sadece figure_number bazlı sıralama! (1, 2, 3... 16)
                                const numA = parseInt(a.figure_number);
                                const numB = parseInt(b.figure_number);
                                
                                const isNumA = !isNaN(numA);
                                const isNumB = !isNaN(numB);
                                
                                if (isNumA && isNumB) {
                                  return numA - numB; // Küçükten büyüğe (1 -> 16)
                                } else if (isNumA) {
                                  return -1; // numA sayıysa öne at
                                } else if (isNumB) {
                                  return 1;
                                }
                                
                                // Sayı bulunamadıysa (Örn Promo Figürler) isme göre natural sort
                                return (a.name || "").localeCompare(b.name || "", undefined, { numeric: true, sensitivity: 'base' });
                            })
                            .map((f: any) => {
                            const firstImage = (f.images && f.images.length > 0) ? f.images[0] : null;
                            return (
                              <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-8 py-3 w-32">
                                  {firstImage ? (
                                    <img src={firstImage} alt={f.name} className="h-14 w-10 object-contain rounded-sm" />
                                  ) : (
                                    <div className="h-14 w-10 bg-gray-50 rounded-sm border border-gray-100 flex items-center justify-center text-[10px] text-gray-300">YOK</div>
                                  )}
                                </td>
                                <td className="px-8 py-3 font-black text-gray-900 truncate max-w-[300px]">{f.name}</td>
                                <td className="px-8 py-3">
                                  <span className="block">{f.rarity_def?.name || f.rarity_level || f.rarity || '-'}</span>
                                  <span className="text-green-600 font-black text-[11px] block mt-1">{f.value_usd ? `$${f.value_usd}` : '-'}</span>
                                </td>
                                <td className="px-8 py-3">
                                  <div className="flex items-center justify-end gap-1">
                                    <Link href={`/admin/figurler/${f.id}`} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"><Edit size={16} /></Link>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(f.id, f.name); }} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded transition-all"><Trash2 size={16} /></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {Object.keys(groupedFigures).length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-16 text-center text-gray-400 font-bold">
                Aranan kritere uygun figür bulunamadı.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
