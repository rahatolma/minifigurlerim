import { getExplorePageData } from '@/services/exploreAggregation';
import FigureCard from '@/components/ui/FigureCard';



import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';
export default async function ExplorePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ExplorePage' });
  const { figures, degradedBlocks } = await getExplorePageData();
  const isFiguresDegraded = degradedBlocks.includes('explore_figures');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('title')}</h1>
        <p className="text-gray-500 mt-2">{t('description')}</p>
      </div>

      {isFiguresDegraded ? (
        <div className="w-full h-48 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-medium">
          {t('errorDegraded')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {figures.map(figure => (
            <FigureCard
              key={figure.id}
              {...figure}
            />
          ))}
          {figures.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              {t('emptyFigures')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
