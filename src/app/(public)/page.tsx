import SeriesCard from '@/components/ui/SeriesCard';
import FigureCard from '@/components/ui/FigureCard';
import HeroSliderClient from '@/components/ui/HeroSliderClient';
import ItemCarousel from '@/components/ui/ItemCarousel';
import NewsletterBlock from '@/components/ui/NewsletterBlock';
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider';
import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';

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

  const latestSeries = latestSeriesData || [];
  const latestFigures = latestFiguresData || [];

  return (
    <div className="w-full flex-col">
      {/* Hero / Kapak Alanı (Slider) */}
      <HeroSliderClient sliders={activeSliders || []} />

      {/* 3'lü Değer Önerisi (Features) Alanı */}
      <section className="bg-transparent border-b border-gray-100 py-[64px]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Alan 1 (En SOLA Yaslı - px-0 yapıldı) */}
            <div className="flex items-center gap-6 pr-6 lg:pr-10 lg:w-1/3 w-full justify-start py-3 md:py-0">
                <div className="text-[#D22B2B] shrink-0">
                    <LegoHeadIcon mode="happy" className="w-[56px] h-[56px]" color="text-[#D22B2B]" />
                </div>
                <div className="flex flex-col text-left w-full max-w-[200px]">
                    <h3 className="text-gray-900 text-[18px] md:text-[20px] font-black leading-snug whitespace-nowrap">Her Figür,</h3>
                    <p className="text-gray-600 font-medium whitespace-nowrap text-[13px] md:text-[14px]">Kendi Dünyasını Anlatır!</p>
                </div>
            </div>
            
            {/* Alan 2 (ORTA) */}
            <div className="flex items-center gap-6 px-6 lg:px-10 lg:w-1/3 w-full justify-start md:justify-center py-3 md:py-0">
                <div className="text-[#D22B2B] shrink-0">
                    <LegoHeadIcon mode="search" className="w-[56px] h-[56px]" color="text-[#D22B2B]" />
                </div>
                <div className="flex flex-col text-left w-full max-w-[200px]">
                    <h3 className="text-gray-900 text-[18px] md:text-[20px] font-black leading-snug whitespace-nowrap">Küçük Figürler,</h3>
                    <p className="text-gray-600 font-medium whitespace-nowrap text-[13px] md:text-[14px]">Sonsuz Hikayeler!</p>
                </div>
            </div>
            
            {/* Alan 3 (En SAĞA Yaslı) */}
            <div className="flex items-center gap-6 pl-6 lg:pl-10 lg:w-1/3 w-full justify-start md:justify-end py-3 md:py-0">
                <div className="text-[#D22B2B] shrink-0">
                    <LegoHeadIcon mode="fire" className="w-[56px] h-[56px]" color="text-[#D22B2B]" />
                </div>
                <div className="flex flex-col text-left w-full max-w-[200px]">
                    <h3 className="text-gray-900 text-[18px] md:text-[20px] font-black leading-snug whitespace-nowrap">Mini Kahramanlar,</h3>
                    <p className="text-gray-600 font-medium whitespace-nowrap text-[13px] md:text-[14px]">Büyük Maceralar!</p>
                </div>
            </div>
        </div>
      </section>

      {/* Hakkımızda / Merhaba Alanı */}
      <section className="max-w-7xl mx-auto py-[64px] px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-0">
        <div className="w-full lg:w-1/2 space-y-8 pr-0 lg:pr-12">
          <h2 className="text-[36px] font-black tracking-tight leading-[43px] text-[#111]">Merhaba, Minifigürlerim<br/>Websitesine Hoş Geldiniz!</h2>
          <div className="space-y-6 lg:max-w-xl">
              <p className="text-[#111] font-normal text-[16px] leading-[28px]">2010'dan beri tutkuyla biriktirdiğim LEGO® minifigürleri artık bu platformda sizlerle buluşturuyorum. Kendi koleksiyonumdan özenle çekilmiş fotoğraflar, her figüre dair bilgiler ve minifigür dünyasına dair ilham veren içerikler burada yer alacak.</p>
              <p className="text-[#111] font-normal text-[16px] leading-[28px]">Minifigürlerim, sadece benim koleksiyonumun sergilendiği bir alan değil; aynı zamanda bu hobiye gönül verenlerin buluşma noktası. <strong className="font-bold">Koleksiyonerler, meraklılar ve yeni başlayanlar</strong> için keyifle vakit geçirilecek, bilgi alınacak ve paylaşım yapılacak bir merkez olmasını hedefliyorum.</p>
              <p className="text-[#111] font-normal text-[16px] leading-[28px]">Burada minifigür sevgisini paylaşacak, yepyeni hikâyeler keşfedecek ve bu hobiye dair ilham alacaksınız.</p>
          </div>
          <div className="pt-4">
            <img src="/uploads/media__1774632782593.png" alt="Minifigür Hastası İmza" className="h-14 md:h-16 w-auto mix-blend-multiply opacity-90 -ml-2" />
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-12 lg:mt-0 lg:pl-10">
          <BeforeAfterSlider 
            beforeImage="/images/lego-art-before.png" 
            afterImage="/images/lego-art-after.png" 
          />
        </div>
      </section>

      {/* Yeni Seriler Section */}
      <section className="bg-transparent py-[64px] border-t border-gray-100">
          <ItemCarousel
            titleBlock={
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#D22B2B] rounded-full flex items-center justify-center text-white shadow-md border-4 border-red-100">
                    <LegoHeadIcon mode="search" className="w-[28px] h-[28px]" color="text-white" />
                </div>
                <h2 className="text-4xl font-black text-gray-900">Yeni Seriler</h2>
              </div>
            }
            actionButton={
              <button className="bg-[#D22B2B] text-white font-bold py-3 px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-[11px]">Tüm Seriler</button>
            }
          >
            {latestSeries.map(series => (
              <SeriesCard  
                key={series.id}
                id={series.slug || series.id}
                title={series.title}
                imageUrl={series.cover_image_url || 'https://via.placeholder.com/400x300.png?text=Görsel+Yok'}
                views={series.total_views || 0}
                dailyViews={series.daily_views || 0}
                minRead={Math.max(1, Math.floor((series.description?.length || 0) / 250))}
                comments={0}
              />
            ))}
            {latestSeries.length === 0 && (
              <p className="text-gray-400 font-bold px-8 mt-8 w-full text-center">Henüz sistemde hiç seri yok.</p>
            )}
          </ItemCarousel>
      </section>

      {/* Yeni Figürler Section */}
      <section className="py-[64px] bg-transparent border-t border-gray-200">
          <ItemCarousel
            titleBlock={
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white border-2 border-[#D22B2B] text-[#D22B2B] rounded-full flex items-center justify-center shadow-sm">
                    <LegoHeadIcon mode="happy" className="w-[32px] h-[32px]" color="text-[#D22B2B]" />
                </div>
                <h2 className="text-4xl font-black text-gray-900">Yeni Figürler</h2>
              </div>
            }
            actionButton={
              <button className="bg-[#D22B2B] text-white font-bold py-3 px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-[11px]">Tüm Figürler</button>
            }
          >
            {latestFigures.map(fig => (
              <FigureCard  
                key={fig.id}
                id={fig.slug || fig.id}
                name={fig.name}
                seriesName={(fig as any).series?.title || 'Bilinmeyen Seri'}
                imageUrl={(fig.images && fig.images.length > 0) ? fig.images[0] : 'https://via.placeholder.com/300x400.png?text=Görsel+Yok'}
                views={fig.total_views || 0}
                dailyViews={fig.daily_views || 0}
                minRead={0}
                comments={0}
              />
            ))}
            {latestFigures.length === 0 && (
              <p className="text-gray-400 font-bold px-8 mt-8 w-full text-center">Henüz sistemde hiç figür yok.</p>
            )}
          </ItemCarousel>
      </section>

      {/* Abone Ol / Newsletter Section */}
      <section className="bg-transparent py-[64px] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-8">
           <NewsletterBlock />
        </div>
      </section>
      
    </div>
  );
}
