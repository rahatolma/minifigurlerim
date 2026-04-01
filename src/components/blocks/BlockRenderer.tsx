import React from 'react';
import { AnyContentBlock } from '@/types/content-blocks';
import TextImageBlock from './TextImageBlock';
import FullTextBlock from './FullTextBlock';
import ImageBannerBlock from './ImageBannerBlock';
import QuoteBlock from './QuoteBlock';
import CTABlock from './CTABlock';

interface Props {
  blocks: AnyContentBlock[];
}

export default function BlockRenderer({ blocks }: Props) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  // Render blocks in the exact order they are arranged
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full relative flex flex-col gap-0 border-t border-gray-100">
        {sortedBlocks.map((block) => {
          switch (block.type) {
            case 'TEXT_IMAGE':
              return <TextImageBlock key={block.id} data={block.data} />;
            case 'FULL_TEXT':
              return <FullTextBlock key={block.id} data={block.data} />;
            case 'IMAGE_BANNER':
              return <ImageBannerBlock key={block.id} data={block.data} />;
            case 'QUOTE':
              return <QuoteBlock key={block.id} data={block.data} />;
            case 'CTA':
              return <CTABlock key={block.id} data={block.data} />;
            default:
              console.warn(`Unknown block type: ${(block as any).type}`);
              return null;
          }
        })}
      </div>
    </div>
  );
}
