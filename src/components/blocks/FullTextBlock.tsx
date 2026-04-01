import React from 'react';
import { FullTextBlockData } from '@/types/content-blocks';

interface Props {
  data: FullTextBlockData;
}

import RichTextContent from '@/components/ui/RichTextContent';

export default function FullTextBlock({ data }: Props) {
  return (
    <div className="w-full py-8 md:py-12 bg-white flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
        {data.title && (
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8">
            {data.title}
          </h2>
        )}
        {data.content && (
          <RichTextContent 
            html={data.content}
            className="w-full prose-lg leading-[1.8] overflow-hidden [&_p]:!ml-0 [&_span]:!ml-0 text-gray-800 max-w-none"
          />
        )}
      </div>
    </div>
  );
}
