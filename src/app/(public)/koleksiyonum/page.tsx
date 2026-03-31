import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { logOut } from '@/app/(auth)/login/actions';
import Link from 'next/link';
import FigureCard from '@/components/ui/FigureCard';
import VaultFilterClient from '@/components/ui/VaultFilterClient';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';

export const metadata = {
  title: 'Koleksiyonum - Minifigürlerim',
  description: 'Sahip olduğunuz tüm LEGO Minifigürlerinizi tek bir ekrandan yönetin.',
};

export default async function KoleksiyonumPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  
  const currentStatus = (resolvedParams.status as string) || 'all';
  const currentSeries = (resolvedParams.series as string) || 'all';
  const currentRole = (resolvedParams.role as string) || 'all';
  const currentType = (resolvedParams.type as string) || 'all';
  const currentRarity = (resolvedParams.rarity as string) || 'all';
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // 1. Kullanıcı Profili (Gösterim için)
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
  const displayName = profile?.username || user.email?.split('@')[0] || 'Koleksiyoner';

  // 2. Kullanıcının Koleksiyonlarını (figür detaylarıyla) çek
  const { data: collectionsData } = await supabase
    .from('user_collections')
    .select(`
      status,
      created_at,
      minifigures (
        id,
        slug,
        name,
        images,
        series_name,
        series_id,
        value_usd,
        role,
        type,
        rarity
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const rawCollections = collectionsData || [];

  // 3. Dropdown için seriler (Orijinal veritabanından, eksik seri çıkmasın diye)
  const { data: sRes } = await supabase.from('series').select('id, title').order('created_at', { ascending: false });
  const seriesList = sRes || [];

  // Dinamik Olarak Kasadaki Filtre Seçeneklerini Oluştur (Sadece kullanıcının sahip olduğu/istediği şeylerin kategorileri)
  const roles = Array.from(new Set(rawCollections.map(c => (c.minifigures as any)?.role).filter(Boolean))) as string[];
  const types = Array.from(new Set(rawCollections.map(c => (c.minifigures as any)?.type).filter(Boolean))) as string[];
  const rarities = Array.from(new Set(rawCollections.map(c => (c.minifigures as any)?.rarity).filter(Boolean))) as string[];

  // 4. İSTEMCİ FİLTRELEMESİNİ VERİYE UYGULA
  let filteredCollections = rawCollections.filter((c: any) => {
      let match = true;
      const fig = c.minifigures;
      if (!fig) return false;

      if (currentStatus !== 'all' && c.status !== currentStatus) match = false;
      if (currentSeries !== 'all' && fig.series_id !== currentSeries) match = false;
      if (currentRole !== 'all' && fig.role !== currentRole) match = false;
      if (currentType !== 'all' && fig.type !== currentType) match = false;
      if (currentRarity !== 'all' && fig.rarity !== currentRarity) match = false;

      return match;
  });

  // KPI KARTLARI (Sıfır filtrede cüzdanın gerçek tam halini gösterir, filtre yapıldığında o filtrenin KPI haline gelir)
  // "Bende olanlar" (sadece have olanlara göre KPI)
  const haveItems = filteredCollections.filter((c: any) => c.status === 'have');
  // "Radarımdakiler" (sadece want olanlara göre KPI)
  const wantItems = filteredCollections.filter((c: any) => c.status === 'want');

  // YENİ MİMARİ: Hızlı Toplam (Count) Çekimi
  const { count: totalFiguresInWorldRaw } = await supabase.from('minifigures').select('*', { count: 'exact', head: true });
  const totalFiguresInWorld = totalFiguresInWorldRaw || 1;

  const totalHave = rawCollections.filter((c: any) => c.status === 'have').length;
  const globalPercent = totalFiguresInWorld > 0 ? ((totalHave / totalFiguresInWorld) * 100).toFixed(1) : '0';

  // ----------------------------------------
  // SERİ İLERLEME (PROGRESS) BARI HESAPLAMALARI (CACHE'DEN OKUMA)
  // ----------------------------------------
  const { data: cachedStats } = await supabase.from('user_series_stats')
      .select('*')
      .eq('user_id', user.id);

  // Geliştirilmiş Progress datası: En üste en dolu olanlar gelir
  const activeSeriesProgress = (cachedStats || []).map(stat => ({
      seriesId: stat.series_id,
      seriesTitle: stat.series_name || 'Bilinmeyen Seri',
      haveCount: stat.owned_count,
      maxCount: Math.max(1, stat.total_count),
      percent: Number(stat.completion_percent)
  })).sort((a, b) => b.percent - a.percent);

  // Filtrelenmiş "Bende Olanlar"ın Toplam Değeri
  const portfolioValue = haveItems.reduce((acc: number, curr: any) => {
      const val = (curr.minifigures as any)?.value_usd || 0;
      return acc + Number(val);
  }, 0);

  // Eski fiyat geçmişi vs için büyüme hesaplama (şu an simüle ya da veri yoksayılabilir)
  let oldPortfolioValue = portfolioValue;
  if (haveItems.length > 0) {
      const figureIds = haveItems.map((i: any) => (i.minifigures as any)?.id).filter(Boolean);
      const { data: historyData, error: hError } = await supabase
         .from('minifigure_price_history')
         .select('minifigure_id, value_usd')
         .in('minifigure_id', figureIds)
         .order('recorded_at', { ascending: true }); 
         
      if (!hError && historyData && historyData.length > 0) {
         const oldPricesLookup: Record<string, number> = {};
         historyData.forEach(hd => {
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

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-32">
        {/* ŞABLON BREADCRUMB */}
        <div className="border-b border-gray-200 bg-white relative z-20">
           <div className="max-w-7xl mx-auto px-8 flex items-center text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ height: '70px' }}>
               <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link> 
               <span className="mx-3 text-gray-200">/</span> 
               <span className="text-gray-900">Koleksiyonum</span>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 pt-8">
            
            {/* Üst Karşılama Alanı */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">
                    Koleksiyonunun <span className="text-[#D22B2B]">Özeti</span>
                  </h1>
                  <p className="text-gray-500 font-bold max-w-2xl text-[13px] md:text-sm">
                    Hey <span className="text-gray-900">{displayName}</span>, işte efsanevi minifigür kasan. Şu an dünya çapındaki toplam <strong className="text-gray-900">{totalFiguresInWorld}</strong> figürün <strong className="text-[#D22B2B]">{totalHave}</strong> tanesine sahipsin (<span className="text-green-600">%{(globalPercent)} Tamamlama Oranı</span>).
                  </p>
                </div>
                
                <form action={logOut}>
                    <button type="submit" className="bg-white border border-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-xl hover:bg-gray-50 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)] text-xs tracking-wide">
                       Güvenli Çıkış Yap
                    </button>
                </form>
            </div>

            {/* Borsa (KPI) 3'lü Kart Alanı */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               {/* Portföy Değeri */}
               <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
                  <div className="absolute -right-12 -bottom-12 opacity-[0.03]">
                      <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  </div>
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 z-10 relative">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="font-bold text-gray-400 text-[11px] uppercase tracking-widest mb-1 z-10 relative">Cüzdanın Gerçek Değeri (USD)</h3>
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
                                API Veri Senkronizasyonu Bekleniyor
                            </p>
                        )}
                     </div>
                  ) : (
                     <p className="text-gray-400 text-[9px] font-bold mt-4 flex items-center gap-1 uppercase tracking-widest z-10 relative">
                        Piyasa Verileri Bekleniyor
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
                  <h3 className="font-bold text-gray-400 text-[11px] uppercase tracking-widest mb-1 z-10 relative">Kasamda Olan Figürler</h3>
                  <p className="text-3xl font-black text-gray-900 z-10 relative">{haveItems.length} <span className="text-lg text-gray-300 font-medium">Adet</span></p>
               </div>
               
               {/* Aradıklarım */}
               <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
                  <div className="absolute -right-12 -bottom-12 opacity-[0.03]">
                      <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-3-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
                  </div>
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 z-10 relative">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  </div>
                  <h3 className="font-bold text-gray-400 text-[11px] uppercase tracking-widest mb-1 z-10 relative">Radara Aldıklarım (İstek)</h3>
                  <p className="text-3xl font-black text-gray-900 z-10 relative">{wantItems.length} <span className="text-lg text-gray-300 font-medium">Adet</span></p>
               </div>
            </div>

            {/* YENİ: Seri İlerleme (Progress) Barları */}
            {activeSeriesProgress.length > 0 && (
                <div className="mb-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                   <div className="flex items-center justify-between pointer-events-none mb-6">
                       <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                           <svg className="w-5 h-5 text-[#D22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                           Seri İlerleme Durumu
                       </h2>
                       <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{activeSeriesProgress.length} Katıldığın Seri</span>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {activeSeriesProgress.map((sp, idx) => (
                           <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-[#D22B2B]/30 transition-colors group">
                               <div className="flex justify-between items-end mb-2">
                                   <Link href={`/seriler/${sp.seriesId}`} className="text-[13px] font-bold text-gray-900 group-hover:text-[#D22B2B] transition-colors truncate pr-2 block">
                                       {sp.seriesTitle}
                                   </Link>
                                   <span className="text-[11px] font-black text-[#D22B2B] shrink-0">
                                      {sp.haveCount} / {sp.maxCount}
                                   </span>
                               </div>
                               <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                   <div className={`h-2.5 rounded-full ${sp.percent === 100 ? 'bg-green-500' : 'bg-[#D22B2B]'}`} style={{ width: `${sp.percent}%` }}></div>
                               </div>
                               <div className="mt-2 flex justify-between items-center text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                   <span>{sp.percent === 100 ? 'TAMAMLANDI 🏆' : 'İLERLEME'}</span>
                                   <span className={sp.percent === 100 ? 'text-green-600' : ''}>%{sp.percent.toFixed(0)}</span>
                               </div>
                           </div>
                       ))}
                   </div>
                </div>
            )}

        </div>

        {/* --- YENİ DÜZEN FİLTRE VE GRID ALANI --- */}
        <div id="filter-section" className="scroll-mt-[150px]"></div>

        {/* FİLTRE BARI */}
        <div className="sticky bg-[#fcfcfc] py-4 border-b border-gray-100 shadow-sm mb-6" style={{ top: '150px', zIndex: 40 }}>
          <div className="max-w-7xl mx-auto px-8">
              <VaultFilterClient 
                seriesList={seriesList} 
                roles={roles} 
                types={types} 
                rarities={rarities} 
                totalCount={filteredCollections.length}
              />
          </div>
        </div>

        {/* LİSTELEME KARTLARI (GRID) */}
        <div className="max-w-7xl mx-auto px-8 mt-10">
            {filteredCollections.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-center w-full shadow-sm mt-4">
                   <LegoHeadIcon mode="search" className="w-24 h-24 mb-6" color="text-gray-200" />
                   <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-2">Burası Çok Issız</h2>
                   <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">Mevcut filtrelere uyan hiçbir figür bulunamadı ya da henüz kasana figür eklemedin.</p>
                   {rawCollections.length === 0 && (
                      <Link href="/figurler" className="mt-6 inline-block bg-[#D22B2B] text-white font-black py-3 px-8 rounded-xl hover:bg-red-700 transition-colors shadow-md text-sm">
                          Figürlere Göz At
                      </Link>
                   )}
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
                  {filteredCollections.map((item: any, i: number) => {
                      const fig = item.minifigures;
                      const image = fig.images?.[0] || 'https://via.placeholder.com/300x400?text=Lego+Minifig';
                      const link = fig.slug || fig.id;

                      return (
                          <FigureCard 
                              key={i}
                              id={link}
                              name={fig.name}
                              seriesName={fig.series_name}
                              imageUrl={image}
                              views={0}
                              dailyViews={0}
                              minRead={0}
                              comments={0}
                              statusBadge={item.status}
                              price={fig.value_usd}
                          />
                      );
                  })}
               </div>
            )}
        </div>

    </div>
  );
}
