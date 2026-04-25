'use client';

import React, { useState } from 'react';
import DragScrollContainer from '@/components/ui/DragScrollContainer';
import { useTranslations } from 'next-intl';

interface SeriesTimelineClientProps {
  titleFirst: string;
  titleSecond: string;
  subtitle: string;
}

export default function SeriesTimelineClient({ titleFirst, titleSecond, subtitle }: SeriesTimelineClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const t = useTranslations('SeriesTimeline');
  
  // To keep the map simple, we can extract items from the dictionary
  // However, next-intl useTranslations requires mapping over keys or extracting an array if configured.
  // It's safer to map manually or use t.raw('Items')
  const historyItems: Array<{year: string, date: string, title: string, desc: string}> = t.raw('Items');


  return (
    <div className="hidden md:block w-full bg-[#fcfcfc] pt-12 pb-16 overflow-hidden relative border-b border-gray-100 z-10">
       <div className="max-w-7xl mx-auto px-8 mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
            {titleFirst}<span className="text-[#D22B2B]">{titleSecond}</span>
          </h2>
          <p className="text-gray-500 font-bold max-w-2xl mx-auto text-sm md:text-base whitespace-pre-line">
            {subtitle}
          </p>
       </div>

       {/* Animasyonlu Kaydırma Alanı */}
       <DragScrollContainer className="w-full pb-10 pt-4 px-4 md:px-12">
          <div className="flex items-start gap-0 w-max md:min-w-full md:justify-center relative px-8 pointer-events-auto group/timeline">
             {/* Arka plan bağlayıcı çizgisi: İnce, düz ve flat */}
             <div className="absolute top-[44px] left-0 right-0 h-px bg-gray-200 -z-10"></div>
          
             {historyItems.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                <div 
                  key={index} 
                  onClick={() => setActiveIndex(index)}
                  className={`flex flex-col items-center justify-start shrink-0 w-[140px] px-2 transition-all duration-500 cursor-pointer ${isActive ? 'opacity-100 scale-100' : 'opacity-30 scale-95 hover:opacity-60'}`}
                >
                    {/* Yıl Rozeti (Mekanik yükseklik) */}
                    <div className="h-[24px] mb-2 flex items-end justify-center w-full">
                        <div className={`font-black tracking-widest uppercase transition-all duration-500 transform ${isActive ? 'text-[14px] text-[#D22B2B]' : 'text-[11px] text-gray-500'}`}>
                            {item.year}
                        </div>
                    </div>

                    {/* Timeline Node (DOT) */}
                    <div className="relative w-full flex items-center justify-center mb-5 z-10 h-6">
                        <div className={`transition-all duration-500 rounded-full flex items-center justify-center border-2 border-white ${isActive ? 'w-5 h-5 bg-[#D22B2B] shadow-[0_0_0_6px_rgba(210,43,43,0.15)]' : 'w-3 h-3 bg-gray-300'}`}>
                        </div>
                    </div>

                    {/* Content (Title & Desc) */}
                    <div className="text-center w-full flex flex-col items-center h-[90px]">
                       <div className={`text-[10px] tracking-widest font-bold uppercase transition-all duration-500 ${isActive ? 'text-[#D22B2B] mb-1 opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'}`}>
                         {item.date}
                       </div>
                       <h4 className={`font-black tracking-widest uppercase mb-2 transition-all duration-500 transform ${isActive ? 'text-[14px] text-gray-900' : 'text-[12px] text-gray-600'}`}>
                         {item.title}
                       </h4>
                       
                       {/* Description Fixed Height */}
                       <div className={`transition-all duration-500 w-full ${isActive ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'}`}>
                          <p className="text-[11px] text-gray-500 font-bold leading-relaxed line-clamp-3 px-1">
                             {item.desc}
                          </p>
                       </div>
                    </div>
                </div>
             )})}
          </div>
       </DragScrollContainer>
    </div>
  );
}
