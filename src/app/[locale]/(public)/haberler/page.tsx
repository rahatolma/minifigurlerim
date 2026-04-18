import NewsCard from '@/components/ui/NewsCard';
import NewsFilterClient from '@/components/ui/NewsFilterClient';
import Link from 'next/link';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import { getAllNews } from '@/services/dal';
export const revalidate = 300; // 5 dakikalık ISR cache

import { getTranslations, getLocale } from 'next-intl/server';

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const locale = await getLocale();
  const t = await getTranslations('NewsPage');
  
  const resolvedParams = await searchParams;
  const sortParam = (resolvedParams?.sort as string) || 'newest';
  
  // Sadece yayında olan (published) haberleri çek
  const rawNews = await getAllNews();
  let newsList = rawNews || [];
  
  if (sortParam === 'oldest') {
    newsList = [...newsList].reverse();
  }


  if (sortParam === 'popular') {
    newsList = [...newsList].sort((a, b) => (b.total_views || 0) - (a.total_views || 0));
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen">
      


      <div className="sticky top-0 md:top-[75px] bg-[#fcfcfc] py-4 border-b border-gray-100 shadow-sm mb-6 z-40">
        <div className="max-w-7xl mx-auto px-8">
          <NewsFilterClient 
            totalCount={newsList.length}
          />
        </div>
      </div>
      
      {/* BLOK 3: Şablon Izgara Sistemi (Grid) */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
           {newsList.map((news: import("@/services/dal").PostDTO) => (
            <NewsCard 
                key={news.id} 
                slug={locale === 'en' && news.slug_en ? news.slug_en : (news.slug || news.id)}
                title={locale === 'en' && news.title_en ? news.title_en : news.title}
                imageUrl={news.cover_image_url || '/images/placeholder.svg'}
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
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-2">{t('EmptyTitle')}</h2>
            <p className="text-sm font-medium text-gray-500 max-w-sm">{t('EmptyDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
