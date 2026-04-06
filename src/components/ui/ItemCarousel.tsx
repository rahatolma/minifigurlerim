'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ItemCarouselProps = {
  titleBlock: React.ReactNode;
  actionButton?: React.ReactNode;
  children: React.ReactNode[];
};

export default function ItemCarousel({ titleBlock, actionButton, children }: ItemCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    breakpoints: {
      '(min-width: 1024px)': { slidesToScroll: 3 }
    }
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit).on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  return (
    <div className="w-full relative overflow-hidden">
      <div className="flex flex-row flex-wrap items-center justify-between mb-6 md:mb-10 gap-x-2 gap-y-4 px-4 md:px-8 max-w-7xl mx-auto">
        {titleBlock}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {actionButton}

          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
              className={`p-2 rounded-full border-2 transition-colors ${!prevBtnDisabled ? 'border-gray-900 text-gray-900 hover:bg-gray-100' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
            >
              <ChevronLeft size={20} className="relative z-0" strokeWidth={2.5} />
            </button>
            <button
              onClick={scrollNext}
              disabled={nextBtnDisabled}
              className={`p-2 rounded-full border-2 transition-colors ${!nextBtnDisabled ? 'border-gray-900 text-gray-900 hover:bg-gray-100' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
            >
              <ChevronRight size={20} className="relative z-0" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-0">
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex -ml-4 md:-ml-8 items-stretch pt-2 pb-10">
            {React.Children.toArray(children).map((child, index) => (
              <div
                key={index}
                className="shrink-0 grow-0 min-w-0 w-[85%] sm:w-1/2 lg:w-1/3"
              >
                <div className="w-full h-full pl-4 md:pl-8">
                  {child}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        {scrollSnaps.length > 1 && (
          <div className="flex justify-center items-center gap-2 absolute bottom-0 left-0 right-0">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer hover:bg-[#D22B2B]/70 ${index === selectedIndex ? 'bg-[#D22B2B] w-8' : 'bg-gray-300'
                  }`}
                onClick={() => scrollTo(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

