import React from 'react';
import Link from 'next/link';
import { CTABlockData } from '@/types/content-blocks';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';

interface Props {
  data: CTABlockData;
}

export default function CTABlock({ data }: Props) {
  return (
    <div className="w-full relative py-20 px-6 bg-gray-900 overflow-hidden flex flex-col items-center text-center group border-y border-gray-800">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#D22B2B]/20 blur-[60px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-[#D22B2B]/30"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600/10 blur-[50px] rounded-full pointer-events-none"></div>

      {/* Icon */}
      <div className="relative z-10 w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
        <LegoHeadIcon mode="happy" className="w-10 h-10" color="text-yellow-400" />
      </div>

      <div className="relative z-10 flex flex-col items-center mb-6 max-w-[800px]">
        {data.title && (
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm mb-4">
            {data.title}
          </h2>
        )}
        {data.description && (
          <p className="text-[16px] md:text-[18px] font-bold text-gray-300 max-w-xl mx-auto drop-shadow-sm leading-relaxed">
            {data.description}
          </p>
        )}
      </div>

      {data.buttonText && data.buttonAction && (
        <div className="relative z-10 mt-2 mb-4 w-full md:w-auto">
          <Link 
            href={data.buttonAction}
            className="relative overflow-hidden inline-flex items-center justify-center font-black text-[13px] tracking-[0.15em] uppercase py-4 px-12 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(210,43,43,0.4)] group/btn w-full md:w-auto transform hover:-translate-y-1 bg-[#D22B2B] text-white hover:bg-red-600 hover:shadow-[0_0_30px_rgba(210,43,43,0.6)]"
          >
            <span className="relative z-10">{data.buttonText}</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
          </Link>
        </div>
      )}
    </div>
  );
}
