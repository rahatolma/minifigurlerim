'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabase/client';
import FigureCard from '@/components/ui/FigureCard';
import { Search, Loader2, Filter } from 'lucide-react';

export default function FiguresPage() {
  const [figures, setFigures] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [fRes, sRes] = await Promise.all([
          supabase.from('minifigures').select('*').order('created_at', { ascending: false }),
          supabase.from('series').select('id, title').order('created_at', { ascending: false })
        ]);
        
        if (fRes.error) throw fRes.error;
        if (sRes.error) throw sRes.error;

        if (fRes.data) setFigures(fRes.data);
        if (sRes.data) setSeriesList(sRes.data);
      } catch (err) {
        console.error("Figürler yüklenirken hata oluştu: ", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredFigures = useMemo(() => {
    return figures.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || 
                            (f.code && f.code.toLowerCase().includes(search.toLowerCase()));
      const matchesSeries = selectedSeries === 'all' || f.series_id === selectedSeries;
      return matchesSearch && matchesSeries;
    });
  }, [figures, search, selectedSeries]);

  return (
    <div className="bg-white min-h-screen pb-32">
      
      {/* YATAY FİLTRE BARI (Görsel 5 Stili) */}
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-8">
        <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex flex-wrap items-center gap-4 shadow-sm">
            <select className="border border-gray-200 rounded-lg px-4 py-3 text-[13px] font-bold outline-none sm:w-48 bg-white cursor-pointer appearance-none text-black focus:ring-2 focus:ring-[#002f6c] transition-all">
                <option value="En Yeniler">En Yeniler</option>
                <option value="En Eskiler">En Eskiler</option>
            </select>
            
            <select 
                value={selectedSeries} 
                onChange={e => setSelectedSeries(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-3 text-[13px] font-bold outline-none sm:w-56 bg-white cursor-pointer appearance-none text-black hover:border-black focus:ring-2 focus:ring-[#002f6c] transition-all"
            >
                <option value="all">Tüm Seriler</option>
                {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            
            <div className="w-full sm:w-auto relative flex-1 max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="Figür Adı / Kodu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg py-3 pl-10 pr-4 text-[13px] font-bold outline-none focus:ring-2 focus:ring-[#002f6c] hover:border-black bg-white text-black placeholder:font-medium placeholder:opacity-50 transition-all"
                />
            </div>
            
            <button className="bg-[#002f6c] hover:bg-blue-900 text-white font-black text-[12px] tracking-widest px-10 py-3.5 rounded-lg transition-colors shadow-md border border-transparent sm:ml-auto">
                UYGULA
            </button>
            <a href="#" className="text-[13px] font-bold text-[#002f6c] hover:text-black transition-colors sm:ml-4 whitespace-nowrap hidden md:block">Tüm Filtreleri Göster</a>
        </div>
      </div>

      {/* LİSTELEME KISMI */}
      <div className="max-w-7xl mx-auto px-8 pb-32">
            {loading ? (
                <div className="flex flex-col items-center justify-center p-32 text-gray-300 w-full">
                    <Loader2 className="animate-spin mb-4" size={48} />
                    <p className="font-bold text-sm tracking-widest uppercase">Figürler Taranıyor...</p>
                </div>
            ) : filteredFigures.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center w-full">
                    <div className="text-6xl mb-6 opacity-20">🪀</div>
                    <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest mb-2">Aradığın Figürü Bulamadık</h2>
                    <p className="text-sm font-medium text-gray-500">Mevcut filtrelere uyan bir LEGO figürü bulunmuyor.</p>
                </div>
            ) : (
                <>
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-gray-500 font-black text-[11px] uppercase tracking-widest">
                            <span className="text-black font-black">{filteredFigures.length}</span> FİGÜR BULUNDU.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredFigures.map(fig => (
                            <FigureCard 
                                key={fig.id} 
                                id={fig.id}
                                name={fig.name}
                                seriesName={fig.series_name}
                                imageUrl={fig.images && fig.images.length > 0 ? fig.images[0] : 'https://via.placeholder.com/300x400.png?text=Görsel+Yok'}
                                views={fig.total_views}
                                dailyViews={fig.daily_views}
                                minRead={0}
                                comments={0}
                            />
                        ))}
                    </div>
                </>
            )}
      </div>

    </div>
  );
}
