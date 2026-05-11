import React from 'react';
import RichTextContent from './RichTextContent';
import { Link } from '@/i18n/routing';

interface BlogBlockRendererProps {
  content: string | any[] | null;
}

export default function BlogBlockRenderer({ content }: BlogBlockRendererProps) {
  if (!content) return null;

  let blocks: any[] = [];

  // Parse structured content
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        blocks = parsed;
      } else {
        // Not an array JSON, fallback to rich text
        return <RichTextContent html={content} className="prose-lg prose-red text-gray-800 font-medium leading-loose" />;
      }
    } catch (e) {
      // Not a valid JSON, meaning it's likely a legacy HTML string. Fallback to RichText.
      return <RichTextContent html={content} className="prose-lg prose-red text-gray-800 font-medium leading-loose" />;
    }
  } else if (Array.isArray(content)) {
    blocks = content;
  } else {
    // Unknown format
    return null;
  }

  if (blocks.length === 0) return null;

  // If first element doesn't have a type, maybe it's not our block format
  if (!blocks[0]?.type) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {blocks.map((block, idx) => {
        if (!block || typeof block !== 'object') return null;

        switch (block.type) {
          case 'intro':
            return (
              <p key={idx} className="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed border-l-4 border-[#D22B2B] pl-6 mb-4">
                {block.content}
              </p>
            );

          case 'text':
            return (
              <div key={idx} className="w-full">
                <RichTextContent html={block.content || ''} className="prose-lg prose-red text-gray-800 leading-loose" />
              </div>
            );

          case 'heading':
            const level = block.data?.level || 2;
            const Tag = `h${level}` as any;
            return (
              <Tag key={idx} id={block.data?.id} className={`font-black text-gray-900 tracking-tight mt-6 mb-2 ${level === 2 ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}>
                {block.content}
              </Tag>
            );

          case 'callout':
            const isWarning = block.data?.variant === 'warning';
            return (
              <div key={idx} className={`p-6 md:p-8 rounded-2xl border-l-4 my-4 ${isWarning ? 'bg-amber-50 border-amber-500' : 'bg-gray-50 border-gray-900'}`}>
                {block.data?.title && (
                  <h4 className={`font-bold mb-3 text-lg ${isWarning ? 'text-amber-900' : 'text-gray-900'}`}>
                    {block.data.title}
                  </h4>
                )}
                <p className={`text-base leading-relaxed ${isWarning ? 'text-amber-800' : 'text-gray-700'}`}>
                  {block.data?.text || block.content}
                </p>
              </div>
            );

          case 'toc':
            if (!block.data?.items || !Array.isArray(block.data.items)) return null;
            return (
              <div key={idx} className="bg-gray-50 p-6 md:p-8 rounded-3xl my-6 border border-gray-100">
                <h3 className="font-black text-xl mb-6 text-gray-900">İçindekiler</h3>
                <ul className="flex flex-col gap-4">
                  {block.data.items.map((item: any, i: number) => (
                    <li key={i}>
                      <a href={`#${item.id}`} className="text-gray-600 hover:text-[#D22B2B] font-medium transition-colors flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D22B2B] opacity-50 shrink-0"></span>
                        <span>{item.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );

          case 'methodology':
            return (
              <div key={idx} className="bg-blue-50/40 p-6 rounded-2xl border border-blue-100 my-6">
                <h4 className="font-bold text-blue-900 mb-2 text-sm uppercase tracking-widest">Metodoloji</h4>
                <p className="text-blue-800 text-sm leading-relaxed">{block.content}</p>
              </div>
            );

          case 'cta':
            return (
              <div key={idx} className="bg-gray-900 p-8 md:p-12 rounded-3xl my-8 flex flex-col items-center text-center shadow-2xl">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">{block.data?.title}</h3>
                <p className="text-gray-400 mb-8 max-w-2xl text-lg">{block.data?.text}</p>
                {block.data?.link && (
                  <Link href={block.data.link as any} className="bg-[#D22B2B] hover:bg-red-700 text-white font-black px-8 py-4 rounded-xl transition-all uppercase tracking-widest text-sm shadow-[0_4px_20px_rgba(210,43,43,0.4)] hover:-translate-y-1">
                    {block.data?.button_text || 'Keşfet'}
                  </Link>
                )}
              </div>
            );

          case 'faq':
            if (!block.data?.questions || !Array.isArray(block.data.questions)) return null;
            return (
              <div key={idx} className="my-8 flex flex-col gap-4">
                {block.data.questions.map((q: any, i: number) => (
                  <div key={i} className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-lg text-gray-900 mb-3">{q.q}</h4>
                    <p className="text-gray-600 leading-relaxed">{q.a}</p>
                  </div>
                ))}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
