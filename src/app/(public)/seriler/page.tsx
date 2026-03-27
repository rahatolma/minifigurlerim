import SeriesCard from '@/components/ui/SeriesCard';
import FilterTabs from '@/components/ui/FilterTabs';

// Mock Series Verileri (Firestore/Supabase bağlandığında veritabanından gelecek)
const mockSeriesData = [
  { id: '1', title: 'LEGO® Minifigürler Serisi Spider Man Across The Spider Verse', imageUrl: 'https://via.placeholder.com/400x300.png?text=Spider+Man', views: 130, dailyViews: 0, minRead: 1.8, comments: 0, category: 'ozel-tematik' },
  { id: '2', title: 'LEGO® Minifigürler Serisi F1 Race Cars', imageUrl: 'https://via.placeholder.com/400x300.png?text=F1+Cars', views: 10, dailyViews: 0, minRead: 0, comments: 0, category: 'ozel-tematik' },
  { id: '3', title: 'LEGO® Minifigürler Serisi 27', imageUrl: 'https://via.placeholder.com/400x300.png?text=Series+27', views: 42, dailyViews: 0, minRead: 2.4, comments: 0, category: 'koleksiyon' },
  { id: '4', title: 'LEGO® Minifigürler Serisi Dungeons And Dragons', imageUrl: 'https://via.placeholder.com/400x300.png?text=DnD', views: 16, dailyViews: 0, minRead: 2.5, comments: 0, category: 'ozel-tematik' },
  { id: '5', title: 'LEGO® Minifigürler Serisi 26', imageUrl: 'https://via.placeholder.com/400x300.png?text=Series+26', views: 19, dailyViews: 0, minRead: 2.3, comments: 0, category: 'koleksiyon' },
  { id: '6', title: 'LEGO® Minifigürler Serisi 25', imageUrl: 'https://via.placeholder.com/400x300.png?text=Series+25', views: 5, dailyViews: 0, minRead: 2.2, comments: 0, category: 'koleksiyon' },
  { id: '7', title: 'LEGO® Minifigürler Serisi Marvel Studios 2', imageUrl: 'https://via.placeholder.com/400x300.png?text=Marvel', views: 5, dailyViews: 0, minRead: 2.3, comments: 0, category: 'karakter-paketleri' },
  { id: '8', title: 'LEGO® Minifigürler Serisi Disney 100', imageUrl: 'https://via.placeholder.com/400x300.png?text=Disney', views: 4, dailyViews: 0, minRead: 2.2, comments: 0, category: 'karakter-paketleri' },
  { id: '9', title: 'LEGO® Minifigürler Serisi 24', imageUrl: 'https://via.placeholder.com/400x300.png?text=Series+24', views: 4, dailyViews: 0, minRead: 2.2, comments: 0, category: 'koleksiyon' },
];

const seriesTabs = [
  { id: 'all', label: 'All' },
  { id: 'karakter-paketleri', label: 'Karakter Paketleri' },
  { id: 'koleksiyon', label: 'Koleksiyon Serileri' },
  { id: 'ozel-tematik', label: 'Özel Tematik Seriler' },
];

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const category = (resolvedParams?.cat as string) || 'all';
  
  const filteredSeries = category === 'all' 
    ? mockSeriesData 
    : mockSeriesData.filter(s => s.category === category);

  return (
    <div className="bg-[#fcfcfc] min-h-screen pt-4 pb-20">
      {/* Kategoriler (FilterTabs) */}
      <FilterTabs tabs={seriesTabs} activeTab={category} basePath="/seriler" />
      
      {/* Seriler Izgarası */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredSeries.map(series => (
            <SeriesCard key={series.id} {...series} />
          ))}
        </div>
        
        {filteredSeries.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-medium">
            <h2 className="text-2xl font-bold text-black mb-2">Aradığınız Şey Bulunamadı...</h2>
            <p>Bu kategoride henüz bir seri bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
