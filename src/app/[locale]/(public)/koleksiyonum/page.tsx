import { toRarityOption, toRoleOption, toTypeOption } from '@/services/displayMappers';
import { getAuthUser } from '@/services/action_dal';
import { redirect } from 'next/navigation';
import { getUserProfile, getUserCollectionsWithDetails, getAllSeries, getTotalMinifiguresCount, getUserSeriesStats, getMinifigurePriceHistoryBatch, getMinifigureBySlug } from '@/services/dal';
import { logOut } from '@/app/[locale]/(auth)/login/actions';
import { Link } from '@/i18n/routing';
import FigureCard from '@/components/ui/FigureCard';
import { mapFigureForCard } from '@/utils/figureMapper';
import VaultFilterClient from '@/components/ui/VaultFilterClient';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import { slugify } from '@/utils/helpers';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { getFigureUrl, getFiguresListUrl, getSeriesUrl } from '@/utils/routeBuilder';

export const metadata = {
  title: 'Koleksiyonum - Minifigürlerim',
  description: 'Sahip olduğunuz tüm LEGO Minifigürlerinizi tek bir ekrandan yönetin.',
};

export default async function KoleksiyonumPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{ locale: string }>;
}) {
  const user = await getAuthUser();
  const resolvedParams = await searchParams;
  const locale = (await params).locale as any;
  const t = await getTranslations('Collection');
  const tTax = await getTranslations('Taxonomy');
  
  const currentStatus = (resolvedParams.status as string) || 'have';
  const currentSeries = (resolvedParams.series as string) || 'all';
  const currentRole = (resolvedParams.role as string) || 'all';
  const currentType = (resolvedParams.type as string) || 'all';
  const currentRarity = (resolvedParams.rarity as string) || 'all';
  
  if (!user) {
    redirect('/login');
  }

  // 1. Kullanıcı Profili (Gösterim için)
  const profile = await getUserProfile(user.id);
  const displayName = profile?.username || user.email?.split('@')[0] || t('collector');

  // 2. Kullanıcının Koleksiyonlarını (figür detaylarıyla) çek
  const collectionsData = await getUserCollectionsWithDetails(user.id);
  const rawCollections = collectionsData || [];

  // 3. Dropdown için seriler (Orijinal veritabanından, eksik seri çıkmasın diye, SADECE koleksiyondakileri göster)
  const sRes = await getAllSeries();
  const collectionSeriesIds = Array.from(new Set(rawCollections.map((c: any) => c.minifigures?.series_id).filter(Boolean)));
  const seriesOptions = (sRes || [])
      .filter(s => collectionSeriesIds.includes(s.id))
      .map(s => ({ value: s.id.toString(), label: s.title }));

  // Dinamik Olarak Kasadaki Filtre Seçeneklerini Oluştur (Sadece kullanıcının sahip olduğu/istediği şeylerin kategorileri)
  const rawRoles = Array.from(new Set(rawCollections.map((c: any) => c.minifigures?.role).filter(Boolean))) as string[];
  const rawTypes = Array.from(new Set(rawCollections.map((c: any) => c.minifigures?.type).filter(Boolean))) as string[];
  const rawRarities = Array.from(new Set(rawCollections.map((c: any) => c.minifigures?.rarity_level || c.minifigures?.rarity).filter(Boolean))) as string[];

  const roleOptions = rawRoles.map(r => toRoleOption(r, locale, tTax));
  const typeOptions = rawTypes.map(tStr => toTypeOption(tStr, locale));
  const rarityOptions = rawRarities.map(r => toRarityOption(r, locale));

  // 4. İSTEMCİ FİLTRELEMESİNİ VERİYE UYGULA
  let filteredCollections = rawCollections.filter((c: any) => {
      let match = true;
      const fig = c.minifigures;
      if (!fig) return false;

      if (currentStatus !== 'all' && c.status !== currentStatus) match = false;
      if (currentSeries !== 'all' && fig.series_id !== currentSeries) match = false;
      if (currentRole !== 'all' && fig.role !== currentRole) match = false;
      if (currentType !== 'all' && fig.type !== currentType) match = false;
      if (currentRarity !== 'all' && (fig.rarity_level || fig.rarity) !== currentRarity) match = false;

      return match;
  });

  // KPI KARTLARI (Kullanıcının TÜM hesabını yansıtır, alt filtrelerden etkilenmez)
  const haveItems = rawCollections.filter((c: any) => c.status === 'have');
  const wantItems = rawCollections.filter((c: any) => c.status === 'want');

  // YENİ MİMARİ: Hızlı Toplam (Count) Çekimi
  const totalFiguresInWorldRaw = await getTotalMinifiguresCount();
  const totalFiguresInWorld = totalFiguresInWorldRaw || 1;

  const totalHave = rawCollections.filter((c: any) => c.status === 'have').length;
  const rawGlobalPercent = totalFiguresInWorld > 0 ? ((totalHave / totalFiguresInWorld) * 100) : 0;
  const globalPercentDisplay = rawGlobalPercent > 0 && rawGlobalPercent < 1 ? '<1' : rawGlobalPercent.toFixed(0);

  // ----------------------------------------
  // SERİ İLERLEME (PROGRESS) BARI HESAPLAMALARI (CACHE'DEN OKUMA)
  // ----------------------------------------
  const cachedStats = await getUserSeriesStats(user.id);

  // Geliştirilmiş Progress datası: En üste en dolu olanlar gelir
  const activeSeriesProgress = (cachedStats || [])
      .filter((stat: any) => {
         // Cross-Reference with real, live 'haveItems' to prove possession
         const trueCount = haveItems.filter((c: any) => c.minifigures?.series_id === stat.series_id).length;
         return trueCount > 0;
      })
      .map((stat: any) => {
          const matchingItems = haveItems.filter((c: any) => c.minifigures?.series_id === stat.series_id);
          const trueCount = matchingItems.length;
          const maxCount = Math.max(1, stat.total_count);
          const percent = Number(((trueCount / maxCount) * 100).toFixed(2));
          
          // Gerçek Seri Adını Bul: İlk figürün bağlı olduğu series entity'sini çöz
          const sampleFig = matchingItems[0]?.minifigures;
          let realTitle = t('UnknownSeries');
          
          if (sampleFig?.series) {
             const s = sampleFig.series;
             // Locale bazlı çekim için fallback (Sayfa Server Component, param olarak "locale" gelebilir ama basitçe title fallback'i veriyoruz)
             realTitle = s.title || s.title_en || sampleFig.series_name || stat.series_name || t('UnknownSeries');
          } else {
             realTitle = sampleFig?.series_name || stat.series_name || t('UnknownSeries');
          }

          return {
              seriesId: stat.series_id,
              seriesTitle: realTitle,
              haveCount: trueCount,
              maxCount: maxCount,
              percent: percent
          };
      }).sort((a: { percent: number }, b: { percent: number }) => b.percent - a.percent);

  const completedSeriesCount = activeSeriesProgress.filter((sp: { haveCount: number, maxCount: number }) => sp.haveCount >= sp.maxCount && sp.maxCount > 0).length;

  // Filtrelenmiş "Bende Olanlar"ın Toplam Değeri
  const portfolioValue = haveItems.reduce((acc: number, curr: any) => {
      const val = (curr.minifigures as any)?.value_usd || 0;
      return acc + Number(val);
  }, 0);

  // Eski fiyat geçmişi vs için büyüme hesaplama (şu an simüle ya da veri yoksayılabilir)
  let oldPortfolioValue = portfolioValue;
  if (haveItems.length > 0) {
      const figureIds = haveItems.map((i: any) => (i.minifigures as any)?.id).filter(Boolean);
      const historyData = await getMinifigurePriceHistoryBatch(figureIds);
         
      if (historyData && historyData.length > 0) {
         const oldPricesLookup: Record<string, number> = {};
         historyData.forEach((hd: any) => {
             if (!oldPricesLookup[hd.minifigure_id]) {
                 oldPricesLookup[hd.minifigure_id] = Number(hd.value_usd);
             }
         });
         oldPortfolioValue = haveItems.reduce((acc: number, curr: any) => {
             const figId = (curr.minifigures as any)?.id;
             const val = oldPricesLookup[figId] !== undefined ? oldPricesLookup[figId] : ((curr.minifigures as any)?.value_usd || 0);
             return acc + Number(val);
         }, 0);
      }
  }

  const calculatedGain = portfolioValue - oldPortfolioValue;
  const realGrowthStr = (calculatedGain > 0 ? '+' : '') + '$' + calculatedGain.toFixed(2);
  const percentGrowth = oldPortfolioValue > 0 ? ((calculatedGain / oldPortfolioValue) * 100).toFixed(1) : '0.0';

  const lastAddedFigure = haveItems.length > 0 ? haveItems[0].minifigures : null;

  // SON İNCELENEN FİGÜR (Gerçek Tracking Cookies üzerinden)
  const cookieStore = await cookies();
  const lastViewedId = cookieStore.get('last_viewed_figure_id')?.value;
  let lastWantedFigure = null; // "{t('LastViewedTitle')}" olarak yeniden isimlendireceğiz UI tarafında.
  if (lastViewedId) {
     const dbFigure = await getMinifigureBySlug(lastViewedId);
     if (dbFigure) lastWantedFigure = dbFigure;
  }

  // YENİ STANDART: Güvenli Route Hesaplaması (Dinamik)
  let lastAddedUrl = null;
  if (lastAddedFigure) {
     lastAddedUrl = getFigureUrl({
        seriesSlug: (lastAddedFigure as any)?.series?.slug_tr || (lastAddedFigure as any)?.series_slug || slugify((lastAddedFigure as any)?.series?.title || (lastAddedFigure as any)?.series_name || 'seri-yok'),
        figureSlug: (lastAddedFigure as any).slug || (lastAddedFigure as any).id,
        locale: locale as any
     });
  }

  let lastWantedUrl = null;
  if (lastWantedFigure) {
     lastWantedUrl = getFigureUrl({
        seriesSlug: (lastWantedFigure as any)?.series?.slug_tr || (lastWantedFigure as any)?.series_slug || slugify((lastWantedFigure as any)?.series?.title || (lastWantedFigure as any)?.series_name || 'seri-yok'),
        figureSlug: (lastWantedFigure as any).slug || (lastWantedFigure as any).id,
        locale: locale as any
     });
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-16 lg:pb-24">


        <div className="max-w-7xl mx-auto px-8 pt-8">
            
            {/* Üst Karşılama Alanı */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">
                    {t('Title1')} <span className="text-[#D22B2B]">{t('Title2')}</span>
                  </h1>
                  <div className="mb-2 md:mb-0 max-w-2xl mt-4">
                      <p className="text-gray-900 font-black text-[15px] md:text-[18px] leading-relaxed tracking-tight">
                          {t.rich('Intro', { totalHave: totalHave, activeSeries: activeSeriesProgress.length, red: (chunks) => <span className="text-[#D22B2B]">{chunks}</span> })}
                      </p>
                  </div>
                </div>
                <div className="flex flex-col md:items-end bg-white border border-gray-100 px-6 py-5 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] group transition-all hover:border-[#D22B2B]/20 min-w-[200px]">
                    <div className="flex items-center gap-1">
                        <span className="text-4xl md:text-5xl font-black text-[#D22B2B] tracking-tighter">%{globalPercentDisplay}</span>
                        <svg className="w-6 h-6 text-[#D22B2B] opacity-20 transform -translate-y-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                    </div>
                    <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1.5 group-hover:text-gray-600 transition-colors">
                        {t('CompletedBadge')}
                    </span>
                </div>
            </div>

            {/* Borsa (KPI) 4'lü Kart Alanı */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               {/* Portföy Değeri */}
               <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
                  <div className="absolute -right-12 -bottom-12 opacity-[0.03]">
                      <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  </div>
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 z-10 relative">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="font-bold text-gray-400 text-[11px] uppercase tracking-widest mb-1 z-10 relative">{t('WalletTitle')}</h3>
                  <p className="text-3xl font-black text-gray-900 z-10 relative">${portfolioValue.toFixed(2)}</p>
                  
                  {portfolioValue > 0 ? (
                     <div className="mt-4 flex items-center gap-2 z-10 relative">
                        {calculatedGain > 0 ? (
                            <p className="text-green-600 text-[10px] font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                                {realGrowthStr} (%{percentGrowth})
                            </p>
                        ) : (
                            <p className="text-gray-500 text-[9px] font-bold flex items-center gap-1 uppercase tracking-widest">
                                {t('PendingApi')}
                            </p>
                        )}
                     </div>
                  ) : (
                     <p className="text-gray-400 text-[9px] font-bold mt-4 flex items-center gap-1 uppercase tracking-widest z-10 relative">
                        {t('PendingMarket')}
                     </p>
                  )}
               </div>
               
               {/* Sahip Olduklarım */}
               <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
                  <div className="absolute -right-12 -bottom-12 opacity-[0.03]">
                      <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 14H4V8h16v10z"/></svg>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 z-10 relative">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <h3 className="font-bold text-gray-400 text-[11px] uppercase tracking-widest mb-1 z-10 relative">{t('VaultTitle')}</h3>
                  <p className="text-3xl font-black text-gray-900 z-10 relative">{haveItems.length} <span className="text-lg text-gray-300 font-medium">{t('VaultItems')}</span></p>
               </div>
               
               {/* {t('CompletedSeriesTitle')} */}
               <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
                  <div className="absolute -right-12 -bottom-12 opacity-[0.03]">
                      <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 z-10 relative">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="font-bold text-gray-400 text-[11px] uppercase tracking-widest mb-1 z-10 relative">{t('CompletedSeriesTitle')}</h3>
                  {completedSeriesCount > 0 ? (
                      <p className="text-3xl font-black text-gray-900 z-10 relative">{completedSeriesCount} <span className="text-lg text-gray-300 font-medium">{t('CompletedSeriesItems')}</span></p>
                  ) : (
                      <p className="text-[14px] font-black text-gray-300 z-10 relative tracking-widest uppercase mt-2">{t('CompletedSeriesEmpty')}</p>
                  )}
               </div>

               {/* Aradıklarım */}
               <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
                  <div className="absolute -right-12 -bottom-12 opacity-[0.03]">
                      <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-3-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
                  </div>
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 z-10 relative">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  </div>
                  <h3 className="font-bold text-gray-400 text-[11px] uppercase tracking-widest mb-1 z-10 relative">{t('WishlistTitle')}</h3>
                  <p className="text-3xl font-black text-gray-900 z-10 relative">{wantItems.length} <span className="text-lg text-gray-300 font-medium">{t('VaultItems')}</span></p>
               </div>
            </div>



            {/* YENİ: Seri İlerleme (Progress) Barları */}
            {activeSeriesProgress.length > 0 && (
                <div className="mb-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden">
                   <div className="flex items-center justify-between pointer-events-none mb-8">
                       <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                           <svg className="w-6 h-6 text-[#D22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                           {t('ProgressTitle')}
                       </h2>
                   </div>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       {[...activeSeriesProgress].sort((a, b) => b.percent - a.percent).slice(0, 2).map((sp, idx) => {
                           const remaining = sp.maxCount - sp.haveCount;
                           return (
                               <div key={idx} className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 hover:border-[#D22B2B]/30 hover:shadow-lg hover:shadow-red-500/5 transition-all group relative overflow-hidden">
                                   <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D22B2B] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                   <div className="flex justify-between items-start mb-4">
                                       <Link href={`/${locale}/seriler/${sp.seriesId}` as any} className="text-lg font-black text-gray-900 group-hover:text-[#D22B2B] transition-colors truncate pr-4 block">
                                           {(() => {
                                               const formatSeriesName = (name: string) => {
                                                   const match = name.match(/^(.*?Seris[i|i]\s+)(.*)$/i);
                                                   if (match && match[2].trim() !== '') {
                                                       return { top: match[1].trim(), bottom: match[2].trim() };
                                                   }
                                                   return { top: '', bottom: name };
                                               };
                                               const format = formatSeriesName(sp.seriesTitle);
                                               return format.top ? (
                                                  <div className="flex flex-col">
                                                     <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{format.top}</span>
                                                     <span className="truncate">{format.bottom}</span>
                                                  </div>
                                               ) : sp.seriesTitle;
                                           })()}
                                       </Link>
                                       <span className="text-sm font-black text-[#D22B2B] shrink-0 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                                          {sp.haveCount} / {sp.maxCount}
                                       </span>
                                   </div>
                                   <div className="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden mb-4">
                                       <div className={`h-3.5 rounded-full ${sp.percent === 100 ? 'bg-green-500' : 'bg-[#D22B2B]'}`} style={{ width: `${sp.percent}%` }}></div>
                                   </div>
                                   
                                   <div className="flex justify-between items-center text-[11px] uppercase font-bold tracking-widest mt-2 mb-4">
                                       <span className="text-gray-400">{sp.percent === 100 ? t('ProgressCompleted') : t('ProgressText')}</span>
                                       <span className={sp.percent === 100 ? 'text-green-600' : 'text-gray-900'}>%{sp.percent.toFixed(0)}</span>
                                   </div>

                                   {/* Hedef Mekaniği (Bağımlılık Yaratan Kısım) */}
                                   <div className="mt-4 pt-4 border-t border-gray-200/60">
                                       {remaining > 0 ? (
                                           <p className="text-[13px] font-bold text-gray-500 flex items-center gap-2">
                                              <svg className="w-4 h-4 text-[#D22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                              {t('ProgressRemaining1')}<span className="text-gray-900 font-black">{remaining}{t('ProgressRemaining2')}</span>{t('ProgressRemaining3')}
                                           </p>
                                       ) : (
                                           <p className="text-[13px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                              {t('ProgressCongrats')}
                                           </p>
                                       )}
                                   </div>
                               </div>
                           );
                       })}
                   </div>
                </div>
            )}

            {/* SON AKTİVİTE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Son Eklenen */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex items-center gap-6 group hover:border-gray-200 hover:shadow-md transition-all h-[132px] relative z-20">
                   <div className="relative w-[84px] h-[84px] min-w-[84px] min-h-[84px] bg-gray-50 rounded-2xl border border-gray-100 p-2 shrink-0 overflow-hidden flex items-center justify-center group-hover:bg-red-50 transition-colors">
                      {lastAddedFigure ? (
                         <img src={Array.isArray((lastAddedFigure as any)?.images) && (lastAddedFigure as any)?.images.length > 0 ? (lastAddedFigure as any)?.images[0] : (typeof (lastAddedFigure as any)?.images === 'string' ? (lastAddedFigure as any)?.images : '/images/placeholder.svg')} alt={t('lastAdded')} className="absolute inset-0 m-auto max-w-[68px] max-h-[68px] w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                         <LegoHeadIcon mode="neutral" className="w-8 h-8 text-gray-300" />
                      )}
                   </div>
                   <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#D22B2B] mb-1.5 flex items-center gap-1.5">
                         <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                         <span className="truncate">{t('LastAddedTitle')}</span>
                      </span>
                      {lastAddedFigure && lastAddedUrl ? (
                         <>
                            <Link href={lastAddedUrl as any} className="text-[16px] font-black text-gray-900 group-hover:text-[#D22B2B] transition-colors line-clamp-1 flex-1">
                               {(lastAddedFigure as any).name}
                            </Link>
                            <span className="text-[13px] font-bold text-gray-400 mt-0.5 truncate flex-shrink-0">{(lastAddedFigure as any)?.series?.title || (lastAddedFigure as any).series_name || t('UnknownSeries')}</span>
                            <span className="text-[10px] font-black text-[#5CB85C] uppercase tracking-widest mt-1.5 flex items-center gap-1 opacity-90">
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                               {t('AddedToCollection')}
                            </span>
                         </>
                      ) : (
                         <span className="text-[14px] font-bold text-gray-500">{t('VaultEmpty')}</span>
                      )}
                   </div>
                </div>

                {/* Son İstenen (Yakın Takibe Alınan) */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex items-center gap-6 group hover:border-gray-200 hover:shadow-md transition-all h-[132px] relative z-20">
                   <div className="relative w-[84px] h-[84px] min-w-[84px] min-h-[84px] bg-gray-50 rounded-2xl border border-gray-100 p-2 shrink-0 overflow-hidden flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      {lastWantedFigure ? (
                         <img src={Array.isArray((lastWantedFigure as any)?.images) && (lastWantedFigure as any)?.images.length > 0 ? (lastWantedFigure as any)?.images[0] : (typeof (lastWantedFigure as any)?.images === 'string' ? (lastWantedFigure as any)?.images : '/images/placeholder.svg')} alt={t('LastViewedTitle')} className="absolute inset-0 m-auto max-w-[68px] max-h-[68px] w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                         <svg className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      )}
                   </div>
                   <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#0052cc] mb-1.5 flex items-center gap-1.5">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                         <span className="truncate">{t('LastViewedTitle')}</span>
                      </span>
                      {lastWantedFigure && lastWantedUrl ? (
                         <>
                            <Link href={lastWantedUrl as any} className="text-[16px] font-black text-gray-900 group-hover:text-[#0052cc] transition-colors line-clamp-1 flex-1">
                               {(lastWantedFigure as any).name || (lastWantedFigure as any).figure_name}
                            </Link>
                            <span className="text-[13px] font-bold text-gray-400 mt-0.5 truncate flex-shrink-0">{(lastWantedFigure as any)?.series?.title || (lastWantedFigure as any).series_name || t('UnknownSeries')}</span>
                            
                            <Link href={lastWantedUrl as any} className="text-[10px] font-black text-[#0052cc] uppercase tracking-widest mt-1.5 flex items-center gap-1 opacity-90 hover:underline">
                               {t('ContinueReviewing')}
                            </Link>
                         </>
                      ) : (
                         <>
                            <span className="text-[16px] font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{t('NoReviewYet')}</span>
                            <Link href={`/${locale}/figurler` as any} className="text-[13px] font-bold text-gray-400 mt-0.5 group-hover:text-gray-500 transition-colors flex items-center gap-1">{t('StartExploring')} <span className="transform group-hover:translate-x-1 transition-transform">→</span></Link>
                         </>
                      )}
                   </div>
                </div>
            </div>

        </div>

        {/* --- YENİ DÜZEN FİLTRE VE GRID ALANI --- */}
        <div id="filter-section" className="scroll-mt-[75px]"></div>

        {/* FİLTRE BARI */}
        <div className="md:sticky md:bg-[#fcfcfc] md:py-4 md:border-b md:border-gray-100 md:shadow-sm md:mb-6 top-0 z-40 md:z-40 md:top-[75px]">
          <div className="max-w-7xl mx-auto px-0 md:px-8">
              <VaultFilterClient 
                seriesOptions={seriesOptions} 
                roleOptions={roleOptions} 
                typeOptions={typeOptions} 
                rarityOptions={rarityOptions} 
                totalCount={filteredCollections.length}
              />
          </div>
        </div>

        {/* LİSTELEME KARTLARI (GRID) */}
        <div className="max-w-7xl mx-auto px-8 mt-6 md:mt-8 pt-6 md:pt-0">
            {filteredCollections.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-center w-full shadow-sm mt-4">
                   <LegoHeadIcon mode="search" className="w-24 h-24 mb-6" color="text-gray-200" />
                   <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-2">{t('EmptyStateTitle')}</h2>
                   <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">{t('EmptyStateDesc')}</p>
                   {rawCollections.length === 0 && (
                      <Link href={`/${locale}/figurler` as any} className="mt-6 inline-block bg-[#D22B2B] text-white font-black py-3 px-8 rounded-xl hover:bg-red-700 transition-colors shadow-md text-sm">
                          {t('BrowseFigures')}
                      </Link>
                   )}
               </div>
            ) : (
               <div className="flex flex-row snap-x snap-mandatory overflow-x-auto pb-8 -mx-8 px-8 gap-4 md:grid md:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 md:gap-5 md:overflow-visible md:snap-none md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {filteredCollections.map((item: any, i: number) => {
                      const fig = item.minifigures;
                      console.log("DEBUG_FIG_RARITY:", fig.name, fig.rarity_level, fig.rarity);
                      
                      // DTO Mapping (Mevcut projection'a göre name -> figure_name vb)
                      const rawDTO = {
                          id: fig.id,
                          name: fig.name,
                          slug_tr: fig.slug,
                          image_url: fig.images?.[0], // Fallbacks handled by mapper
                          min_price: fig.min_price,
                          max_price: fig.max_price,
                          avg_price: fig.value_usd,
                          value_score: fig.value_score,
                          demand_score: fig.demand_score,
                          rarity_level: fig.rarity_level, // YENİ EKLENDİ
                          rarity: fig.rarity,
                          series: {
                              series_name: fig.series?.title || fig.series?.title_en || fig.series_name,
                              slug_tr: fig.series?.slug_tr || fig.series?.slug_en || fig.series_slug || fig.series_id
                          }
                      };
                      
                      const mappedFig = mapFigureForCard(rawDTO, locale);
                      if (!mappedFig) return null;

                      return (
                         <div key={i} className="snap-center snap-always shrink-0 w-[90vw] md:w-auto flex flex-col justify-stretch">
                          <FigureCard {...mappedFig} />
                         </div>
                      );
                  })}
               </div>
            )}
        </div>

    </div>
  );
}
