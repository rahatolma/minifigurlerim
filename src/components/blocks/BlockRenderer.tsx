import React from 'react';
import { AnyContentBlock } from '@/types/content-blocks';
import { formatBrandText } from '@/utils/textFormatting';
import TextImageBlock from './TextImageBlock';
import FullTextBlock from './FullTextBlock';
import ImageBannerBlock from './ImageBannerBlock';
import QuoteBlock from './QuoteBlock';
import CTABlock from './CTABlock';
import SeriesShowcaseBlock from './SeriesShowcaseBlock';

interface Props {
  blocks: AnyContentBlock[];
  collectionStats?: { percent: number; collected: number; total: number };
  isLoggedIn?: boolean;
}

export default function BlockRenderer({ blocks, collectionStats, isLoggedIn }: Props) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return null;

  // Sıralamaya göre diz, ama SERIES_SHOWCASE her zaman en üstte (0. sırada) olsun
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.type === 'SERIES_SHOWCASE' && b.type !== 'SERIES_SHOWCASE') return -1;
    if (b.type === 'SERIES_SHOWCASE' && a.type !== 'SERIES_SHOWCASE') return 1;
    return a.order - b.order;
  });

function formatBlockDataStrings<T>(data: T): T {
  if (!data || typeof data !== 'object') return data;
  
  const newData: any = Array.isArray(data) ? [...data] : { ...data };
  for (const key in newData) {
    if (typeof newData[key] === 'string') {
      newData[key] = formatBrandText(newData[key] as string);
    } else if (typeof newData[key] === 'object' && newData[key] !== null) {
      newData[key] = formatBlockDataStrings(newData[key]);
    }
  }
  return newData as T;
}

  const renderBlock = (block: AnyContentBlock) => {
    const formattedData = formatBlockDataStrings(block.data);
    switch (block.type) {
      case 'TEXT_IMAGE':
        return <TextImageBlock key={block.id} data={formattedData as any} />;
      case 'FULL_TEXT':
        return <FullTextBlock key={block.id} data={formattedData as any} />;
      case 'IMAGE_BANNER':
        return <ImageBannerBlock key={block.id} data={formattedData as any} />;
      case 'QUOTE':
        return <QuoteBlock key={block.id} data={formattedData as any} />;
      case 'CTA':
        return <CTABlock key={block.id} data={formattedData as any} />;
      case 'SERIES_SHOWCASE':
        return <SeriesShowcaseBlock key={block.id} data={formattedData as any} collectionStats={collectionStats} isLoggedIn={isLoggedIn} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full relative flex flex-col gap-0">
        {sortedBlocks.map((block) => renderBlock(block))}
      </div>
    </div>
  );
}
