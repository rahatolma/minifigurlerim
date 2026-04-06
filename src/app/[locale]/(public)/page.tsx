import SeriesCard from '@/components/ui/SeriesCard';
import FigureCard from '@/components/ui/FigureCard';
import HeroSliderClient from '@/components/ui/HeroSliderClient';
import ItemCarousel from '@/components/ui/ItemCarousel';
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider';
import InstagramBlock from '@/components/ui/InstagramBlock';
import NewsCard from '@/components/ui/NewsCard';
import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import { LayoutGrid, Package, TrendingUp } from 'lucide-react';
import AuthCTA from '@/components/ui/AuthCTA';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0; // Dinamik sayfa

export default async function Home() {
  // Aktif Slaytlar
  const { data: activeSliders } = await supabase
    .from('home_sliders')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  // En son eklenen 12 Seri (Carousel için)
  const { data: latestSeriesData } = await supabase
    .from('series')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  // En son eklenen 12 Figür (Carousel için)
  const { data: latestFiguresData } = await supabase
    .from('minifigures')
    .select('*, series(title)')
    .order('created_at', { ascending: false })
    .limit(12);

  // En son yayınlanan 12 Haber (Carousel için)
  const { data: latestNewsData } = await supabase
    .from('news')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(12);

  const latestSeries = latestSeriesData || [];
  const latestFigures = latestFiguresData || [];
  const latestNews = latestNewsData || [];

  // Giriş Yapmış Kullanıcı Hook'u (Gamification) ve Status Data Aktarımı
  const serverSupabase = await createClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  const userStatusMap: Record<string, 'have' | 'want'> = {};
  const userSeriesProgressMap: Record<string, { percent: number, collected: number, total: number }> = {};
  
  if (user) {
      // 1. Kullanıcının kartlarda göstereceğimiz "Bende Var/ İstiyorum" durumları (O(1) look-up)
      const { data: userCollects } = await serverSupabase.from('user_collections').select('status, minifigure_id').eq('user_id', user.id);
      if (userCollects) {
          userCollects.forEach(c => {
             if (c.minifigure_id && c.status) {
                 userStatusMap[c.minifigure_id] = c.status as 'have' | 'want';
             }
          });
      }

      // 2. YENİ MİMARİ: CACHE TABLOSUNDAN PROGRESLERİ ÇEK (Çok Uzun Süren Döngü Yerine Tek Sorgu)
      const { data: cachedStats } = await serverSupabase.from('user_series_stats')
          .select('*')
          .eq('user_id', user.id);
          
      if (cachedStats) {
          cachedStats.forEach(stat => {
              // Kartlara paslamak için progress objesini hazırla
              userSeriesProgressMap[stat.series_id] = {
                  percent: Number(stat.completion_percent),
                  collected: stat.owned_count,
                  total: stat.total_count
              };

          });
      }
  }

  const { data: allFigs } = await serverSupabase.from('minifigures').select('series_id, name').order('created_at', { ascending: false });
  const seriesFigStats: Record<string, { count: number, latestName: string | null }> = {};
  if (allFigs) {
     allFigs.forEach((f: any) => {
         if (!seriesFigStats[f.series_id]) {
             seriesFigStats[f.series_id] = { count: 0, latestName: f.name };
         }
         seriesFigStats[f.series_id].count += 1;
     });
  }

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
                    <h3 className="text-gray-900 text-[17px] font-black leading-snug">Tüm Serileri Keşfet</h3>
                    <p className="text-gray-500 font-medium text-[13px] mt-1 leading-snug">2010’dan günümüze çıkan tüm Collectible Minifigür serilerini kronolojik olarak keşfedin.</p>
                </div>
            </Link>
            
            {/* Alan 2 (Figür Detayları) */}
            <Link href="/figurler" className="group flex items-start justify-start gap-5 px-6 lg:px-10 lg:w-1/3 w-full py-4 md:py-2 cursor-pointer">
                <div className="text-gray-400 bg-gray-50 shrink-0 transform group-hover:scale-110 transition-all group-hover:bg-red-50 group-hover:text-[#D22B2B] p-4 rounded-full">
                    <Package className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-left w-full">
                    <h3 className="text-gray-900 text-[17px] font-black leading-snug">Her Figürü Yakından Tanı</h3>
                    <p className="text-gray-500 font-medium text-[13px] mt-1 leading-snug">Her figürün parçaları, nadirliği ve koleksiyon değerine dair bilgileri inceleyin.</p>
                </div>
            </Link>
            
            {/* Alan 3 (Koleksiyon Rehberi) */}
            <Link href="/lego-hakkinda" className="group flex items-start justify-start gap-5 px-6 lg:px-10 lg:w-1/3 w-full py-4 md:py-2 cursor-pointer">
                <div className="text-gray-400 bg-gray-50 shrink-0 transform group-hover:scale-110 transition-all group-hover:bg-red-50 group-hover:text-[#D22B2B] p-4 rounded-full">
                    <TrendingUp className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-left w-full">
                    <h3 className="text-gray-900 text-[17px] font-black leading-snug">Koleksiyonunu Bilinçli Büyüt</h3>
                    <p className="text-gray-500 font-medium text-[13px] mt-1 leading-snug">Hangi figür değerli? Hangi seriler öne çıkıyor? Koleksiyon dünyasını öğrenin.</p>
                </div>
            </Link>
        </div>
      </section>

      {/* 3. Yeni Seriler Section */}
      <section className="bg-transparent py-[40px] md:py-[64px] border-t border-gray-100">
          <ItemCarousel
            titleBlock={
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-[#D22B2B] rounded-full flex items-center justify-center text-white shadow-md border-2 md:border-4 border-red-100 shrink-0">
                    <LegoHeadIcon mode="search" className="w-[18px] h-[18px] md:w-[28px] md:h-[28px]" color="text-white" />
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">En Yeni CMF Serileri</h2>
              </div>
            }
            actionButton={
              <Link href="/seriler" className="bg-[#D22B2B] text-white font-bold py-2 px-4 md:py-3 md:px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-[9px] md:text-[11px] block text-center whitespace-nowrap">Tüm Seriler</Link>
            }
          >
            {latestSeries.map(series => (
              <SeriesCard  
                key={series.id}
                id={series.slug || series.id}
                title={series.title}
                imageUrl={series.cover_image_url || 'https://via.placeholder.com/400x300.png?text=Görsel+Yok'}
                year={series.release_year || (series.created_at ? new Date(series.created_at).getFullYear() : '2010')}
                category={series.category || 'CMF'}
                totalFigures={series.figure_count || seriesFigStats[series.id]?.count || 0}
                rarity={series.rarity || 'Yaygın'}
                latestFigureName={seriesFigStats[series.id]?.latestName || null}
                seriesProgress={userSeriesProgressMap[series.id] || null}
                isLoggedIn={!!user}
              />
            ))}
            {latestSeries.length === 0 && (
              <p className="text-gray-400 font-bold px-8 mt-8 w-full text-center">Henüz sistemde hiç seri yok.</p>
            )}
          </ItemCarousel>
      </section>

      {/* 4. Yeni Figürler Section */}
      <section className="py-[40px] md:py-[64px] bg-transparent border-t border-gray-200">
          <ItemCarousel
            titleBlock={
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white border-2 border-[#D22B2B] text-[#D22B2B] rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <LegoHeadIcon mode="happy" className="w-[20px] h-[20px] md:w-[32px] md:h-[32px]" color="text-[#D22B2B]" />
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">En Yeni Minifigürler</h2>
              </div>
            }
            actionButton={
              <Link href="/figurler" className="bg-[#D22B2B] text-white font-bold py-2 px-4 md:py-3 md:px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-[9px] md:text-[11px] block text-center whitespace-nowrap">Tüm Figürler</Link>
            }
          >
            {latestFigures.map(fig => (
              <FigureCard  
                key={fig.id}
                id={fig.id}
                slug={fig.slug}
                name={fig.name}
                seriesName={(fig as any).series?.title || 'Bilinmeyen Seri'}
                imageUrl={(fig.images && fig.images.length > 0) ? fig.images[0] : 'https://via.placeholder.com/300x400.png?text=Görsel+Yok'}
                year={fig.release_year}
                rarity={fig.rarity}
                price={fig.value_usd}
                initialStatus={userStatusMap[fig.id] || null}
                isLoggedIn={!!user}
              />
            ))}
            {latestFigures.length === 0 && (
              <p className="text-gray-400 font-bold px-8 mt-8 w-full text-center">Henüz sistemde hiç figür yok.</p>
            )}
          </ItemCarousel>
      </section>

      {/* 5. Erişime Aç / Koleksiyon Yönetimi (Full Width / Site Width) */}
      <div className="hidden md:block snap-center snap-always w-full relative bg-gray-900 mt-0">
         <AuthCTA fullWidth={true} isLoggedIn={!!user} />
      </div>

      {/* 8. Güncel Haberler / Blog Section */}
      <section className="bg-white py-[40px] md:py-[64px] border-t border-gray-100">
          <ItemCarousel
            titleBlock={
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center text-[#D22B2B] shadow-sm shrink-0">
                    <LegoHeadIcon mode="search" className="w-[18px] h-[18px] md:w-[28px] md:h-[28px]" color="text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">Haberler</h2>
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#D22B2B] mt-1">GÜNCEL BLOG</span>
                </div>
              </div>
            }
            actionButton={
              <Link href="/haberler" className="bg-[#D22B2B] text-white font-bold py-2 px-4 md:py-3 md:px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-[9px] md:text-[11px] block text-center whitespace-nowrap">Tüm Haberler</Link>
            }
          >
            {latestNews.map(newsItem => (
              <NewsCard  
                key={newsItem.id}
                slug={newsItem.slug || newsItem.id}
                title={newsItem.title}
                imageUrl={newsItem.cover_image_url || 'https://via.placeholder.com/400x300.png?text=Görsel+Yok'}
                views={newsItem.total_views || 0}
                dailyViews={newsItem.daily_views || 0}
                minRead={newsItem.min_read || 1}
                comments={0} // Henüz comments view bağlamadık ama DB script hazırlandı. Şimdilik statik 0 atıyoruz prop'a
              />
            ))}
            {latestNews.length === 0 && (
              <p className="text-gray-400 font-bold px-8 mt-8 w-full text-center">Henüz yayınlanmış bir haber bulunmuyor.</p>
            )}
          </ItemCarousel>
      </section>

      {/* 9. Instagram Bloğu Section */}
      <section className="hidden md:block snap-end snap-always bg-transparent py-[64px]">
        <div className="max-w-7xl mx-auto px-8">
           <InstagramBlock />
        </div>
      </section>
      
    </div>
  );
}
