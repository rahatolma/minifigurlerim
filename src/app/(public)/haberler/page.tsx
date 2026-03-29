import NewsCard from '@/components/ui/NewsCard';
import NewsFilterClient from '@/components/ui/NewsFilterClient';
import Link from 'next/link';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import { supabase } from '@/utils/supabase/client';

export const revalidate = 0; // Her zaman canlı veriyi çek

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const sortParam = (resolvedParams?.sort as string) || 'newest';
  
  // Sadece yayında olan (published) haberleri çek
  const { data: newsData } = await supabase
    .from('news')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: sortParam === 'oldest' });

  let newsList = newsData || [];

  if (sortParam === 'popular') {
    newsList = [...newsList].sort((a, b) => (b.total_views || 0) - (a.total_views || 0));
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen">
      
      {/* ŞABLON BREADCRUMB */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ height: '70px' }}>
             <div className="flex items-center">
                 <a href="/" className="hover:text-black transition-colors">Ana Sayfa</a> 
                 <span className="mx-3 text-gray-200">/</span> 
                 <span className="text-gray-900">Güncel Haberler</span>
             </div>
        </div>
      </div>

      <div className="sticky bg-[#fcfcfc] py-4 border-b border-gray-100 shadow-sm mb-6 z-40" style={{ top: '142px' }}>
        <div className="max-w-7xl mx-auto px-8">
          <NewsFilterClient 
            totalCount={newsList.length}
          />
        </div>
      </div>
      
      {/* BLOK 3: Şablon Izgara Sistemi (Grid) */}
      <div className="max-w-7xl mx-auto px-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
           {newsList.map(news => (
            <NewsCard 
                key={news.id} 
                slug={news.slug || news.id}
                title={news.title}
                imageUrl={news.cover_image_url || 'https://via.placeholder.com/400x300.png?text=Görsel+Yok'}
                views={news.total_views || 0}
                dailyViews={news.daily_views || 0}
                minRead={news.min_read || 1}
                comments={0} // Henüz DB count'dan okumuyoruz, aşağıda eklenebilir.
            />
          ))}
        </div>
        
        {/* Boş Durum (Empty State) Şablonu */}
        {newsList.length === 0 && (
          <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-center w-full shadow-sm mt-4">
            <LegoHeadIcon mode="search" className="w-24 h-24 mb-6" color="text-gray-200" />
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-2">Henüz Haber Yok</h2>
            <p className="text-sm font-medium text-gray-500 max-w-sm">Şu an için yayınlanmış herhangi bir duyuru veya haber bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
