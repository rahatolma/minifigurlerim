import SeriesCard from '@/components/ui/SeriesCard';
import FigureCard from '@/components/ui/FigureCard';
import HeroSliderClient from '@/components/ui/HeroSliderClient';
import ItemCarousel from '@/components/ui/ItemCarousel';
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider';
import NewsCard from '@/components/ui/NewsCard';
import { supabase } from '@/utils/supabase/client';
import { Link } from '@/i18n/routing';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import { LayoutGrid, Package, TrendingUp } from 'lucide-react';
import { getHomepageData } from '@/services/homepageAggregation';
import { getTranslations } from 'next-intl/server';
import { mapSeriesToCardViewModel } from '@/services/mappers';



export const dynamic = 'force-dynamic';
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Homepage' });

  const {
    activeSliders, latestSeries, latestFigures: mappedLatestFigures,
    topDemanded: mappedTopDemanded, topValued: finalTopValued,
    news: latestNews, seriesFigStats, degradedBlocks
  } = await getHomepageData(locale);

  const tTax = await getTranslations({ locale, namespace: 'Taxonomy' });
  const tCard = await getTranslations({ locale, namespace: 'SeriesCard' });
  const tCommon = await getTranslations({ locale, namespace: 'CommonTypes' });

  const mappedLatestSeries = latestSeries.map(series => mapSeriesToCardViewModel(series, locale, tTax, tCard, tCommon, seriesFigStats));

  return (
    <div className="w-full flex-col overflow-hidden">
      {/* 1. Hero / Kapak Alanı (Slider) - ÜST */}
      <div className="snap-start snap-always hidden md:block">
        <HeroSliderClient sliders={activeSliders?.filter(s => s.location !== 'bottom') || []} />
      </div>

      {/* 2. 3'lü Sistem Anlatan Değer Önerisi (Features) Alanı */}
      <section className="hidden md:block snap-center snap-always relative z-20 max-w-7xl mx-auto px-4 md:px-8 mt-6 md:-mt-10 mb-12">
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 py-6 flex flex-col md:flex-row items-stretch justify-between divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Alan 1 (Tüm CMF Serileri) */}
            <Link href="/seriler" className="group flex items-start justify-start gap-5 px-6 lg:px-10 lg:w-1/3 w-full py-4 md:py-2 cursor-pointer">
                <div className="text-gray-400 bg-gray-50 shrink-0 transform group-hover:scale-110 transition-all group-hover:bg-red-50 group-hover:text-[#D22B2B] p-4 rounded-full">
                    <LayoutGrid className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-left w-full">
                    <h3 className="text-gray-900 text-[17px] font-black leading-snug">{t('DiscoverAllSeries')}</h3>
                    <p className="text-gray-500 font-medium text-[13px] mt-1 leading-snug">{t('DiscoverAllSeriesDesc')}</p>
                </div>
            </Link>
            
            {/* Alan 2 (Figür Detayları) */}
            <Link href="/figurler" className="group flex items-start justify-start gap-5 px-6 lg:px-10 lg:w-1/3 w-full py-4 md:py-2 cursor-pointer">
                <div className="text-gray-400 bg-gray-50 shrink-0 transform group-hover:scale-110 transition-all group-hover:bg-red-50 group-hover:text-[#D22B2B] p-4 rounded-full">
                    <Package className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-left w-full">
                    <h3 className="text-gray-900 text-[17px] font-black leading-snug">{t('KnowEveryFigure')}</h3>
                    <p className="text-gray-500 font-medium text-[13px] mt-1 leading-snug">{t('KnowEveryFigureDesc')}</p>
                </div>
            </Link>
            
            {/* Alan 3 (Koleksiyon Rehberi) */}
            <Link href="/lego-hakkinda" className="group flex items-start justify-start gap-5 px-6 lg:px-10 lg:w-1/3 w-full py-4 md:py-2 cursor-pointer">
                <div className="text-gray-400 bg-gray-50 shrink-0 transform group-hover:scale-110 transition-all group-hover:bg-red-50 group-hover:text-[#D22B2B] p-4 rounded-full">
                    <TrendingUp className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-left w-full">
                    <h3 className="text-gray-900 text-[17px] font-black leading-snug">{t('GrowWisely')}</h3>
                    <p className="text-gray-500 font-medium text-[13px] mt-1 leading-snug">{t('GrowWiselyDesc')}</p>
                </div>
            </Link>
        </div>
      </section>

      {/* 3. Yeni Seriler Section */}
      <section className="bg-transparent py-[40px] md:py-[64px] border-t border-gray-100">
          <ItemCarousel
            titleBlock={
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-8 h-8 md:w-14 md:h-14 bg-[#D22B2B] rounded-full flex items-center justify-center text-white shadow-md border-2 md:border-4 border-red-100 shrink-0">
                    <LegoHeadIcon mode="search" className="w-[16px] h-[16px] md:w-[28px] md:h-[28px]" color="text-white" />
                </div>
                <h2 className="text-[17px] sm:text-2xl md:text-4xl font-black text-gray-900 leading-tight">{t('LatestSeries')}</h2>
              </div>
            }
            actionButton={
              <Link href="/seriler" className="bg-[#D22B2B] text-white font-bold py-2 px-4 md:py-3 md:px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-[9px] md:text-[11px] block text-center whitespace-nowrap">{t('AllSeries')}</Link>
            }
          >
            {mappedLatestSeries.map(seriesViewModel => (
              <SeriesCard 
                key={seriesViewModel.id}
                {...seriesViewModel}
              />
            ))}
            {latestSeries.length === 0 && (
              <p className="text-gray-400 font-bold px-8 mt-8 w-full text-center">{t('NoSeries')}</p>
            )}
          </ItemCarousel>
      </section>

      {/* 4. Yeni Figürler Section */}
      <section className="py-[40px] md:py-[64px] bg-transparent border-t border-gray-200">
          <ItemCarousel
            titleBlock={
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-8 h-8 md:w-14 md:h-14 bg-white border-2 border-[#D22B2B] text-[#D22B2B] rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <LegoHeadIcon mode="happy" className="w-[16px] h-[16px] md:w-[32px] md:h-[32px]" color="text-[#D22B2B]" />
                </div>
                <h2 className="text-[17px] sm:text-2xl md:text-4xl font-black text-gray-900 leading-tight">{t('LatestFigures')}</h2>
              </div>
            }
            actionButton={
              <Link href="/figurler" className="bg-[#D22B2B] text-white font-bold py-2 px-4 md:py-3 md:px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-[9px] md:text-[11px] block text-center whitespace-nowrap">{t('AllFigures')}</Link>
            }
          >
            {mappedLatestFigures.map(fig => (
              <FigureCard  
                key={fig.id}
                {...fig}
              />
            ))}
            {mappedLatestFigures.length === 0 && (
              <p className="text-gray-400 font-bold px-8 mt-8 w-full text-center">{t('NoFigures')}</p>
            )}
          </ItemCarousel>
      </section>
      {/* 5. VALUE & DEMAND: En Çok Talep Görenler */}
      <section className="py-[40px] md:py-[64px] bg-transparent border-t border-gray-200">
          <ItemCarousel
             titleBlock={
               <div className="flex items-center gap-2 md:gap-4">
                 <div className="w-8 h-8 md:w-14 md:h-14 bg-white border-2 border-[#D22B2B] text-[#D22B2B] rounded-full flex items-center justify-center shadow-sm shrink-0">
                     <TrendingUp className="w-[16px] h-[16px] md:w-[28px] md:h-[28px]" strokeWidth={2.5} />
                 </div>
                 <h2 className="text-[17px] sm:text-2xl md:text-4xl font-black text-gray-900 leading-tight">{t('PopularFigures')}</h2>
               </div>
             }
             actionButton={
               <Link href="/figurler" className="bg-[#D22B2B] text-white font-bold py-2 px-4 md:py-3 md:px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-[9px] md:text-[11px] block text-center whitespace-nowrap">{t('DiscoverAll')}</Link>
             }
          >
             {mappedTopDemanded.map(fig => (
                <FigureCard  
                  key={fig.id}
                  {...fig}
                />
             ))}
             {mappedTopDemanded.length === 0 && (
                <p className="text-gray-400 font-bold px-8 mt-8 w-full text-center">{t('NoDemandData')}</p>
             )}
          </ItemCarousel>
      </section>

      {/* 6. VALUE & DEMAND: En Değerli Figürler */}
      <section className="py-[40px] md:py-[64px] bg-transparent border-t border-gray-200">
          <ItemCarousel
             titleBlock={
               <div className="flex items-center gap-2 md:gap-4">
                 <div className="w-8 h-8 md:w-14 md:h-14 bg-white border-2 border-[#D22B2B] text-[#D22B2B] rounded-full flex items-center justify-center shadow-sm shrink-0">
                     <Package className="w-[16px] h-[16px] md:w-[28px] md:h-[28px]" strokeWidth={2.5} />
                 </div>
                 <h2 className="text-[17px] sm:text-2xl md:text-4xl font-black text-gray-900 leading-tight">{t('ValuableFigures')}</h2>
               </div>
             }
             actionButton={
               <Link href="/figurler" className="bg-[#D22B2B] text-white font-bold py-2 px-4 md:py-3 md:px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-[9px] md:text-[11px] block text-center whitespace-nowrap">{t('DiscoverAll')}</Link>
             }
          >
             {finalTopValued.map(fig => (
                <FigureCard  
                  key={fig.id}
                  {...fig}
                />
             ))}
             {finalTopValued.length === 0 && (
                <p className="text-gray-400 font-bold px-8 mt-8 w-full text-center">{t('NoValueData')}</p>
             )}
          </ItemCarousel>
      </section>

      {/* 7. [AuthCTA Layout'a Taşındı] Erişime Aç / Koleksiyon Yönetimi (Full Width) */}

      {/* 8. Güncel Haberler / Blog Section */}
      <section className="bg-white py-[40px] md:py-[64px] border-t border-gray-100">
          <ItemCarousel
            itemsPerView={2}
            titleBlock={
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-8 h-8 md:w-14 h-14 bg-black rounded-full flex items-center justify-center text-[#D22B2B] shadow-sm shrink-0">
                    <LegoHeadIcon mode="search" className="w-[16px] h-[16px] md:w-[28px] md:h-[28px]" color="text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-[17px] sm:text-2xl md:text-4xl font-black text-gray-900 leading-tight">{t('News')}</h2>
                </div>
              </div>
            }
            actionButton={
              <Link href="/haberler" className="bg-[#D22B2B] text-white font-bold py-2 px-4 md:py-3 md:px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-[9px] md:text-[11px] block text-center whitespace-nowrap">{t('AllNews')}</Link>
            }
          >
            {latestNews.map(newsItem => (
              <NewsCard  
                key={newsItem.id}
                slug={newsItem.slug || newsItem.id}
                title={newsItem.title}
                imageUrl={newsItem.cover_image_url || '/images/placeholder.svg'}
                views={newsItem.total_views || 0}
                dailyViews={newsItem.daily_views || 0}
                minRead={newsItem.min_read || 1}
                comments={0} // Henüz comments view bağlamadık ama DB script hazırlandı. Şimdilik statik 0 atıyoruz prop'a
              />
            ))}
            {latestNews.length === 0 && (
              <p className="text-gray-400 font-bold px-8 mt-8 w-full text-center">{t('NoNews')}</p>
            )}
          </ItemCarousel>
      </section>


      
    </div>
  );
}
