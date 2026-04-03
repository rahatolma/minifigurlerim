import WelcomeBlock from '@/components/blocks/WelcomeBlock';
import HeroSliderClient from '@/components/ui/HeroSliderClient';
import ItemCarousel from '@/components/ui/ItemCarousel';
import FigureCard from '@/components/ui/FigureCard';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import Link from 'next/link';

// BU DOSYA KULLANILMIYOR.
// Ana sayfadan (page.tsx) kaldırılan ama gelecekte lazım olabilecek section'ların kodlarını saklamak amacıyla oluşturulmuştur.

export default function ArchivedHomeSections() {
  const popularFigures: any[] = [];
  const userStatusMap: any = {};
  const user = null;
  const activeSliders: any[] = [];

  return (
    <>
      {/* ========================================================== */}
      {/* 6. Hakkımızda / Merhaba Alanı */}
      {/* ========================================================== */}
      <WelcomeBlock />


      {/* ========================================================== */}
      {/* 7. Popüler Figürler Section (En Çok Okunanlar/Ziyaret Edilenler) */}
      {/* ========================================================== */}
      <section className="py-[64px] bg-[#f9fafb] border-y border-gray-200">
          <ItemCarousel
            titleBlock={
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#D22B2B] rounded-full flex items-center justify-center shadow-md border-4 border-red-100 text-white">
                    <LegoHeadIcon mode="fire" className="w-[28px] h-[28px]" color="text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-4xl font-black text-gray-900">Popüler Figürler</h2>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#D22B2B] mt-1">EN ÇOK İNCELENENLER</span>
                </div>
              </div>
            }
            actionButton={
              <Link href="/figurler?sort=popular" className="bg-[#D22B2B] text-white font-bold py-3 px-8 rounded-sm shadow-md hover:bg-[#B22222] transition-colors tracking-widest uppercase text-[11px] block text-center">Tüm Figürler</Link>
            }
          >
            {popularFigures.map(fig => (
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
            {popularFigures.length === 0 && (
              <p className="text-gray-400 font-bold px-8 mt-8 w-full text-center">Henüz sistemde hiç figür yok.</p>
            )}
          </ItemCarousel>
      </section>


      {/* ========================================================== */}
      {/* 11. Alt Kapak Alanı (Slider) - BOTTOM */}
      {/* ========================================================== */}
      <HeroSliderClient sliders={activeSliders?.filter(s => s.location === 'bottom') || []} />
    </>
  );
}
