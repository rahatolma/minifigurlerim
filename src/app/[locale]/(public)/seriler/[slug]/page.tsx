import FigureCard from '@/components/ui/FigureCard';
import { supabase } from '@/utils/supabase/client';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import RichTextContent from '@/components/ui/RichTextContent';
import { Package, Grid3X3, CalendarDays } from 'lucide-react';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import ClientViewTracker from '@/components/ui/ClientViewTracker';
import AuthCTA from '@/components/ui/AuthCTA';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { formatBrandText } from '@/utils/textFormatting';
import FloatingSeriesNav from '@/components/ui/FloatingSeriesNav';

// ... (code omitted for brevity to apply changes via multiple replacements, wait, I can just replace specific lines)

export const revalidate = 0; // Her zaman canlı veri

import { Metadata, ResolvingMetadata } from 'next';

// SEO Metadata Olusturucu
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const queryCol = isUUID ? 'id' : 'slug';
  
  const { data: series } = await supabase.from('series').select('title, description, cover_image_url').eq(queryCol, slug).single();

  if (!series) {
    return { title: 'Seri Bulunamadı | Minifigürlerim' };
  }

  const defaultImage = 'https://minifigurlerim.com/og-image.jpg';
  const seriesImage = series.cover_image_url || defaultImage;
  const desc = series.description ? series.description.substring(0, 150) + '...' : `${series.title} serisindeki tüm minifigürler ve fiyat/borsa geçmişleri.`;

  return {
    title: `${series.title} | LEGO Minifigür Serileri`,
    description: desc,
    openGraph: {
      title: `${series.title} | Komple Seri Rehberi`,
      description: desc,
      images: [seriesImage],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${series.title} | LEGO Serileri`,
      description: desc,
      images: [seriesImage],
    }
  };
}

export default async function SeriesDetail({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // UUID kontrolü yapıyoruz. Eski (ID bazlı) linkle mi gelindi yoksa yeni jenerasyon SEO Slug ile mi?
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const queryCol = isUUID ? 'id' : 'slug';

  // Seri verisini çek
  const { data: series, error } = await supabase.from('series').select('*').eq(queryCol, slug).single();

  if (error || !series) {
    return notFound();
  }

  // Bu seriye ait figürleri çek
  const { data: figuresData } = await supabase
    .from('minifigures')
    .select('*')
    .eq('series_id', series.id)
    .order('created_at', { ascending: false });
    
  const figures = figuresData || [];

  const serverClient = await createClient();
  const { data: { user } } = await serverClient.auth.getUser();

  const userStatusMap: Record<string, 'have' | 'want'> = {};
  const userSeriesProgressMap: Record<string, { percent: number, collected: number, total: number }> = {};
  
  if (user) {
      const [{ data: userCollects }, { data: cachedStats }] = await Promise.all([
         serverClient.from('user_collections').select('status, minifigure_id').eq('user_id', user.id).in('minifigure_id', figures.map(f => f.id)),
         serverClient.from('user_series_stats').select('*').eq('user_id', user.id).eq('series_id', series.id)
      ]);

      if (userCollects) {
          userCollects.forEach(c => {
             if (c.minifigure_id && c.status) userStatusMap[c.minifigure_id] = c.status as 'have'|'want';
          });
      }
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
  
  const currentSeriesStats = userSeriesProgressMap[series.id] || {
    percent: 0,
    collected: 0,
    total: series.figure_count || figures.length
  };

  // ÖNCEKİ / SONRAKİ SERİ YÖNLENDİRMESİ İÇİN (Floating Nav)
  const { data: allSeries } = await supabase
    .from('series')
    .select('id, title, slug, release_year')
    .order('release_year', { ascending: true })
    .order('created_at', { ascending: true }); // Aynı yıla sahipse eklendikçe sırala

  let prevSeries = null;
  let nextSeries = null;

  if (allSeries && allSeries.length > 0) {
    const currentIndex = allSeries.findIndex(s => s.id === series.id);
    if (currentIndex > 0) {
      const p = allSeries[currentIndex - 1];
      prevSeries = { slug: p.slug || p.id.toString(), title: p.title };
    }
    if (currentIndex < allSeries.length - 1) {
      const n = allSeries[currentIndex + 1];
      nextSeries = { slug: n.slug || n.id.toString(), title: n.title };
    }
  }

  return (
    <div className="bg-white min-h-screen pb-20 w-full">
      <FloatingSeriesNav prev={prevSeries} next={nextSeries} />

      <ClientViewTracker table="series" id={series.id} />
      {/* ŞABLON BREADCRUMB */}
      <div className="border-b border-gray-200 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-wrap items-center text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ minHeight: '70px' }}>
             <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link> 
             <span className="mx-3 text-gray-200">/</span> 
             <Link href="/seriler" className="hover:text-black transition-colors">Seriler</Link>
             <span className="mx-3 text-gray-200">/</span> 
             <span className="text-gray-900">{formatBrandText(series.title)}</span>
        </div>
      </div>

      {/* Devasa Kapak Görseli (Sticky değil, sayfa akışında kalıp yok olacak) */}
      <section className="relative w-full h-[300px] md:h-[450px] flex items-end justify-center overflow-hidden bg-[#fcfcfc]">
        <div className="absolute inset-0 w-full h-full max-w-7xl mx-auto">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700" 
            style={{ backgroundImage: `url(${series.hero_image_url || 'https://via.placeholder.com/1920x600.png?text=Hero+Görseli+Yok'})` }}
          />
          {/* Kenar Gradientleri (Görsel max sınırda kesilince yumuşatmak için) */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#fcfcfc] to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#fcfcfc] to-transparent z-10" />
        </div>
        {/* Alt Gradient (Sayfayla çok yumuşak bütünleşme - yüksekliği arttırıldı) */}
        <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-[#fcfcfc] via-[#fcfcfc]/80 to-transparent pointer-events-none z-10" />
      </section>

      {/* STICKY HEADER GURUBU (Başlık + Info Bar) */}
      <div className="sticky top-[130px] md:top-[150px] z-40 w-full flex flex-col items-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] bg-[#fcfcfc]/90 backdrop-blur-2xl">
         
         {/* Başlık (Hero Text) */}
         <h1 className="relative z-10 text-3xl md:text-[45px] text-[#111] font-black pt-8 md:pt-10 pb-6 text-center max-w-7xl px-4 leading-tight w-full tracking-tight">
           {formatBrandText(series.title)}
         </h1>

         {/* Info Bar (Marka / Kategori / Adet / Tarih) */}
         <div className="max-w-7xl w-full mx-auto px-4 md:px-8 relative z-20 pb-4">
           <div className="bg-[#fcfcfc] rounded-xl shadow-xl grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border border-gray-100 overflow-hidden backdrop-blur-xl bg-white/90">
          <div className="p-4 md:p-6 lg:pl-10 flex items-center justify-start gap-4 hover:bg-white transition-colors">
            <div className="bg-[#D22B2B] text-white px-2 py-1.5 rounded-md text-[10px] font-black shrink-0 tracking-wider">LEGO®</div>
            <div>
              <p className="text-[10px] md:text-[11px] font-black opacity-50 uppercase tracking-[0.2em] text-[#D22B2B]">Marka</p>
              <p className="font-black text-sm md:text-base text-gray-900 mt-0.5">LEGO</p>
            </div>
          </div>
          <div className="p-4 md:p-6 lg:pl-10 flex items-center justify-start gap-4 hover:bg-white transition-colors">
            <div className="text-gray-300 shrink-0">
              <Package size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] md:text-[11px] font-black opacity-50 uppercase tracking-[0.2em] text-[#D22B2B]">Kategori</p>
              <p className="font-black text-sm md:text-[15px] text-gray-900 leading-tight pr-2 mt-0.5">{series.category || '-'}</p>
            </div>
          </div>
          <div className="p-4 md:p-6 lg:pl-10 flex items-center justify-start gap-4 hover:bg-white transition-colors">
             <div className="text-gray-300 shrink-0">
               <Grid3X3 size={28} strokeWidth={1.5} />
             </div>
            <div>
              <p className="text-[10px] md:text-[11px] font-black opacity-50 uppercase tracking-[0.2em] text-[#D22B2B]">Ebat</p>
              <p className="font-black text-sm md:text-[15px] text-gray-900 mt-0.5">{series.figure_count ? `${series.figure_count} Figür` : '-'}</p>
            </div>
          </div>
          <div className="p-4 md:p-6 lg:pl-10 flex items-center justify-start gap-4 hover:bg-white transition-colors">
             <div className="text-gray-300 shrink-0">
               <CalendarDays size={28} strokeWidth={1.5} />
             </div>
            <div>
              <p className="text-[10px] md:text-[11px] font-black opacity-50 uppercase tracking-[0.2em] text-[#D22B2B]">Çıkış</p>
              <p className="font-black text-sm md:text-[15px] text-gray-900 leading-tight pr-2 mt-0.5">{series.release_month} {series.release_year}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Dinamik Bölüm: MODÜLER İÇERİK BLOKLARI */}
      {series.content_blocks && Array.isArray(series.content_blocks) && series.content_blocks.length > 0 && (
        <div className="w-full mt-8 md:mt-12">
           <BlockRenderer 
             blocks={series.content_blocks} 
             collectionStats={currentSeriesStats}
             isLoggedIn={!!user}
           />
        </div>
      )}

      {/* Serideki Figürler Bölümü */}
      <div id="figures-list" className="max-w-7xl mx-auto px-8 mt-8 md:mt-12 pt-8 scroll-mt-24 bg-white relative z-20">
        <h3 className="text-sm font-black mb-2 text-gray-300 tracking-[0.2em] uppercase">SERİYİ KEŞFET</h3>
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 tracking-tighter">
          {formatBrandText(series.title)} Figürleri
        </h2>
        
        {figures && figures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {figures.map((fig: any) => (
                    <FigureCard 
                        key={fig.id} 
                        id={fig.id}
                        slug={fig.slug}
                        name={fig.name}
                        seriesName={series.title}
                        seriesSlug={series.slug}
                        imageUrl={(fig.images && fig.images.length > 0) ? fig.images[0] : 'https://via.placeholder.com/300x400.png?text=Görsel+Yok'}
                        year={fig.release_year}
                        rarity={fig.rarity}
                        price={fig.value_usd}
                        initialStatus={userStatusMap[fig.id] || null}
                        isLoggedIn={!!user}
                    />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center w-full shadow-sm mt-4">
                <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest">Bu seriye henüz bir figür eklenmemiş...</h2>
            </div>
        )}

      </div>

    </div>
  );
}
