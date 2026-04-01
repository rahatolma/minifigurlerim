export type ContentBlockType = 'TEXT_IMAGE' | 'FULL_TEXT' | 'IMAGE_BANNER' | 'QUOTE' | 'CTA';

export interface BaseBlock {
  id: string;
  type: ContentBlockType;
  order: number;
}

export interface TextImageBlockData {
  title: string;
  content: string; // rich text
  imageUrl: string;
  imageAlign: 'left' | 'right';
}

export interface FullTextBlockData {
  title: string;
  content: string; // rich text
}

export interface ImageBannerBlockData {
  imageUrl: string;
  caption?: string;
}

export interface QuoteBlockData {
  title: string;
  content: string;
}

export interface CTABlockData {
  title: string;
  description: string;
  buttonText: string;
  buttonAction: string; // e.g. URL or generic action identifier like "koleksiyona_ekle"
}

export interface TextImageBlock extends BaseBlock {
  type: 'TEXT_IMAGE';
  data: TextImageBlockData;
}

export interface FullTextBlock extends BaseBlock {
  type: 'FULL_TEXT';
  data: FullTextBlockData;
}

export interface ImageBannerBlock extends BaseBlock {
  type: 'IMAGE_BANNER';
  data: ImageBannerBlockData;
}

export interface QuoteBlock extends BaseBlock {
  type: 'QUOTE';
  data: QuoteBlockData;
}

export interface CTABlock extends BaseBlock {
  type: 'CTA';
  data: CTABlockData;
}

export type AnyContentBlock = 
  | TextImageBlock 
  | FullTextBlock 
  | ImageBannerBlock 
  | QuoteBlock 
  | CTABlock;
