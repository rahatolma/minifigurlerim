import SeriesCard from '@/components/ui/SeriesCard';
import SeriesFilterClient from '@/components/ui/SeriesFilterClient';
import Link from 'next/link';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import { supabase } from '@/utils/supabase/client';
import { createClient } from '@/utils/supabase/server';
import ScrollDownHint from '@/components/ui/ScrollDownHint';
import AuthCTA from '@/components/ui/AuthCTA';
import DragScrollContainer from '@/components/ui/DragScrollContainer';

const CMF_HISTORY = [
  { year: '2010', date: 'Mayıs 2010', title: 'Seri 1', desc: 'Sarı kafalar ve 16 figürlük kör paketlerle tüm dünyanın peşinden koşacağı efsane doğdu.' },
  { year: '2012', date: 'Temmuz 2012', title: 'Team GB', desc: 'İngiltere Olimpiyat Takımı ile ülkeler ve özel lisans konseptine ilk eşsiz adım atıldı.' },
  { year: '2014', date: 'Mayıs 2014', title: 'The Simpsons', desc: 'Tarihte ilk kez o klasik "sarı silindir kafa" kuralı yıkıldı ve IP bazlı maskeler/kalıplar kullanıldı!' },
  { year: '2016', date: 'Mayıs 2016', title: 'Disney S1', desc: 'Mickey, Ariel, Stitch... Raflara düştüğü saniye tükenen, gelmiş geçmiş en popüler CMF serisi oldu.' },
  { year: '2018', date: 'Nisan 2018', title: 'Seri 18 - Özel Polis', desc: 'Kutuda sadece 1 tane bulunan "Klasik Polis" figürüyle, paket elleyerek arama (feel guide) sanatı çılgınlığa dönüştü.' },
  { year: '2018', date: 'Ağustos 2018', title: 'Harry Potter', desc: 'İlk kez 22 figürlük devasa (ikisi bir arada) seri üretildi. Yenilikçi bükülebilen midi-bacaklar icat edildi.' },
  { year: '2022', date: 'Mayıs 2022', title: 'The Muppets', desc: 'Orijinal formuna sadık kalınarak heykel kalitesinde üretilmiş, olağanüstü detaylı kafa kalıplarıyla bir başyapıt.' },
  { year: '2023', date: 'Eylül 2023', title: 'Marvel Serisi 2', desc: 'Karakter tasarımları ve eşya kalitesindeki sıçramayla Marvel Sinematik Evreni oyuncak standartlarını aştı.' },
  { year: '2024', date: 'Ocak 2024', title: 'Kare Kod Devrimi', desc: 'Poşetler kalktı! Doğa dostu karton kutulara geçildi. Kutunun altındaki Date Matrix kodunu okutarak içeriği bilme hilesi AFOL camiasını şoke etti!', color: 'bg-black' },
  { year: 'Bugün', date: 'Gelecek', title: 'Minifigürlerim Platformu', desc: 'Türkiye merkezli bu premium koleksiyon takip platformuyla AFOL kültürünü yaşatmak için harika bir sayfa açıldı!', color: 'bg-[#D22B2B]' }
];

export const revalidate = 0; // Her zaman canlı veriyi çek (SSR)

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const categoryParam = (resolvedParams?.category as string) || 'all';
  const sortParam = (resolvedParams?.sort as string) || 'newest';
  const seriesParam = (resolvedParams?.series as string) || 'all';
  
  // Öncelikle Seri Kategorileri grubunu bul
  const { data: groups } = await supabase.from('definition_groups').select('*');
  const seriesGroup = groups?.find(g => g.name.toLowerCase().includes('seri') && g.name.toLowerCase().includes('kategori'));
  const targetType = seriesGroup ? seriesGroup.slug : 'seri-kategorileri';

  // 1. Kategorileri Çek
  const { data: catData } = await supabase.from('categories').select('*').eq('type', targetType).order('created_at', { ascending: true });
  const categoryFilters = (catData || []).map(c => ({ slug: c.slug, name: c.name }));

  // 2. Tüm Serileri Çek (Dropdown için)
  const { data: allSeries } = await supabase.from('series').select('*').order('created_at', { ascending: false });
  const seriesListFilters = (allSeries || []).map(s => ({ slug: s.slug || s.id.toString(), title: s.title }));

  // 3. Filtrelenmiş Serileri belirle
  let filteredSeries = allSeries || [];

  if (categoryParam !== 'all') {
    const selectedCat = catData?.find(c => c.slug === categoryParam);
    if (selectedCat) {
      filteredSeries = filteredSeries.filter(s => s.category === selectedCat.name);
    }
  }

  if (seriesParam !== 'all') {
    filteredSeries = filteredSeries.filter(s => (s.slug || s.id.toString()) === seriesParam);
  }

  if (sortParam === 'newest') {
    // Already sorted by created_at desc (Default)
  } else if (sortParam === 'oldest') {
    filteredSeries = filteredSeries.reverse();
  } else if (sortParam === 'popular') {
    filteredSeries = [...filteredSeries].sort((a, b) => (b.total_views || 0) - (a.total_views || 0));
  }

  // YENİ: Kullanıcı Progress (Gamification) Tablosunu Çek
  const serverClient = await createClient();
  const { data: { user } } = await serverClient.auth.getUser();
  const userSeriesProgressMap: Record<string, { percent: number, collected: number, total: number }> = {};

  if (user) {
      const { data: cachedStats } = await serverClient.from('user_series_stats').select('*').eq('user_id', user.id);
      if (cachedStats) {
          cachedStats.forEach(stat => {
              userSeriesProgressMap[stat.series_id] = {
                  percent: Number(stat.completion_percent),
                  collected: stat.owned_count,
                  total: stat.total_count
              };
          });
      }
  }

  const { data: allFigs } = await serverClient.from('minifigures').select('series_id, name, images').order('created_at', { ascending: false });
  const seriesFigStats: Record<string, { count: number, latestName: string | null, samples: string[] }> = {};
  if (allFigs) {
     allFigs.forEach(f => {
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
      
      {/* ŞABLON BREADCRUMB */}
      <div className="border-b border-gray-200 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ minHeight: '70px' }}>
             <div className="flex items-center">
                 <a href="/" className="hover:text-black transition-colors">Ana Sayfa</a> 
                 <span className="mx-3 text-gray-200">/</span> 
                 <span className="text-gray-900">Seriler</span>
             </div>
        </div>
      </div>

      {/* YATAY EFSANELER ZAMAN ÇİZELGESİ (CMF HISTORY) */}
      <div className="w-full bg-[#fcfcfc] pt-8 pb-16 overflow-hidden relative border-b border-gray-100">
         <div className="max-w-7xl mx-auto px-8 mb-8 md:mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
              <span className="text-[#20214a]">CMF</span> Serüveni
            </h2>
            <p className="text-gray-500 font-bold max-w-2xl mx-auto text-sm md:text-base">
              Kör paketli sarı kafalardan, kare kodlu kutulara uzanan devasa bir koleksiyon tarihi. Sağa kaydırarak zaman yolculuğuna başla!
            </p>
         </div>

         {/* Hide Scrollbar via Tailwind classes (working broadly on modern browsers) */}
         <DragScrollContainer className="w-full pb-24 pt-12 snap-x snap-mandatory px-4 md:px-12 pointer-events-auto">
            
            {/* Tam ortadan yatay akan dekoratif kırmızı hat (Container) */}
            <div className="flex items-center w-max relative min-h-[380px] md:min-h-[420px] pb-10 pointer-events-none">
               
               {/* Asıl parlayan şerit */}
               <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gradient-to-r from-[#111333] via-[#20214a] to-[#111333] -translate-y-1/2 rounded-full opacity-30 shadow-[0_0_15px_rgba(32,33,74,0.8)] z-0"></div>
               {/* Kesik çizgili efekt */}
               <div className="absolute top-1/2 left-0 right-0 h-0 border-t-[3px] border-dashed border-[#20214a] -translate-y-[1.5px] opacity-80 z-0"></div>

               {/* Timeline Kutu Üyeleri */}
               {CMF_HISTORY.map((item, index) => {
                  const isTop = index % 2 === 0;

                  return (
                    <div key={index} className="relative w-[320px] shrink-0 snap-center flex flex-col justify-center items-center group px-4 pointer-events-auto">
                        
                        {/* İçerik Kutusu (Üstteyse üstte, alttaysa altta konumlanacak) */}
                        <div className={`absolute w-[280px] transition-all duration-500 ${isTop ? 'bottom-1/2 mb-[50px] group-hover:-translate-y-2' : 'top-1/2 mt-[50px] group-hover:translate-y-2'}`}>
                           
                           {/* Nokta ve çizgi bağlantısı */}
                           <div className={`absolute left-1/2 -translate-x-1/2 w-[2px] h-[30px] bg-[#20214a]/30 ${isTop ? '-bottom-[30px]' : '-top-[30px]'}`}></div>
                           
                           {/* Kart Gövdesi */}
                           <div className="bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_15px_30px_rgba(210,43,43,0.1)] border border-gray-100/50 rounded-2xl relative">
                               {/* Kart Üst Çizgisi */}
                               <div className={`absolute ${isTop ? 'bottom-0' : 'top-0'} left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#20214a]/60 to-transparent`}></div>
                               
                               <div className="text-[11px] font-black tracking-[0.2em] text-[#20214a] uppercase mb-1">{item.date}</div>
                               <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{item.title}</h3>
                               <p className="text-[13px] text-gray-500 font-bold leading-relaxed">{item.desc}</p>
                           </div>
                        </div>

                        {/* Merkezdeki LEGO Kafası İkonu */}
                        <div className="relative z-20 flex flex-col items-center justify-center transform transition-transform duration-500 group-hover:scale-125">
                           <div className="w-16 h-16 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-gray-100 flex items-center justify-center relative overflow-hidden">
                               {/* Arka plan parlama efekti */}
                               <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                               <LegoHeadIcon 
                                   className="w-10 h-10 transition-transform duration-300" 
                                   mode="happy" 
                                   color="text-[#F8C104]" 
                               />
                           </div>
                           
                           {/* Başın Altında Yazan Kritik Yıl */}
                           <div className="absolute -bottom-8 bg-[#20214a] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg opacity-80 group-hover:opacity-100 transition-opacity tracking-widest uppercase border border-[#111333]">
                               {item.year}
                           </div>
                        </div>

                    </div>
                  );
               })}

               {/* Listenin sonunda boşluk bırakmak için ekstra bir div */}
               <div className="w-[10vw] shrink-0 pointer-events-none"></div>

            </div>
         </DragScrollContainer>

         {/* Scroll Down Hint (False Floor Engelleyici) */}
         <ScrollDownHint />
      </div>

      <div id="filter-section" className="scroll-mt-[150px]"></div>

      <div className="sticky bg-[#fcfcfc] py-4 border-b border-gray-100 shadow-sm mb-6 z-30" style={{ top: '150px' }}>
        <div className="max-w-7xl mx-auto px-8">
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
      <div className={`max-w-7xl mx-auto px-8 ${filteredSeries.length > 21 ? 'pb-16' : 'pb-24'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
           {filteredSeries.slice(0, 21).map(series => (
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
        </div>
        
        {/* Boş Durum (Empty State) Şablonu */}
        {filteredSeries.length === 0 && (
          <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-center w-full shadow-sm mt-4">
            <LegoHeadIcon mode="search" className="w-24 h-24 mb-6" color="text-gray-200" />
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-widest mb-2">Bulunamadı</h2>
            <p className="text-sm font-medium text-gray-500 max-w-sm">Mevcut filtrelere uyan bir LEGO serisi bulunmuyor. Diğer seçenekleri deneyebilirsin.</p>
          </div>
        )}
      </div>

      {/* ARA CTA: (Sadece eğer 21'den fazla seri varsa) */}
      {filteredSeries.length > 21 && (
         <div className="w-full relative mb-16">
            <AuthCTA fullWidth={true} isLoggedIn={!!user} />
         </div>
      )}

      {/* 21. Ürün Sonrası Geri Kalan Listeleme */}
      {filteredSeries.length > 21 && (
          <div className="max-w-7xl mx-auto px-8 pb-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
               {filteredSeries.slice(21).map(series => (
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
            </div>
          </div>
      )}

      {/* PORTFÖY / ERIŞİM AÇ CTA BLOĞU - EN ALT (Ana sayfadaki gibi full width) */}
      <div className="w-full relative">
         <AuthCTA fullWidth={true} isLoggedIn={!!user} />
      </div>

    </div>
  );
}
