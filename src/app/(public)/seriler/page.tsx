import SeriesCard from '@/components/ui/SeriesCard';
import SeriesFilterClient from '@/components/ui/SeriesFilterClient';
import Link from 'next/link';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import { supabase } from '@/utils/supabase/client';

export const revalidate = 0; // Her zaman canlı veriyi çek (SSR)

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const categoryParam = (resolvedParams?.category as string) || 'all';
  const sortParam = (resolvedParams?.sort as string) || 'newest';
  const seriesParam = (resolvedParams?.series as string) || 'all';
  
  // Öncelikle Seri Kategorileri grubunu bul
  const { data: groups } = await supabase.from('definition_groups').select('*');
  const seriesGroup = groups?.find(g => g.name.toLowerCase().includes('seri') && g.name.toLowerCase().includes('kategori'));
  const targetType = seriesGroup ? seriesGroup.slug : 'seri-kategorileri';

  // 1. Kategorileri Çek
  const { data: catData } = await supabase.from('categories').select('*').eq('type', targetType).order('created_at', { ascending: true });
  const categoryFilters = (catData || []).map(c => ({ slug: c.slug, name: c.name }));

  // 2. Tüm Serileri Çek (Dropdown için)
  const { data: allSeries } = await supabase.from('series').select('*').order('created_at', { ascending: false });
  const seriesListFilters = (allSeries || []).map(s => ({ slug: s.slug || s.id.toString(), title: s.title }));

  // 3. Filtrelenmiş Serileri belirle
  let filteredSeries = allSeries || [];

  if (categoryParam !== 'all') {
    const selectedCat = catData?.find(c => c.slug === categoryParam);
    if (selectedCat) {
      filteredSeries = filteredSeries.filter(s => s.category === selectedCat.name);
    }
  }

  if (seriesParam !== 'all') {
    filteredSeries = filteredSeries.filter(s => (s.slug || s.id.toString()) === seriesParam);
  }

  if (sortParam === 'newest') {
    // Already sorted by created_at desc (Default)
  } else if (sortParam === 'oldest') {
    filteredSeries = filteredSeries.reverse();
  } else if (sortParam === 'popular') {
    filteredSeries = [...filteredSeries].sort((a, b) => (b.total_views || 0) - (a.total_views || 0));
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen">
      
      {/* ŞABLON BREADCRUMB */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ height: '70px' }}>
             <div className="flex items-center">
                 <a href="/" className="hover:text-black transition-colors">Ana Sayfa</a> 
                 <span className="mx-3 text-gray-200">/</span> 
                 <span className="text-gray-900">Seriler</span>
             </div>
        </div>
      </div>

      <div className="sticky bg-[#fcfcfc] py-4 border-b border-gray-100 shadow-sm mb-6 z-40" style={{ top: '142px' }}>
        <div className="max-w-7xl mx-auto px-8">
          <SeriesFilterClient 
            categories={categoryFilters}
            seriesList={seriesListFilters}
            totalCount={filteredSeries.length}
          />
        </div>
      </div>
      
      {/* 
        BLOK 3: Şablon Izgara Sistemi (Grid) 
      */}
      <div className="max-w-7xl mx-auto px-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
           {filteredSeries.map(series => (
            <SeriesCard 
                key={series.id} 
                id={series.slug || series.id}
                title={series.title}
                imageUrl={series.cover_image_url || 'https://via.placeholder.com/400x300.png?text=Görsel+Yok'}
                views={series.total_views || 0}
                dailyViews={series.daily_views || 0}
                minRead={Math.max(1, Math.floor((series.description?.length || 0) / 250))}
                comments={0}
            />
          ))}
        </div>
        
        {/* Boş Durum (Empty State) Şablonu */}
        {filteredSeries.length === 0 && (
          <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-center w-full shadow-sm mt-4">
            <LegoHeadIcon mode="search" className="w-24 h-24 mb-6" color="text-gray-200" />
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-2">Bulunamadı</h2>
            <p className="text-sm font-medium text-gray-500 max-w-sm">Mevcut filtrelere uyan bir LEGO serisi bulunmuyor. Diğer seçenekleri deneyebilirsin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
