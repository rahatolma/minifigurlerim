import FigureCard from '@/components/ui/FigureCard';
import { getSeriesBySlug, getFiguresBySeries, getAllSeries } from '@/services/dal';
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

export const revalidate = 300; // 5 dakikalık (300s) ISR Cache window (Kullanıcı talebi)
export const dynamicParams = true; // Yeni eklenen seriler anında çalışır

import { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { permanentRedirect } from 'next/navigation';

// SEO Metadata Olusturucu
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations('SeriesDetail');
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const queryCol = isUUID ? 'id' : 'slug';
  
  const series = await getSeriesBySlug(slug);

  if (!series) {
    return { title: t('NotFoundTitle') };
  }

  const title = locale === 'en' && series.title_en ? series.title_en : series.title;
  const descriptionText = locale === 'en' && series.meta_description_en ? series.meta_description_en : (series.description || '');

  const defaultImage = 'https://minifigurlerim.com/og-image.jpg';
  const seriesImage = series.cover_image_url || defaultImage;
  const desc = descriptionText ? descriptionText.substring(0, 150) + '...' : `${title} ${t('NotFoundDesc')}`;

  return {
    title: `${title}${t('MetaTitleSuffix')}`,
    description: desc,
    alternates: {
      canonical: locale === 'en' && series.slug_en ? `/en/series/${series.slug_en}` : `/tr/seriler/${series.slug}`,
      languages: {
        'tr-TR': `/tr/seriler/${series.slug}`,
        'en-US': series.slug_en ? `/en/series/${series.slug_en}` : `/en/series/${series.slug}`
      }
    },
    openGraph: {
      title: `${title}${t('MetaGraphSuffix')}`,
      description: desc,
      images: [seriesImage],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title}${t('MetaTwitterSuffix')}`,
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
  const locale = await getLocale();
  const t = await getTranslations('SeriesDetail');

  // Series verisini çek
  const series = await getSeriesBySlug(slug);

  if (!series) {
    return notFound();
  }

  // Canonical Mismatch Redirect (Bi-directional)
  if (locale === 'en' && series.slug_en && slug !== series.slug_en && !slug.includes(series.id)) {
    permanentRedirect(`/en/series/${series.slug_en}`);
  } else if (locale === 'tr' && series.slug && slug !== series.slug && !slug.includes(series.id)) {
    permanentRedirect(`/tr/seriler/${series.slug}`);
  }

  const title = locale === 'en' && series.title_en ? series.title_en : series.title;
  const content_blocks = locale === 'en' && series.content_blocks_en ? series.content_blocks_en : series.content_blocks;
  
  const isFallback = locale === 'en' && !series.title_en && !series.content_blocks_en;
  const fallbackT = await getTranslations('Fallback');
  
  // Bu seriye ait figürleri çek
  const figures = await getFiguresBySeries(series.id, true);

  // Gamification Auth fetching has been completely stripped out here.
  // The system relies exclusively on dynamic Island Context elements.

  // ÖNCEKİ / SONRAKİ SERİ YÖNLENDİRMESİ İÇİN (Floating Nav)
  // getAllSeries() results are ordered by created_at desc. Sort them locally by release_year if we want chronological order.
  const rawAllSeries = await getAllSeries();
  const allSeries = (rawAllSeries || []).sort((a, b) => {
    if (a.release_year !== b.release_year) {
      return (Number(a.release_year) || 0) - (Number(b.release_year) || 0);
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  let prevSeries = null;
  let nextSeries = null;

  if (allSeries && allSeries.length > 0) {
    const currentIndex = allSeries.findIndex(s => s.id === series.id);
    if (currentIndex > 0) {
      const p = allSeries[currentIndex - 1];
      prevSeries = { slug: locale === 'en' && p.slug_en ? p.slug_en : (p.slug || p.id.toString()), title: locale === 'en' && p.title_en ? p.title_en : p.title };
    }
    if (currentIndex < allSeries.length - 1) {
      const n = allSeries[currentIndex + 1];
      nextSeries = { slug: locale === 'en' && n.slug_en ? n.slug_en : (n.slug || n.id.toString()), title: locale === 'en' && n.title_en ? n.title_en : n.title };
    }
  }

  return (
    <div className="bg-white min-h-screen pb-20 w-full">
      <FloatingSeriesNav prev={prevSeries} next={nextSeries} />

      <ClientViewTracker table="series" id={series.id} />


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

      {/* HEADER GURUBU (Başlık + Info Bar) */}
      <div className="w-full flex flex-col items-center pb-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] bg-[#fcfcfc] relative z-20">
         
         {/* Başlık (Hero Text) */}
         <div className="relative z-10 pt-8 md:pt-10 pb-6 flex flex-col items-center max-w-7xl px-4 w-full">
           <h1 className="text-3xl md:text-[45px] text-[#111] font-black text-center leading-tight tracking-tight mb-4">
             {formatBrandText(title)}
           </h1>
           {isFallback && (
             <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-md text-[11px] font-bold text-orange-700 tracking-wide shadow-sm">
               <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
               {fallbackT('BadgeText')}
             </div>
           )}
         </div>

         {/* Info Bar */}
         <div className="max-w-7xl w-full mx-auto px-4 md:px-8 relative z-20 pb-4">
           <div className="bg-[#fcfcfc] rounded-xl shadow-xl grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border border-gray-100 overflow-hidden backdrop-blur-xl bg-white/90">
          <div className="p-4 md:p-6 lg:pl-10 flex items-center justify-start gap-4 hover:bg-white transition-colors">
            <div className="bg-[#D22B2B] text-white px-2 py-1.5 rounded-md text-[10px] font-black shrink-0 tracking-wider">LEGO®</div>
            <div>
              <p className="text-[10px] md:text-[11px] font-black opacity-50 uppercase tracking-[0.2em] text-[#D22B2B]">{t('Brand')}</p>
              <p className="font-black text-sm md:text-base text-gray-900 mt-0.5">LEGO</p>
            </div>
          </div>
          <div className="p-4 md:p-6 lg:pl-10 flex items-center justify-start gap-4 hover:bg-white transition-colors">
            <div className="text-gray-300 shrink-0">
              <Package size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] md:text-[11px] font-black opacity-50 uppercase tracking-[0.2em] text-[#D22B2B]">{t('Category')}</p>
              <p className="font-black text-sm md:text-[15px] text-gray-900 leading-tight pr-2 mt-0.5">{series.category || '-'}</p>
            </div>
          </div>
          <div className="p-4 md:p-6 lg:pl-10 flex items-center justify-start gap-4 hover:bg-white transition-colors">
             <div className="text-gray-300 shrink-0">
               <Grid3X3 size={28} strokeWidth={1.5} />
             </div>
            <div>
              <p className="text-[10px] md:text-[11px] font-black opacity-50 uppercase tracking-[0.2em] text-[#D22B2B]">{t('Size')}</p>
              <p className="font-black text-sm md:text-[15px] text-gray-900 mt-0.5">{series.figure_count ? `${series.figure_count} ${t('FigureCountUnit')}` : '-'}</p>
            </div>
          </div>
          <div className="p-4 md:p-6 lg:pl-10 flex items-center justify-start gap-4 hover:bg-white transition-colors">
             <div className="text-gray-300 shrink-0">
               <CalendarDays size={28} strokeWidth={1.5} />
             </div>
            <div>
              <p className="text-[10px] md:text-[11px] font-black opacity-50 uppercase tracking-[0.2em] text-[#D22B2B]">{t('Release')}</p>
              <p className="font-black text-sm md:text-[15px] text-gray-900 leading-tight pr-2 mt-0.5">{series.release_month} {series.release_year}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Dinamik Bölüm: MODÜLER İÇERİK BLOKLARI */}
      {content_blocks && Array.isArray(content_blocks) && content_blocks.length > 0 && (
        <div className="w-full mt-8 md:mt-12">
           <BlockRenderer 
             blocks={content_blocks} 
             seriesId={series.id}
           />
        </div>
      )}

      {/* Serideki Figürler Bölümü */}
      <div id="figures-list" className="max-w-7xl mx-auto px-8 mt-8 md:mt-12 pt-8 scroll-mt-24 bg-white relative z-20">
        <h3 className="text-sm font-black mb-2 text-gray-300 tracking-[0.2em] uppercase">{t('DiscoverSeries')}</h3>
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 tracking-tighter">
          {t('FiguresPrefix')}{formatBrandText(title)}{t('FiguresSuffix')}
        </h2>
        
        {figures && figures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {figures.map((fig: any) => (
                    <FigureCard 
                        key={fig.id} 
                        id={fig.id}
                        slug={fig.slug}
                        name={fig.name}
                        seriesName={title}
                        seriesSlug={locale === 'en' && series.slug_en ? series.slug_en : series.slug}
                        imageUrl={(fig.images && fig.images.length > 0) ? fig.images[0] : 'https://via.placeholder.com/300x400.png?text=Görsel+Yok'}
                        year={fig.release_year}
                        rarity={fig.rarity}
                        price={fig.value_usd}
                        minPrice={fig.min_price}
                        maxPrice={fig.max_price}
                        valueScore={fig.value_score}
                        demandScore={fig.demand_score}
                    />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center p-24 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center w-full shadow-sm mt-4">
                <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest">{t('EmptyFigures')}</h2>
            </div>
        )}

      </div>

    </div>
  );
}
