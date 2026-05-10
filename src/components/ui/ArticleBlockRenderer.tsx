import React from 'react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { AlertTriangle, Info, Tag, TrendingUp, AlertOctagon, ArrowRight, CheckCircle2 } from 'lucide-react';
import RichTextContent from './RichTextContent';
import DOMPurify from 'isomorphic-dompurify';
import ClientTOC from './ClientTOC';

export type BlockType =
  | 'intro'
  | 'toc'
  | 'methodology'
  | 'ranked_item'
  | 'callout'
  | 'cta'
  | 'faq'
  | 'text'
  | 'heading'
  | 'image';

export interface ArticleBlock {
  id?: string;
  type: string;
  content?: string;
  data?: Record<string, any>;
}

const sanitizeUrl = (url?: string) => {
  if (!url) return '#';
  const cleanUrl = url.trim();
  if (/^(javascript:|data:|vbscript:)/i.test(cleanUrl)) return '#';
  return cleanUrl;
};

const safeString = (str?: any) => {
  if (typeof str !== 'string') return '';
  return str;
};

export default function ArticleBlockRenderer({ blocks, locale }: { blocks: any, locale?: string }) {
  if (!blocks || !Array.isArray(blocks)) return null;

  const isEn = locale === 'en';

  return (
    <div className="flex flex-col gap-0">
      {blocks.map((block: any, index: number) => {
        if (!block || typeof block !== 'object' || !block.type) return null;
        
        const blockId = block.id || `block-${index}-${block.type}`;

        switch (block.type as BlockType) {
          case 'intro':
            return (
              <div key={blockId} className="w-full text-xl md:text-2xl text-slate-800 font-medium leading-relaxed border-l-[4px] border-[#D22B2B] pl-5 md:pl-8 py-2 italic bg-transparent my-10">
                <RichTextContent html={block.content || ''} className="!prose-p:mb-0 !prose-p:leading-relaxed" />
              </div>
            );

          case 'text':
            return (
              <div key={blockId} className="w-full my-6">
                <RichTextContent html={block.content || ''} className="text-lg md:text-xl text-slate-800 leading-loose" />
              </div>
            );

          case 'heading':
            const Level = block.data?.level === 3 ? 'h3' : 'h2';
            return (
              <Level key={blockId} id={block.data?.id} className="w-full text-3xl md:text-4xl font-black text-slate-900 mt-16 mb-6 tracking-tight flex items-center gap-3 scroll-mt-28">
                {safeString(block.content)}
              </Level>
            );

          case 'methodology':
            return (
              <div key={blockId} className="w-full bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col sm:flex-row gap-5 items-start my-10">
                <div className="bg-white p-3 rounded-full border border-slate-200 shrink-0 shadow-sm">
                  <CheckCircle2 size={24} className="text-[#D22B2B]" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{isEn ? 'Methodology & Criteria' : 'Metodoloji & Kriterler'}</h4>
                  <p className="text-slate-800 font-medium leading-relaxed text-base md:text-lg">
                    {safeString(block.content || block.data?.text)}
                  </p>
                </div>
              </div>
            );

          case 'toc':
            if (!block.data?.items || !Array.isArray(block.data.items)) return null;
            return <ClientTOC key={blockId} items={block.data.items} locale={locale} />;

          case 'ranked_item':
            // Entity Relation Engine
            const isSeries = block.data?.entity_type === 'series';
            const isFigure = block.data?.entity_type === 'figure';
            const hasEntity = isSeries || isFigure;
            
            let linkUrl = sanitizeUrl(block.data?.link);
            if (isSeries && block.data?.entity_slug) {
              linkUrl = `/seriler/${block.data.entity_slug}`;
            } else if (isFigure && block.data?.entity_slug && block.data?.series_slug) {
              linkUrl = `/figurler/${block.data.series_slug}/${block.data.entity_slug}`;
            }
            
            if (linkUrl) {
              linkUrl = linkUrl.replace(/^\/(tr|en)\//, '/');
            }
              
            const btnText = hasEntity 
              ? (isSeries ? (isEn ? 'View Series' : 'Seriyi İncele') : (isEn ? 'View Minifigure' : 'Minifigürü İncele')) 
              : (isEn ? 'Go to Page' : 'İlgili Sayfaya Git');

            // TOC uses ID matching. Fallback to slugified title if id missing.
            const generatedId = block.data?.id || block.data?.entity_slug || block.data?.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `rank-${block.data?.rank || blockId}`;

            return (
              <div key={blockId} className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden scroll-mt-28 my-10" id={generatedId}>
                <div className="bg-slate-50 border-b border-slate-100 p-6 md:p-8 flex items-center gap-6">
                  {block.data?.rank && (
                    <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl shrink-0">
                      #{safeString(String(block.data.rank))}
                    </div>
                  )}
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 m-0 tracking-tight leading-tight">
                    {safeString(block.data?.title || 'Bilinmeyen Öğe')}
                  </h3>
                </div>
                
                <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 md:gap-10 items-start">
                  <div className="flex-1 space-y-6 w-full">
                    <RichTextContent html={block.data?.description || block.content || ''} className="text-slate-800 text-lg md:text-xl leading-relaxed max-w-none" />
                    
                    {block.data?.collector_note && (
                      <div className="bg-blue-50 border-l-[6px] border-blue-500 p-6 md:p-8 rounded-r-2xl shadow-sm flex items-start gap-4">
                        <Info size={24} className="text-blue-600 shrink-0 mt-1" />
                        <div>
                          <span className="block text-xs md:text-sm font-black uppercase tracking-widest text-blue-800 mb-2">{isEn ? "Collector's Note" : "Koleksiyoner Notu"}</span>
                          <p className="text-base md:text-lg text-blue-900 font-medium leading-relaxed">{safeString(block.data.collector_note)}</p>
                        </div>
                      </div>
                    )}
                    
                    {(linkUrl !== '#' && linkUrl !== '') && (
                      <div className="pt-2">
                        <Link href={linkUrl as any} className="inline-flex items-center gap-3 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-colors shadow-sm">
                          {btnText} <ArrowRight size={18} />
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  {block.data?.image_url && (
                    <div className="w-full lg:w-[40%] shrink-0">
                      <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                        <Image 
                          src={sanitizeUrl(block.data.image_url)} 
                          alt={safeString(block.data.title)} 
                          fill
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-cover" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );

          case 'callout':
            const variants = {
              collector_note: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-900', label: 'text-blue-800', icon: <Info size={24} className="text-blue-600" />, title: isEn ? "Collector's Note" : 'Koleksiyoner Notu' },
              warning: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-900', label: 'text-amber-800', icon: <AlertTriangle size={24} className="text-amber-600" />, title: isEn ? 'Warning' : 'Dikkat' },
              market_note: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-900', label: 'text-emerald-800', icon: <TrendingUp size={24} className="text-emerald-600" />, title: isEn ? 'Market Note' : 'Piyasa Notu' },
              fake_warning: { bg: 'bg-red-50', border: 'border-red-600', text: 'text-red-900', label: 'text-red-800', icon: <AlertOctagon size={24} className="text-red-600" />, title: isEn ? 'Fake Product Warning' : 'Sahte Ürün Uyarısı' },
            };
            const v = variants[block.data?.variant as keyof typeof variants] || variants.collector_note;
            return (
              <div key={blockId} className={`w-full ${v.bg} border-l-[6px] ${v.border} rounded-2xl shadow-sm p-6 md:p-8 flex items-start gap-5 my-10`}>
                <div className="shrink-0 mt-1 bg-white p-2 rounded-full shadow-sm border border-slate-200/50">{v.icon}</div>
                <div>
                  <span className={`block text-xs md:text-sm font-black uppercase tracking-widest ${v.label} mb-2`}>{safeString(block.data?.title || v.title)}</span>
                  <p className={`text-lg md:text-xl font-medium leading-relaxed ${v.text}`}>{safeString(block.data?.text || block.content)}</p>
                </div>
              </div>
            );

          case 'cta':
            return (
              <div key={blockId} className="w-full bg-slate-900 text-white rounded-2xl shadow-sm p-6 md:p-8 my-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2 leading-tight">{safeString(block.data?.title || (isEn ? 'Review' : 'İncele'))}</h3>
                  <p className="text-slate-300 font-medium text-lg leading-relaxed">{safeString(block.data?.text || block.content)}</p>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                  <Link href={sanitizeUrl(block.data?.link) as any} className="w-full md:w-auto inline-flex justify-center items-center gap-3 bg-[#D22B2B] hover:bg-red-700 text-white px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-colors shadow-sm">
                    {safeString(block.data?.button_text || (isEn ? 'View Now' : 'Hemen İncele'))} <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            );

          case 'faq':
            if (!block.data?.questions || !Array.isArray(block.data.questions) || block.data.questions.length === 0) return null;
            return (
              <div key={blockId} className="w-full my-10 scroll-mt-28" id="faq">
                <div className="space-y-4">
                  {block.data.questions.map((q: any, i: number) => {
                    if (!q || !q.q) return null;
                    return (
                      <div key={i} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
                        <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-start gap-4">
                          <span className="text-[#D22B2B] font-black shrink-0 text-2xl">{isEn ? 'Q.' : 'S.'}</span> 
                          <span className="leading-snug pt-0.5">{safeString(q.q)}</span>
                        </h4>
                        <p className="text-slate-700 font-medium leading-relaxed pl-9 text-lg">
                          {safeString(q.a)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
            
          case 'image':
            return (
              <figure key={blockId} className="w-full my-10">
                <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                  <Image 
                    src={sanitizeUrl(block.data?.url)} 
                    alt={safeString(block.data?.caption || (isEn ? 'News Image' : 'Haber Görseli'))} 
                    fill
                    sizes="(max-width: 1180px) 100vw, 1180px"
                    className="object-cover" 
                  />
                </div>
                {block.data?.caption && <figcaption className="text-center text-sm md:text-base font-bold text-slate-500 mt-4">{safeString(block.data.caption)}</figcaption>}
              </figure>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
