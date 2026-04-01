'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FigureLight {
  slug: string;
  name: string;
}

interface Props {
  prev?: FigureLight | null;
  next?: FigureLight | null;
}

export default function FloatingFigureNav({ prev, next }: Props) {
  return (
    <>
      {/* Önceki Figür (Sol Buton) */}
      {prev && (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[90] hidden md:flex">
          <Link 
            href={`/figurler/${prev.slug}`}
            className="group flex items-center bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-4 px-2 rounded-r-2xl border border-l-0 border-gray-200 transition-all hover:pr-6 hover:bg-white"
          >
            <ChevronLeft size={24} className="text-gray-400 group-hover:text-[#D22B2B] shrink-0" strokeWidth={2.5} />
            <div className="overflow-hidden w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 ml-1 whitespace-nowrap">
               <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase block leading-none mb-1">Önceki Figür</span>
               <span className="text-sm font-bold text-gray-900 leading-tight block">{prev.name}</span>
            </div>
          </Link>
        </div>
      )}

      {/* Sonraki Figür (Sağ Buton) */}
      {next && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] hidden md:flex">
          <Link 
            href={`/figurler/${next.slug}`}
            className="group flex items-center flex-row-reverse bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-4 px-2 rounded-l-2xl border border-r-0 border-gray-200 transition-all hover:pl-6 hover:bg-white"
          >
            <ChevronRight size={24} className="text-gray-400 group-hover:text-[#D22B2B] shrink-0" strokeWidth={2.5} />
            <div className="overflow-hidden w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 mr-1 text-right whitespace-nowrap">
               <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase block leading-none mb-1">Sonraki Figür</span>
               <span className="text-sm font-bold text-gray-900 leading-tight block">{next.name}</span>
            </div>
          </Link>
        </div>
      )}
    </>
  );
}
