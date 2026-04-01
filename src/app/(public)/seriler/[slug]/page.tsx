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

  return (
    <div className="bg-white min-h-screen pb-20 w-full">
      <ClientViewTracker table="series" id={series.id} />
      {/* ŞABLON BREADCRUMB */}
      <div className="border-b border-gray-200 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-wrap items-center text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ minHeight: '70px' }}>
             <Link href="/" className="hover:text-black transition-colors">Ana Sayfa</Link> 
             <span className="mx-3 text-gray-200">/</span> 
             <Link href="/seriler" className="hover:text-black transition-colors">Seriler</Link>
             <span className="mx-3 text-gray-200">/</span> 
             <span className="text-gray-900">{series.title}</span>
        </div>
      </div>

      {/* Devasa Kapak Görseli ve Başlık */}
      <section className="relative w-full h-[400px] md:h-[600px] flex items-end justify-center pb-12 overflow-hidden bg-black">
         {/* Arkaplan Hero Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${series.hero_image_url || 'https://via.placeholder.com/1920x600.png?text=Hero+Görseli+Yok'})` }}
        />
        {/* Sadece yazının okunabilmesi için alt kısma hafif gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <h1 className="relative z-10 text-3xl md:text-[50px] text-white font-black pb-4 text-center max-w-7xl px-4 drop-shadow-xl leading-tight">
          {series.title}
        </h1>
      </section>

      {/* Info Bar (Marka / Kategori / Adet / Tarih) */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20 -mt-6">
        <div className="bg-[#f8f8f8] rounded-md shadow-md grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 border border-gray-200">
          <div className="p-4 md:p-6 lg:pl-10 flex items-center justify-start gap-4">
            <div className="bg-[#D22B2B] text-white p-2 rounded text-xs font-black shrink-0">LEGO®</div>
            <div>
              <p className="text-xs md:text-sm font-bold opacity-80 uppercase tracking-widest text-[#D22B2B]">Marka</p>
              <p className="font-black text-lg text-gray-900">LEGO</p>
            </div>
          </div>
          <div className="p-4 md:p-6 lg:pl-10 flex items-center justify-start gap-4">
            <div className="text-gray-300 shrink-0">
              <Package size={32} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold opacity-80 uppercase tracking-widest text-[#D22B2B]">Kategori</p>
              <p className="font-black text-[15px] text-gray-900 leading-tight pr-2">{series.category || '-'}</p>
            </div>
          </div>
          <div className="p-4 md:p-6 lg:pl-10 flex items-center justify-start gap-4">
             <div className="text-gray-300 shrink-0">
               <Grid3X3 size={32} strokeWidth={1.5} />
             </div>
            <div>
              <p className="text-xs md:text-sm font-bold opacity-80 uppercase tracking-widest text-[#D22B2B]">Ebat</p>
              <p className="font-black text-lg text-gray-900">{series.figure_count ? `${series.figure_count} Figür` : '-'}</p>
            </div>
          </div>
          <div className="p-4 md:p-6 lg:pl-10 flex items-center justify-start gap-4">
             <div className="text-gray-300 shrink-0">
               <CalendarDays size={32} strokeWidth={1.5} />
             </div>
            <div>
              <p className="text-xs md:text-sm font-bold opacity-80 uppercase tracking-widest text-[#D22B2B]">Çıkış</p>
              <p className="font-black text-[15px] text-gray-900 leading-tight pr-2">{series.release_month} {series.release_year}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dinamik Bölüm: MODÜLER İÇERİK BLOKLARI */}
      {series.content_blocks && Array.isArray(series.content_blocks) && series.content_blocks.length > 0 && (
        <div className="w-full mt-24">
           <BlockRenderer blocks={series.content_blocks} />
        </div>
      )}

      {/* Görüntülenme Metrikleri */}
      <div className="max-w-7xl mx-auto px-8 mt-24 border-t border-gray-200 pt-24 grid grid-cols-2 text-center">
        <div className="border-r border-gray-200">
          <div className="text-black text-6xl md:text-[80px] font-black mb-2 opacity-10">0</div>
          <p className="font-bold text-gray-400 tracking-widest uppercase text-sm">Toplam Görüntülenme</p>
        </div>
        <div>
           <div className="text-black text-6xl md:text-[80px] font-black mb-2 opacity-10">0</div>
          <p className="font-bold text-gray-400 tracking-widest uppercase text-sm">Günlük Görüntülenme</p>
        </div>
      </div>

      {/* Serideki Figürler Bölümü */}
      <div className="max-w-7xl mx-auto px-8 mt-32 border-t border-gray-200 pt-24">
        <h3 className="text-sm font-black mb-2 text-gray-300 tracking-[0.2em]">SERİYİ KEŞFET</h3>
        <h2 className="text-black font-black text-4xl mb-12 uppercase">{series.title} Figürleri</h2>
        
        {figures.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center w-full shadow-sm mt-4">
                <LegoHeadIcon mode="search" className="w-24 h-24 mb-6" color="text-gray-200" />
                <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest">Bu seriye henüz bir figür eklenmemiş...</h2>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
                {figures.map((fig: any) => (
                    <FigureCard 
                        key={fig.id} 
                        id={fig.id}
                        slug={fig.slug}
                        name={fig.name}
                        seriesName={series.title}
                        imageUrl={(fig.images && fig.images.length > 0) ? fig.images[0] : 'https://via.placeholder.com/300x400.png?text=Görsel+Yok'}
                        year={fig.release_year}
                        rarity={fig.rarity}
                        price={fig.value_usd}
                        initialStatus={userStatusMap[fig.id] || null}
                        isLoggedIn={!!user}
                    />
                ))}
            </div>
        )}

        {/* PORTFÖY / ERIŞİM AÇ CTA BLOĞU */}
        <div className="mt-16 mb-4 max-w-4xl mx-auto">
           <AuthCTA isLoggedIn={!!user} />
        </div>
      </div>

    </div>
  );
}
