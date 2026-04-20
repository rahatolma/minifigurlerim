import { getMinifigureListItems, getMinifigureFilterOptions, getAllSeries, getTotalMinifiguresCount } from '@/services/dal';
import FigureCard from '@/components/ui/FigureCard';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import Link from 'next/link';
import { permanentRedirect } from 'next/navigation';
import { getCanonicalQueryString } from '@/utils/filterHelpers';
import FiguresFilterClient from '@/components/ui/FiguresFilterClient';
import DragScrollContainer from '@/components/ui/DragScrollContainer';
import { mapFigureForCard } from '@/utils/figureMapper';
import FiguresListContainer from '@/components/ui/FiguresListContainer';


import EvolutionTimelineClient from '@/components/ui/EvolutionTimelineClient';

export const revalidate = 3600; // Her zaman güncel

export default async function FiguresPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const resolvedLocaleParams = await params;
  const locale = resolvedLocaleParams?.locale || 'tr';
  const sortParam = (resolvedParams?.sort as string) || 'newest';
  let selectedSeries = (resolvedParams?.series as string) || 'all';
  let selectedRole = (resolvedParams?.role as string) || 'all';
  let selectedType = (resolvedParams?.type as string) || 'all';
  let selectedRarity = (resolvedParams?.rarity as string) || 'all';
  const currentPage = parseInt((resolvedParams?.page as string) || '1', 10);
  const itemsPerPage = 36;

  // 1. Statik Kapsüler ve Filtre Verilerini Paralel Çek
  const [seriesList, filterOptions, absoluteTotalCount] = await Promise.all([
     getAllSeries(),
     getMinifigureFilterOptions({ series: selectedSeries }),
     getTotalMinifiguresCount()
  ]);
  
  const roles = Array.from(new Set(((filterOptions as any) || []).map((f: any) => f.role).filter(Boolean))) as string[];
  const types = Array.from(new Set(((filterOptions as any) || []).map((f: any) => f.type).filter(Boolean))) as string[];
  const rarities = Array.from(new Set(((filterOptions as any) || []).map((f: any) => f.normalized_rarity).filter(Boolean))) as string[];

  console.log("DB RARITIES ARRAY YAKALANDI ===>", rarities);

  // --- CANONICAL QUERY NORMALIZATION ---
  const { needsRedirect, canonicalQueryString } = getCanonicalQueryString(
      resolvedParams || {},
      { roles, types, rarities }
  );

  const rarityParam = resolvedParams?.rarity || 'NONE';
  console.log(`\n\n🚨 FIGURES_DEBUG locale=${locale} rarity=${rarityParam} rarities=[${rarities.join(',')}] needsRedirect=${needsRedirect} canonical=${canonicalQueryString}\n\n`);

  if (needsRedirect) {
      permanentRedirect(canonicalQueryString ? `/${locale}/figurler?${canonicalQueryString}` : `/${locale}/figurler`);
  }
  // --- END OF NORMALIZATION ---

  // 2. Data'yı DAL üzerinden Filtrelenmiş ve Projeksiyonlanmış Halde Dar Çek
  const filtersToApply = {
    series: selectedSeries,
    role: selectedRole,
    type: selectedType,
    rarity: selectedRarity,
    sort: sortParam
  };
  
  const fetchedFigures = await getMinifigureListItems(filtersToApply);
  let allFigures = fetchedFigures?.data || [];

  // Initial Server Rendered Batch for the Component (filtering out hard failures)
  const initialClientFigures = allFigures
     .map(row => mapFigureForCard(row))
     .filter((fig): fig is NonNullable<typeof fig> => fig !== null);

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-32">
      

      {/* MİNİFİGÜR EVRİMİ (HERO TIMELINE) - Client Component */}
      <EvolutionTimelineClient />

      {/* Filtreleme ve Sonuçların Başına Dönmek İçin Sabit Çıpa */}
      <div id="filter-section" className="scroll-mt-[75px]"></div>

      <div className="md:sticky md:bg-[#fcfcfc] md:py-4 md:border-b md:border-gray-100 md:shadow-sm md:mb-6 z-40 md:z-40 top-0 md:top-[75px]">
        {/* YATAY FİLTRE BARI (Client-Side Auto Submit) */}
        <div className="max-w-7xl mx-auto px-0 md:px-8">
            <FiguresFilterClient 
              seriesList={seriesList} 
              roles={roles} 
              types={types} 
              rarities={rarities} 
              totalCount={fetchedFigures.count || 0}
              absoluteTotalCount={absoluteTotalCount}
            />
        </div>
      </div>

      {/* LİSTELEME KISMI */}
      <div className="max-w-7xl mx-auto px-8 pb-32 pt-6 md:pt-0">
            {allFigures.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-center w-full shadow-sm mt-4">
                    <LegoHeadIcon mode="search" className="w-24 h-24 mb-6" color="text-gray-200" />
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-2">Bulunamadı</h2>
                    <p className="text-sm font-medium text-gray-500 max-w-sm">Mevcut filtrelere uyan bir LEGO figürü bulunmuyor. Diğer seçenekleri deneyebilirsin.</p>
                </div>
            ) : (
                <FiguresListContainer 
                   initialFigures={initialClientFigures} 
                   totalCount={fetchedFigures.count || 0} 
                   filters={filtersToApply} 
                />
            )}


      </div>
    </div>
  );
}
