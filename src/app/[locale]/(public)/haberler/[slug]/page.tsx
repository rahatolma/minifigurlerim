import { getNewsBySlug } from '@/services/dal';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import RichTextContent from '@/components/ui/RichTextContent';
import { ChevronRight, Calendar, Eye, Share2 } from 'lucide-react';
import ClientViewTracker from '@/components/ui/ClientViewTracker'; // View tracker (we assume it exists from figures, or I will write a simple one inline)
import TranslationFallbackBadge from '@/components/ui/TranslationFallbackBadge';

// Bu sayfa dinamik slug'lara cevap vereceği için ISR/SSR karışımı
export const revalidate = 60;

import { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { permanentRedirect } from 'next/navigation';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const locale = await getLocale();
  const t = await getTranslations('NewsDetail');

  const news = await getNewsBySlug(slug);
  if (!news) {
    return { title: t('NotFoundTitle') || 'Haber Bulunamadı' };
  }

  const isFallback = locale === 'en' && !news.title_en && !news.content_en;
  const rawTitle = locale === 'en' && news.title_en && !isFallback ? news.title_en : news.title;
  
  const metaTitle = locale === 'en' && news.meta_title_en && !isFallback 
    ? news.meta_title_en 
    : `${rawTitle} | Minifigürlerim`;

  let descriptionText = locale === 'en' && news.meta_description_en && !isFallback 
    ? news.meta_description_en 
    : (news.summary || news.meta_description || '');

  if (!descriptionText) {
    descriptionText = `${rawTitle} - ${t('NotFoundDesc') || 'Detaylı lego haberi.'}`;
  }

  const defaultImage = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://minifigurlerim.com'}/api/og/news?title=${encodeURIComponent(rawTitle)}`;
  const newsImage = news.cover_image_url || defaultImage;

  const { buildMetadata } = await import('@/lib/seo');

  const pathTr = `/haberler/${news.slug}`;
  const pathEn = `/news/${news.slug_en || news.slug}`;

  return buildMetadata({
    title: metaTitle,
    description: descriptionText.substring(0, 155),
    locale,
    alternates: {
      tr: pathTr,
      en: pathEn
    },
    ogImage: newsImage,
    noindex: isFallback
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const locale = await getLocale();
  const t = await getTranslations('NewsDetail');

  const news = await getNewsBySlug(slug);

  if (!news) {
    notFound();
  }

  // Canonical Mismatch Redirect (Bi-directional)
  if (locale === 'en' && news.slug_en && slug !== news.slug_en && !slug.includes(news.id)) {
    permanentRedirect(`/en/news/${news.slug_en}`);
  } else if (locale === 'tr' && news.slug && slug !== news.slug && !slug.includes(news.id)) {
    permanentRedirect(`/tr/haberler/${news.slug}`);
  }

  const title = locale === 'en' && news.title_en ? news.title_en : news.title;
  const summary = locale === 'en' && news.summary;
  const content = locale === 'en' && news.content_en ? news.content_en : news.content;

  const isFallback = locale === 'en' && !news.title_en && !news.content_en;
  const fallbackT = await getTranslations('Fallback');

  // Tarihi locale'e göre formatla
  const formattedDate = new Date(news.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // JSON-LD Generation
  const { generateBreadcrumbSchema, generateArticleSchema, safeJsonLd } = await import('@/lib/jsonLd');
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Minifigürlerim', item: `/${locale}` },
    { name: locale === 'en' ? 'News' : 'Haberler', item: `/${locale === 'en' ? 'en/news' : 'tr/haberler'}` },
    { name: title }
  ]);

  const articleSchema = generateArticleSchema(
    title,
    summary || title,
    `/${locale === 'en' ? 'en/news' : 'tr/haberler'}/${news.slug_en || news.slug}`,
    news.cover_image_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://minifigurlerim.com'}/api/og/news?title=${encodeURIComponent(title)}`,
    news.created_at,
    news.updated_at || news.created_at
  );

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }} />
      
      {isFallback && <TranslationFallbackBadge />}
      {/* Sunucu bazlı view takip işlemi için Client bileşeni (Figürlerdeki gibi) */}
      <ClientViewTracker table="news" id={news.id} />



      {/* HEADER / HERO ALANI */}
      <div className="w-full max-w-7xl mx-auto px-8 mt-16 mb-12">
        <div className="flex items-center gap-6 mb-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
           <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#D22B2B]" />
              {formattedDate}
           </div>

           <div className="w-1 h-1 rounded-full bg-gray-300"></div>
           <div className="flex items-center gap-2">
              <Eye size={14} className="text-[#D22B2B]" />
              {news.total_views || 0}{t('Views')}
           </div>
        </div>
        
        <div className="flex flex-col items-start w-full">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">
            {title}
          </h1>
        </div>

        {summary && (
          <p className="text-xl text-gray-600 font-medium leading-relaxed mb-10 border-l-4 border-[#D22B2B] pl-6">
            {summary}
          </p>
        )}
      </div>

      {/* KAPAK FOTOĞRAFI */}
      <div className="w-full max-w-7xl mx-auto px-8 mb-16">
         {news.cover_image_vertical_url && news.cover_image_url ? (
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
                <div className="w-full md:w-1/3 shrink-0">
                    <img src={news.cover_image_vertical_url} className="w-full h-full object-cover rounded-2xl shadow-lg border border-gray-100 aspect-square md:aspect-auto" alt={news.title + " Dikey"} />
                </div>
                <div className="w-full md:w-2/3">
                    <img src={news.cover_image_url} className="w-full h-full object-cover rounded-2xl shadow-lg border border-gray-100 aspect-[21/9] md:aspect-auto" alt={news.title + " Yatay"} />
                </div>
            </div>
         ) : news.cover_image_vertical_url ? (
            <img src={news.cover_image_vertical_url} className="w-full aspect-[4/5] object-cover rounded-2xl shadow-lg border border-gray-100 lg:w-1/3 md:w-1/2 mx-auto" alt={news.title + " Dikey"} />
         ) : news.cover_image_url ? (
           <img 
             src={news.cover_image_url} 
             alt={title} 
             className="w-full aspect-[21/9] object-cover rounded-2xl shadow-lg border border-gray-100" 
           />
         ) : (
           <div className="w-full aspect-[21/9] bg-gray-100 flex items-center justify-center rounded-2xl border border-gray-200">
             <span className="text-gray-400 font-bold tracking-widest uppercase">{t('NoImage')}</span>
           </div>
         )}
      </div>

      {/* HABER İÇERİĞİ (RICH TEXT) */}
      <div className="w-full max-w-7xl mx-auto px-8 mb-16">
        <RichTextContent html={content || ''} className="prose-lg prose-red text-gray-800 font-medium leading-loose" />
      </div>


    </div>
  );
}
