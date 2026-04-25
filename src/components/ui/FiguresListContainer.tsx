'use client';

import React, { useState, useEffect } from 'react';
import FigureCard from '@/components/ui/FigureCard';
import { FigureCardData } from '@/utils/figureMapper';
import { fetchMoreMinifigures } from '@/actions/minifigures';
import { useTranslations } from 'next-intl';

interface FiguresListContainerProps {
  initialFigures: FigureCardData[];
  totalCount: number;
  filters: {
    series?: string;
    role?: string;
    type?: string;
    rarity?: string;
  };
  locale?: string;
}

export default function FiguresListContainer({ initialFigures, totalCount, filters, locale = 'tr' }: FiguresListContainerProps) {
  const [figures, setFigures] = useState<FigureCardData[]>(initialFigures);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('FiguresList');

  // When filters or initial figures change from Server (URL change), reset our client state.
  useEffect(() => {
    setFigures(initialFigures);
    setPage(1);
  }, [initialFigures, filters]);

  const hasMore = figures.length < (totalCount || 0);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      const nextPage = page + 1;
      const newBatch = await fetchMoreMinifigures(filters, nextPage, 36, locale);
      
      if (newBatch && newBatch.length > 0) {
        setFigures((prev) => [...prev, ...newBatch]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Görseller yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col mb-10">
      <div className="flex flex-row snap-x snap-mandatory overflow-x-auto pb-8 -mx-8 px-8 gap-4 md:grid md:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 md:gap-5 md:overflow-visible md:snap-none md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {figures.map((fig) => (
          <div key={fig.id} className="snap-center snap-always shrink-0 w-[90vw] md:w-auto flex flex-col justify-stretch">
             <FigureCard {...fig} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12 w-full">
          <button
            onClick={loadMore}
            disabled={loading}
            className={`
              relative overflow-hidden
              bg-white border-2 border-gray-100 shadow-sm text-gray-800
              font-black uppercase tracking-widest text-xs px-10 py-5 rounded-2xl
              transition-all duration-300 transform
              hover:border-[#D22B2B] hover:text-[#D22B2B] hover:-translate-y-1 hover:shadow-md
              active:translate-y-0 active:shadow-sm
              ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-4 w-4 text-[#D22B2B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('Loading')}
              </span>
            ) : (
              <span>{t('LoadMore')}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
