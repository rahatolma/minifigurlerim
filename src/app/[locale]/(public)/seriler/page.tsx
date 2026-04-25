import SeriesCard from '@/components/ui/SeriesCard';
import SeriesFilterClient from '@/components/ui/SeriesFilterClient';
import { Link } from '@/i18n/routing';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import { getDefinitions, getCategoriesByType, getAllSeries, getPreviewFiguresForSeries, getSeriesListItems } from '@/services/dal';
import ScrollDownHint from '@/components/ui/ScrollDownHint';
import AuthCTA from '@/components/ui/AuthCTA';
import DragScrollContainer from '@/components/ui/DragScrollContainer';
import { getTranslations, getLocale } from 'next-intl/server';

import SeriesTimelineClient from '@/components/ui/SeriesTimelineClient';

export const revalidate = 300; // 5 minute ISR cache (Architecture Document Standard)

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const locale = await getLocale();
  const t = await getTranslations('SeriesPage');
  
  const resolvedParams = await searchParams;
  const categoryParam = (resolvedParams?.category as string) || 'all';
  const sortParam = (resolvedParams?.sort as string) || 'newest';
  const seriesParam = (resolvedParams?.series as string) || 'all';
  
  // Öncelikle Seri Kategorileri grubunu bul
  const groups = await getDefinitions();
  const seriesGroup = groups?.find((g: any) => g.name.toLowerCase().includes('seri') && g.name.toLowerCase().includes('kategori'));
  const targetType = seriesGroup ? seriesGroup.slug : 'seri-kategorileri';

  // 1. Kategorileri Çek
  const catData = await getCategoriesByType(targetType);
  const categoryFilters = (catData || []).map((c: { slug: string, name: string, name_en?: string }) => ({ slug: c.slug, name: locale === 'en' && c.name_en ? c.name_en : c.name }));

  // 2. Tüm Serileri Çek (Sadece Dropdown Filter menüsü doldurmak için - Minimal payload)
  const allSeries = await getAllSeries();
  const seriesListFilters = (allSeries || []).map(s => ({ slug: locale === 'en' && s.slug_en ? s.slug_en : (s.slug_tr || s.id.toString()), title: locale === 'en' && s.title_en ? s.title_en : s.title }));

  // 3. Filtrelenmiş Serileri Doğrudan Veritabanından (DB) Çek
  // Kural: UI tarafında asla dataset.filter() gibi diziyi manipüle etme! Tüm filter/sort DAL'a havale edildi.
  const resolvedCategoryName = categoryParam === 'all' 
    ? 'all' 
    : (catData?.find((c: any) => c.slug === categoryParam)?.name || categoryParam);

  const filtersToApply = {
    category: resolvedCategoryName,
    series: seriesParam
  };
  
  let filteredSeries = await getSeriesListItems(filtersToApply, sortParam) || [];

  // YENİ: Gamification artık Client Component Hook'larına (Dynamic Island) taşındı.
  // Bu kod blogu tamamen Statik ve Tam Caching (SSG/ISR) yapısına uygun bırakıldı.

  const allFigs = await getPreviewFiguresForSeries();
  const seriesFigStats: Record<string, { count: number, latestName: string | null, samples: string[] }> = {};
  if (allFigs) {
     allFigs.forEach((f: any) => {
         if (!seriesFigStats[f.series_id]) {
             seriesFigStats[f.series_id] = { count: 0, latestName: f.name, samples: [] };
         }
         seriesFigStats[f.series_id].count += 1;
         if (f.images && f.images.length > 0 && seriesFigStats[f.series_id].samples.length < 3) {
             seriesFigStats[f.series_id].samples.push(f.images[0]);
         }
     });
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen">
      


      {/* YATAY EFSANELER ZAMAN ÇİZELGESİ (CMF HISTORY) - SADECE MASAÜSTÜ */}
      <SeriesTimelineClient 
          titleFirst={t('TitleFirst')}
          titleSecond={t('TitleSecond')}
          subtitle={t('Subtitle')}
      />

      <div id="filter-section" className="scroll-mt-[75px]"></div>

      <div className="md:sticky md:bg-[#fcfcfc] md:py-4 md:border-b md:border-gray-100 md:shadow-sm md:mb-6 z-40 md:z-30 top-0 md:top-[75px]">
        <div className="max-w-7xl mx-auto px-0 md:px-8">
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
      <div className={`max-w-7xl mx-auto px-8 pt-6 md:pt-0 ${filteredSeries.length > 21 ? 'pb-0' : 'pb-12'}`}>
        <div className="flex flex-row snap-x snap-mandatory overflow-x-auto pb-4 -mx-8 px-8 gap-4 md:grid md:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 md:gap-5 md:overflow-visible md:snap-none md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
           {filteredSeries.slice(0, 21).map(series => (
            <div key={series.id} className="snap-center snap-always shrink-0 w-[90vw] md:w-auto flex flex-col justify-stretch">
              <SeriesCard 
                  id={(locale === 'en' && series.en_status !== 'missing' && series.slug_en) ? series.slug_en : (series.slug || series.id)}
                  seriesId={series.id}
                  title={(locale === 'en' && series.en_status !== 'missing' && series.title_en) ? series.title_en : series.title}
                  imageUrl={series.cover_image_url || ''}
                  year={series.release_year || (series.created_at ? new Date(series.created_at).getFullYear() : '2010')}
                  seriesNo={series.series_no}
                  category={series.category || 'CMF'}
                  totalFigures={series.figure_count || seriesFigStats[series.id]?.count || 0}
                  rarity={series.rarity || 'Yaygın'}
                  latestFigureName={seriesFigStats[series.id]?.latestName || null}
              />
            </div>
          ))}
        </div>
        
        {/* Boş Durum (Empty State) Şablonu */}
        {filteredSeries.length === 0 && (
          <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-center w-full shadow-sm mt-4">
            <LegoHeadIcon mode="search" className="w-24 h-24 mb-6" color="text-gray-200" />
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-2">{t('EmptyStateTitle')}</h2>
            <p className="text-sm font-medium text-gray-500 max-w-sm">{t('EmptyStateDesc')}</p>
          </div>
        )}
      </div>

      {/* 21. Ürün Sonrası Geri Kalan Listeleme */}
      {filteredSeries.length > 21 && (
          <div className="max-w-7xl mx-auto px-8 pb-12">
            <div className="mt-4 mb-8 md:mt-8 md:mb-6">
               <AuthCTA />
            </div>
            <div className="flex flex-row snap-x snap-mandatory overflow-x-auto pb-8 -mx-8 px-8 gap-4 md:grid md:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 md:gap-5 md:overflow-visible md:snap-none md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
               {filteredSeries.slice(21).map(series => (
                <div key={series.id} className="snap-center snap-always shrink-0 w-[85%] md:w-auto flex flex-col justify-stretch">
                  <SeriesCard 
                      id={(locale === 'en' && series.en_status !== 'missing' && series.slug_en) ? series.slug_en : (series.slug || series.id)}
                      seriesId={series.id}
                      title={(locale === 'en' && series.en_status !== 'missing' && series.title_en) ? series.title_en : series.title}
                      imageUrl={series.cover_image_url || ''}
                      year={series.release_year || (series.created_at ? new Date(series.created_at).getFullYear() : '2010')}
                      seriesNo={series.series_no}
                      category={series.category || 'CMF'}
                      totalFigures={series.figure_count || seriesFigStats[series.id]?.count || 0}
                      rarity={series.rarity || 'Yaygın'}
                      latestFigureName={seriesFigStats[series.id]?.latestName || null}
                  />
                </div>
              ))}
            </div>
          </div>
      )}

    </div>
  );
}
