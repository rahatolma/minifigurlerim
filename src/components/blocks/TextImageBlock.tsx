import React from 'react';
import { TextImageBlockData } from '@/types/content-blocks';

interface Props {
  data: TextImageBlockData;
}

export default function TextImageBlock({ data }: Props) {
  const isImageRight = data.imageAlign === 'right';

  return (
    <div className="w-full py-12 md:py-20 bg-white">
      <div className="max-w-[1300px] mx-auto px-6 md:px-8">
        <div className={`flex flex-col gap-10 lg:gap-16 items-center ${isImageRight ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
          {/* Text Column */}
          <div className="flex-1 w-full space-y-6">
            {data.title && (
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                {data.title}
              </h2>
            )}
            {data.content && (
              <div 
                className="prose prose-lg max-w-none text-gray-700 font-medium leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            )}
          </div>

          {/* Image Column */}
          {data.imageUrl && (
            <div className="flex-1 w-full flex justify-center items-center">
              <div className="relative w-full max-w-[500px] aspect-square rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] bg-gray-50 border border-gray-100 flex items-center justify-center p-8 group">
                <img 
                  src={data.imageUrl} 
                  alt={data.title || "Content Image"} 
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
