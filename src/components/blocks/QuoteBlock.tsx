import React from 'react';
import { QuoteBlockData } from '@/types/content-blocks';

interface Props {
  data: QuoteBlockData;
}

export default function QuoteBlock({ data }: Props) {
  return (
    <div className="w-full relative my-16 md:my-24 py-16 overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-[#F8F9FA] skew-y-3 scale-110 z-0"></div>
      
      <div className="max-w-[1000px] mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center justify-center text-center">
        {/* Quote Icon */}
        <div className="mb-8 opacity-20 text-[#D22B2B]">
          <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
        </div>
        
        {data.title && (
          <span className="text-sm font-black text-gray-400 tracking-widest uppercase mb-4 block">
            {data.title}
          </span>
        )}
        
        {data.content && (
          <div 
            className="text-2xl md:text-4xl text-gray-900 font-bold leading-tight md:leading-snug inline-block font-sans"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        )}
      </div>
    </div>
  );
}
