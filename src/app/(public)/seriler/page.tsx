import SeriesCard from '@/components/ui/SeriesCard';
import FilterTabs from '@/components/ui/FilterTabs';
import { supabase } from '@/utils/supabase/client';

export const revalidate = 0; // Her zaman canlı veriyi çek (SSR)

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const categorySlug = (resolvedParams?.cat as string) || 'all';
  
  // 1. Kategorileri Supabase'den Çek
  const { data: catData, error: catError } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
  
  // 2. Dinamik Tab'ları oluştur
  const seriesTabs = [
    { id: 'all', label: 'Tüm Seriler' },
    ...(catData || []).map(c => ({ id: c.slug, label: c.name }))
  ];

  // 3. Kategoriye göre Serileri Çek
  let query = supabase.from('series').select('*').order('created_at', { ascending: false });
  
  if (categorySlug !== 'all') {
    const selectedCat = catData?.find(c => c.slug === categorySlug);
    if (selectedCat) {
      query = query.eq('category', selectedCat.name);
    }
  }

  const { data: seriesData, error: seriesError } = await query;
  const filteredSeries = seriesData || [];

  return (
    <div className="bg-[#fcfcfc] min-h-screen pt-4 pb-20">
      {/* Dinamik Kategoriler (FilterTabs) */}
      <FilterTabs tabs={seriesTabs} activeTab={categorySlug} basePath="/seriler" />
      
      {/* Seriler Izgarası (Canlı) */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredSeries.map(series => (
            <SeriesCard 
                key={series.id} 
                id={series.id}
                title={series.title}
                imageUrl={series.cover_image_url || 'https://via.placeholder.com/400x300.png?text=Görsel+Yok'}
                views={0}
                dailyViews={0}
                minRead={Math.max(1, Math.floor((series.description?.length || 0) / 250))}
                comments={0}
            />
          ))}
        </div>
        
        {filteredSeries.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-medium">
            <h2 className="text-2xl font-bold text-black mb-2">Aradığınız Seri Bulunamadı...</h2>
            <p>Bu kategoride henüz bir seri yüklenmemiş.</p>
          </div>
        )}
      </div>
    </div>
  );
}
