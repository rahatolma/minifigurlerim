import FigureCard from '@/components/ui/FigureCard';
import FilterTabs from '@/components/ui/FilterTabs';

// Mock Data
const mockFigures = [
  { id: '1', name: 'Deep Sea Diver', seriesName: 'LEGO® Minifigürler Serisi 1', imageUrl: 'https://via.placeholder.com/300x400.png?text=Diver', views: 18, dailyViews: 0, minRead: 0, comments: 0, category: 'klasik' },
  { id: '2', name: 'Forestman', seriesName: 'LEGO® Minifigürler Serisi 1', imageUrl: 'https://via.placeholder.com/300x400.png?text=Forestman', views: 16, dailyViews: 0, minRead: 0, comments: 0, category: 'klasik' },
  { id: '3', name: 'Spaceman', seriesName: 'LEGO® Minifigürler Serisi 1', imageUrl: 'https://via.placeholder.com/300x400.png?text=Spaceman', views: 6, dailyViews: 0, minRead: 0, comments: 0, category: 'uzay' },
  { id: '4', name: 'Super Wrestler', seriesName: 'LEGO® Minifigürler Serisi 1', imageUrl: 'https://via.placeholder.com/300x400.png?text=Wrestler', views: 5, dailyViews: 0, minRead: 0, comments: 0, category: 'dovus' },
  { id: '5', name: 'Magician', seriesName: 'LEGO® Minifigürler Serisi 1', imageUrl: 'https://via.placeholder.com/300x400.png?text=Magician', views: 5, dailyViews: 0, minRead: 0, comments: 0, category: 'gizem' },
  { id: '6', name: 'Nurse', seriesName: 'LEGO® Minifigürler Serisi 1', imageUrl: 'https://via.placeholder.com/300x400.png?text=Nurse', views: 2, dailyViews: 0, minRead: 0, comments: 0, category: 'meslek' },
  { id: '7', name: 'Ninja', seriesName: 'LEGO® Minifigürler Serisi 1', imageUrl: 'https://via.placeholder.com/300x400.png?text=Ninja', views: 4, dailyViews: 0, minRead: 0, comments: 0, category: 'klasik' },
  { id: '8', name: 'Cowboy', seriesName: 'LEGO® Minifigürler Serisi 1', imageUrl: 'https://via.placeholder.com/300x400.png?text=Cowboy', views: 2, dailyViews: 0, minRead: 0, comments: 0, category: 'klasik' },
];

const figureTabs = [
  { id: 'all', label: 'All' },
  { id: 'klasik', label: 'Klasik Figürler' },
  { id: 'uzay', label: 'Uzay Teması' },
  { id: 'meslek', label: 'Meslekler' },
];

export default async function FiguresPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const category = (resolvedParams?.cat as string) || 'all';
  
  const filteredFigures = category === 'all' 
    ? mockFigures 
    : mockFigures.filter(f => f.category === category);

  return (
    <div className="bg-[#fcfcfc] min-h-screen pt-4 pb-20">
      <FilterTabs tabs={figureTabs} activeTab={category} basePath="/figurler" />
      
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {filteredFigures.map(fig => (
            <FigureCard key={fig.id} {...fig} />
          ))}
        </div>
        
        {filteredFigures.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-medium">
            <h2 className="text-2xl font-bold text-black mb-2">Aradığınız Şey Bulunamadı...</h2>
            <p>Bu kategoride henüz bir figür bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
