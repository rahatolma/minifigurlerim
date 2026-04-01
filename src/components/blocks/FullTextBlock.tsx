import React from 'react';
import { FullTextBlockData } from '@/types/content-blocks';

interface Props {
  data: FullTextBlockData;
}

export default function FullTextBlock({ data }: Props) {
  return (
    <div className="w-full py-16 md:py-24 bg-[#FCFCFC]">
      <div className="max-w-[800px] mx-auto px-6 md:px-8">
        {data.title && (
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter text-center mb-8">
            {data.title}
          </h2>
        )}
        {data.content && (
          <div 
            className="prose prose-lg max-w-none text-gray-700 font-medium leading-[1.8] text-center"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        )}
      </div>
    </div>
  );
}
