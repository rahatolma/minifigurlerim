import React from 'react';
import { ImageBannerBlockData } from '@/types/content-blocks';

interface Props {
  data: ImageBannerBlockData;
}

export default function ImageBannerBlock({ data }: Props) {
  if (!data.imageUrl && !data.imageVerticalUrl) return null;

  return (
    <div className="w-full relative my-12 bg-white flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
         {data.imageVerticalUrl && data.imageUrl ? (
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
                <div className="w-full md:w-1/3 shrink-0">
                    <img src={data.imageVerticalUrl} className="w-full h-full object-cover rounded-2xl shadow-lg border border-gray-100 aspect-square md:aspect-auto" alt={data.caption || "Dikey Görsel"} />
                </div>
                <div className="w-full md:w-2/3">
                    <img src={data.imageUrl} className="w-full h-full object-cover rounded-2xl shadow-lg border border-gray-100 aspect-[21/9] md:aspect-auto" alt={data.caption || "Yatay Görsel"} />
                </div>
            </div>
         ) : data.imageVerticalUrl ? (
            <img src={data.imageVerticalUrl} className="w-full aspect-[4/5] object-cover rounded-2xl shadow-lg border border-gray-100 lg:w-1/3 md:w-1/2 mx-auto" alt={data.caption || "Dikey Görsel"} />
         ) : data.imageUrl ? (
           <img 
             src={data.imageUrl} 
             alt={data.caption || "Görsel"} 
             className="w-full aspect-[21/9] object-cover rounded-2xl shadow-lg border border-gray-100" 
           />
         ) : null}

         {data.caption && (
           <p className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest mt-6">
             {data.caption}
           </p>
         )}
      </div>
    </div>
  );
}
