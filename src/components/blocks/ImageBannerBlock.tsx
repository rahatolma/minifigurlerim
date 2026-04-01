import React from 'react';
import { ImageBannerBlockData } from '@/types/content-blocks';

interface Props {
  data: ImageBannerBlockData;
}

export default function ImageBannerBlock({ data }: Props) {
  if (!data.imageUrl) return null;

  return (
    <div className="w-full relative my-12 bg-gray-50 flex flex-col items-center border-[y] border-gray-100 overflow-hidden group">
      <div className="w-full max-w-[1500px] mx-auto min-h-[300px] max-h-[600px] flex items-center justify-center relative overflow-hidden bg-[#f3f4f6]">
          <picture>
            <img 
              src={data.imageUrl} 
              alt={data.caption || "Image Banner"} 
              className="w-full h-auto max-h-[600px] object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-[1.5s]"
              loading="lazy" 
            />
          </picture>
      </div>
      {data.caption && (
        <div className="px-6 py-4 bg-white/90 backdrop-blur-md text-xs font-bold text-gray-500 uppercase tracking-widest absolute bottom-4 shadow-xl border border-white/50 rounded-lg max-w-[90%] md:max-w-2xl text-center z-10">
          {data.caption}
        </div>
      )}
    </div>
  );
}
