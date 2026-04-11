import React from 'react';
import { TextImageBlockData } from '@/types/content-blocks';
import RichTextContent from '../ui/RichTextContent';

interface Props {
  data: TextImageBlockData;
}

export default function TextImageBlock({ data }: Props) {
  const isImageRight = data.imageAlign === 'right';

  return (
    <div className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        <div className={`flex flex-col md:flex-row gap-12 lg:gap-20 items-center ${isImageRight ? 'md:flex-row-reverse' : ''}`}>
          
          {/* Metin Sütunu */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            {data.title && (
              <h3 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                {data.title}
              </h3>
            )}
            {data.content && (
              <RichTextContent 
                 html={data.content}
                 className="prose-sm md:prose-base leading-relaxed font-medium mt-4 md:mt-6 overflow-hidden [&_p]:!ml-0 [&_span]:!ml-0"
              />
            )}
          </div>

          {/* Image Column */}
          {data.imageUrl && (
            <div className="flex-1 w-full flex justify-center items-center">
              <div className="relative w-full max-w-[500px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] bg-[#fafafa] border border-gray-100 flex items-center justify-center p-12 lg:p-16 group">
                <img 
                  src={data.imageUrl} 
                  alt={data.title || "Content Image"} 
                  className="w-full h-auto object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
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
