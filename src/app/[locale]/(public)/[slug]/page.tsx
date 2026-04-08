import { getPageBySlug } from '@/services/dal';
import { notFound } from 'next/navigation';
import BlockRenderer from '@/components/blocks/BlockRenderer';

export const revalidate = 86400; // Her zaman canlı veri

export default async function DynamicCMSPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const { slug, locale } = await params;
  
  const page = await getPageBySlug(slug);

  if (!page) {
     return notFound();
  }

  // Handle i18n
  const displayTitle = locale === 'en' && page.title_en ? page.title_en : page.title;
  const displayBlocks = locale === 'en' && page.content_blocks_en && page.content_blocks_en.length > 0
    ? page.content_blocks_en 
    : page.content_blocks;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-24 pb-32">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-16 px-4 md:px-0">
          {displayTitle}
        </h1>

        {displayBlocks && displayBlocks.length > 0 ? (
          <div className="prose prose-lg max-w-none prose-img:rounded-xl">
             <BlockRenderer blocks={displayBlocks} />
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">
            İçerik henüz hazırlanmamış.
          </div>
        )}
      </div>
    </div>
  );
}
