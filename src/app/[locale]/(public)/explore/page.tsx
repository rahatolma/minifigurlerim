import { getExplorePageData } from '@/services/exploreAggregation';
import FigureCard from '@/components/ui/FigureCard';

export const revalidate = 86400; // Statik jenerasyon opsiyonel, fallback ile

export default async function ExplorePage() {
  const { figures, degradedBlocks } = await getExplorePageData();
  const isFiguresDegraded = degradedBlocks.includes('explore_figures');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Keşfet</h1>
        <p className="text-gray-500 mt-2">En çok ilgi gören ve değerlenen figürlere göz at.</p>
      </div>

      {isFiguresDegraded ? (
        <div className="w-full h-48 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-medium">
          Figür verileri şu anda yüklenemiyor. Daha sonra tekrar deneyin.
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
              Henüz gösterilecek figür yok.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
