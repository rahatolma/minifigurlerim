import React from 'react';
import { QuoteBlockData } from '@/types/content-blocks';
import RichTextContent from '@/components/ui/RichTextContent';

interface Props {
  data: QuoteBlockData;
}

export default function QuoteBlock({ data }: Props) {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-8 mt-10 mb-16 md:mt-12 md:mb-24 text-center">
       <div className="flex flex-col items-center gap-6 md:gap-8 bg-[#F2CD37] rounded-[32px] p-8 md:p-12 shadow-[0_15px_40px_-10px_rgba(242,205,55,0.4)] relative overflow-hidden">
         
         {/* Dekoratif Arka Plan Işıkları */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#111] opacity-[0.04] rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

         {/* Büyük Başlık ve Altı Çizgisi */}
         {data.title && (
           <div className="flex flex-col items-center gap-5 relative z-10 w-full">
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1a1c29] tracking-tight leading-[1.2] text-balance">
               {data.title}
             </h2>
             <div className="w-16 h-1.5 rounded-full bg-[#D22B2B]"></div>
           </div>
         )}
         
         {/* Merkezi İçerik / Alt Başlık */}
         {data.content && (
           <div className="w-full relative z-10">
             <RichTextContent 
               html={data.content}
               className="text-[18px] md:text-[20px] lg:text-[22px] text-gray-900 font-bold leading-[1.8] [&_p]:!my-0 [&_span]:!bg-transparent text-balance selection:bg-[#1a1c29] selection:text-[#F2CD37]"
             />
           </div>
         )}
       </div>
    </div>
  );
}
