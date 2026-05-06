'use client';

import React from 'react';
import FigureCard from '@/components/ui/FigureCard';
import ItemCarousel from '@/components/ui/ItemCarousel';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';
import { mapFigureForCard } from '@/utils/figureMapper';
import { trackClickSimilarFigure } from '@/lib/analytics';
import { FigureCardData } from '@/utils/figureMapper';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function SimilarFigures({ figures, locale }: { figures: any[], locale: string }) {
    const t = useTranslations('SimilarFigures');
    const pathname = usePathname();
    if (!figures || figures.length === 0) return null;

    const mappedFigures = figures.map(row => mapFigureForCard(row, locale)).filter((fig): fig is FigureCardData => fig !== null);

    return (
        <section className="bg-transparent py-[40px] border-t border-gray-100 mt-12 mb-12 relative">
            <ItemCarousel
              titleBlock={
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="w-8 h-8 md:w-14 md:h-14 bg-white border-2 border-[#D22B2B] text-[#D22B2B] rounded-full flex items-center justify-center shadow-sm shrink-0">
                      <LegoHeadIcon mode="happy" className="w-[16px] h-[16px] md:w-[32px] md:h-[32px]" color="text-[#D22B2B]" />
                  </div>
                  <div className="flex flex-col">
                     <h2 className="text-[17px] sm:text-2xl md:text-4xl font-black text-gray-900 leading-tight">{t('Title')}</h2>
                  </div>
                </div>
              }
            >
              {mappedFigures.map((fig) => (
                  <div key={fig.id} onClick={() => {
                      trackClickSimilarFigure({
                          figure_id: fig.id,
                          figure_slug: fig.figure_slug_tr || '',
                          series_id: fig.series_id || '',
                          series_slug: fig.series_slug_tr || '',
                          locale: locale,
                          route: pathname,
                          source_section: 'similar_figures'
                      });
                  }}>
                      <FigureCard {...fig} />
                  </div>
              ))}
            </ItemCarousel>
        </section>
    );
}
