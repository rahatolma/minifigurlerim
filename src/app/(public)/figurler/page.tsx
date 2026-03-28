import { supabase } from '@/utils/supabase/client';
import FigureCard from '@/components/ui/FigureCard';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import Link from 'next/link';
import FiguresFilterClient from '@/components/ui/FiguresFilterClient';

export const revalidate = 0; // Her zaman güncel

export default async function FiguresPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const sortParam = (resolvedParams?.sort as string) || 'newest';
  const selectedSeries = (resolvedParams?.series as string) || 'all';
  const selectedRole = (resolvedParams?.role as string) || 'all';
  const selectedType = (resolvedParams?.type as string) || 'all';
  const selectedRarity = (resolvedParams?.rarity as string) || 'all';

  // 1. Verileri SSR Üzerinden Çek
  const [fRes, sRes] = await Promise.all([
    supabase.from('minifigures').select('*'),
    supabase.from('series').select('id, title').order('created_at', { ascending: false })
  ]);

  let allFigures = fRes.data || [];
  const seriesList = sRes.data || [];

  // Dinamik Filtre Seçeneklerini Oluştur (null veya boş string eyle)
  const roles = Array.from(new Set(allFigures.map(f => f.role).filter(Boolean))) as string[];
  const types = Array.from(new Set(allFigures.map(f => f.type).filter(Boolean))) as string[];
  const rarities = Array.from(new Set(allFigures.map(f => f.rarity).filter(Boolean))) as string[];

  // Filtreleme (Client taraflı URL parametreleri ile)
  allFigures = allFigures.filter(f => {
    let match = true;
    if (selectedSeries !== 'all' && f.series_id !== selectedSeries) match = false;
    if (selectedRole !== 'all' && f.role !== selectedRole) match = false;
    if (selectedType !== 'all' && f.type !== selectedType) match = false;
    if (selectedRarity !== 'all' && f.rarity !== selectedRarity) match = false;
    return match;
  });

  // Sıralama (Sort)
  if (sortParam === 'newest') {
      allFigures = allFigures.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sortParam === 'oldest') {
      allFigures = allFigures.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (sortParam === 'popular') {
      allFigures = allFigures.sort((a, b) => (b.total_views || 0) - (a.total_views || 0));
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-32">
      
      {/* ŞABLON BREADCRUMB */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ height: '70px' }}>
             <div className="flex items-center">
                 <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link> 
                 <span className="mx-3 text-gray-200">/</span> 
                 <span className="text-gray-900">Figürler</span>
             </div>
        </div>
      </div>

      <div className="sticky bg-[#fcfcfc] py-4 border-b border-gray-100 shadow-sm mb-6" style={{ top: '142px', zIndex: 40 }}>
        {/* YATAY FİLTRE BARI (Client-Side Auto Submit) */}
        <div className="max-w-7xl mx-auto px-8">
            <FiguresFilterClient 
              seriesList={seriesList} 
              roles={roles} 
              types={types} 
              rarities={rarities} 
              totalCount={allFigures.length}
            />
        </div>
      </div>

      {/* LİSTELEME KISMI */}
      <div className="max-w-7xl mx-auto px-8 pb-32">
            {allFigures.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-center w-full shadow-sm mt-4">
                    <LegoHeadIcon mode="search" className="w-24 h-24 mb-6" color="text-gray-200" />
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-2">Bulunamadı</h2>
                    <p className="text-sm font-medium text-gray-500 max-w-sm">Mevcut filtrelere uyan bir LEGO figürü bulunmuyor. Diğer seçenekleri deneyebilirsin.</p>
                </div>
            ) : (
                <>
                    {/* Görsel 1'deki gibi 3'lü kolon (lg:grid-cols-3), 20px gap (gap-5) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
                        {allFigures.map(fig => (
                            <FigureCard 
                                key={fig.id} 
                                id={fig.slug || fig.id}
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
