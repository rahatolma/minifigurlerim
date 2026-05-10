'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsLight {
  slug: string;
  title: string;
}

interface Props {
  prev?: NewsLight | null;
  next?: NewsLight | null;
  isEn: boolean;
}

export default function FloatingNewsNav({ prev, next, isEn }: Props) {
  return (
    <>
      {/* Önceki Haber (Sol Buton) */}
      {prev && (
        <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[90] hidden md:flex">
          <Link 
            href={`/haberler/${prev.slug}` as any}
            className="group flex items-center bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-4 px-2 rounded-r-2xl border border-l-0 border-gray-200 transition-all hover:pr-6 hover:bg-white"
          >
            <ChevronLeft size={24} className="text-gray-400 group-hover:text-[#D22B2B] shrink-0" strokeWidth={2.5} />
            <div className="overflow-hidden w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 ml-1 whitespace-nowrap">
               <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase block leading-none mb-1">{isEn ? 'Previous Article' : 'Önceki Yazı'}</span>
               <span className="text-sm font-bold text-gray-900 leading-tight block">{prev.title}</span>
            </div>
          </Link>
        </div>
      )}

      {/* Sonraki Haber (Sağ Buton) */}
      {next && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] hidden md:flex">
          <Link 
            href={`/haberler/${next.slug}` as any}
            className="group flex items-center flex-row-reverse bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-4 px-2 rounded-l-2xl border border-r-0 border-gray-200 transition-all hover:pl-6 hover:bg-white"
          >
            <ChevronRight size={24} className="text-gray-400 group-hover:text-[#D22B2B] shrink-0" strokeWidth={2.5} />
            <div className="overflow-hidden w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 transition-all duration-300 mr-1 text-right whitespace-nowrap">
               <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase block leading-none mb-1">{isEn ? 'Next Article' : 'Sonraki Yazı'}</span>
               <span className="text-sm font-bold text-gray-900 leading-tight block">{next.title}</span>
            </div>
          </Link>
        </div>
      )}
    </>
  );
}
