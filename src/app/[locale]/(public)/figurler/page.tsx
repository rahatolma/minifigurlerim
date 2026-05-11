import { getTotalMinifiguresCount } from '@/services/dal';
import { getMinifigureListItems, getMinifigureFilterOptions, getAllSeries } from '@/services/dal_public';
import FigureCard from '@/components/ui/FigureCard';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import { permanentRedirect } from 'next/navigation';
import { getCanonicalQueryString } from '@/utils/filterHelpers';
import { toSeriesOption, toRoleOption, toRarityOption, toTypeOption } from '@/services/displayMappers';
import FiguresFilterClient from '@/components/ui/FiguresFilterClient';
import DragScrollContainer from '@/components/ui/DragScrollContainer';
import { mapFigureForCard } from '@/utils/figureMapper';
import FiguresListContainer from '@/components/ui/FiguresListContainer';


import EvolutionTimelineClient from '@/components/ui/EvolutionTimelineClient';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Suspense } from 'react';

import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const resolvedLocaleParams = await params;
  const locale = resolvedLocaleParams?.locale || 'tr';
  
  const hasFilters = !!(resolvedParams?.sort || resolvedParams?.series || resolvedParams?.role || resolvedParams?.type || resolvedParams?.rarity || resolvedParams?.page);
  
  const t = await getTranslations({ locale, namespace: 'FiguresPage' });

  return buildMetadata({
    title: t('MetaTitle') || 'LEGO Minifigürleri - Tüm Figürler Koleksiyonu | Minifigürlerim',
    description: t('MetaDescription') || 'Kapsamlı LEGO minifigür koleksiyonumuzu keşfedin. Nadirlik, tema ve yıla göre filtreleyin.',
    locale,
    alternates: {
      tr: '/figurler',
      en: '/figures'
    },
    noindex: hasFilters
  });
}


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
  const selectedRarity = (resolvedParams?.rarity as string) || 'all';
  const currentPage = parseInt((resolvedParams?.page as string) || '1', 10);
  const itemsPerPage = 36;
  const t = await getTranslations('FiguresPage');

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
     .map(row => mapFigureForCard(row, locale))
     .filter((fig): fig is NonNullable<typeof fig> => fig !== null);

  const tTax = await getTranslations({ locale, namespace: 'Taxonomy' });
  const tFilter = await getTranslations({ locale, namespace: 'FiguresFilter' });

  const mutableSeriesList = [...seriesList];
  if (process.env.NODE_ENV !== 'production' && resolvedParams?._mockFallback === '1') {
      mutableSeriesList.push({
          id: 999999,
          title: 'LEGO Minifigürler Serisi X',
          title_en: null,
          slug: 'mock-1'
      } as any);
  }

  const mappedSeriesList = mutableSeriesList.map(s => toSeriesOption(s, locale as 'tr'|'en'));
  const mappedRoles = [...roles].sort((a,b) => a.localeCompare(b, locale)).map(r => toRoleOption(r, locale as 'tr'|'en', tTax));
  const mappedRarities = rarities.map(r => toRarityOption(r, locale as 'tr'|'en'));
  const mappedTypes = types.map(t => toTypeOption(t, locale as 'tr'|'en'));

  const { generateBreadcrumbSchema, generateCollectionPageSchema, safeJsonLd } = await import('@/lib/jsonLd');
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Minifigürlerim', item: `/${locale}` },
    { name: t('MetaTitle') || 'Tüm Figürler Koleksiyonu' }
  ]);
  const collectionSchema = generateCollectionPageSchema(
    t('MetaTitle') || 'LEGO Minifigürleri - Tüm Figürler Koleksiyonu | Minifigürlerim',
    t('MetaDescription') || 'Kapsamlı LEGO minifigür koleksiyonumuzu keşfedin. Nadirlik, tema ve yıla göre filtreleyin.',
    `/${locale === 'en' ? 'en/figures' : 'tr/figurler'}`
  );

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionSchema) }} />

      {/* MİNİFİGÜR EVRİMİ (HERO TIMELINE) - Client Component */}
      <EvolutionTimelineClient />

      {/* Filtreleme ve Sonuçların Başına Dönmek İçin Sabit Çıpa */}
      <div id="filter-section" className="scroll-mt-[75px]"></div>

      <div className="md:sticky md:bg-[#fcfcfc] md:py-4 md:border-b md:border-gray-100 md:shadow-sm md:mb-6 z-40 md:z-40 top-0 md:top-[75px]">
        {/* YATAY FİLTRE BARI (Client-Side Auto Submit) */}
        <div className="max-w-7xl mx-auto px-0 md:px-8">
            <Suspense fallback={<div className="h-[60px] w-full border-b border-gray-100 bg-[#fcfcfc] flex items-center px-4"><span className="text-sm text-gray-400">Yükleniyor...</span></div>}>
              <FiguresFilterClient 
                seriesList={mappedSeriesList} 
                roles={mappedRoles} 
                types={mappedTypes} 
                rarities={mappedRarities} 
                totalCount={fetchedFigures.count || 0}
                absoluteTotalCount={absoluteTotalCount}
              />
            </Suspense>
        </div>
      </div>

      {/* LİSTELEME KISMI */}
      <div className="max-w-7xl mx-auto px-8 pb-16 pt-6 md:pt-0">
            {allFigures.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-center w-full shadow-sm mt-4">
                    <LegoHeadIcon mode="search" className="w-24 h-24 mb-6" color="text-gray-200" />
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-2">{t('EmptyStateTitle')}</h2>
                    <p className="text-sm font-medium text-gray-500 max-w-sm">{t('EmptyStateDesc')}</p>
                </div>
            ) : (
                <FiguresListContainer 
                   initialFigures={initialClientFigures} 
                   totalCount={fetchedFigures.count || 0} 
                   filters={filtersToApply}
                   locale={locale} 
                />
            )}


      </div>
    </div>
  );
}
