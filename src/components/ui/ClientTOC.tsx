'use client';

import React, { useEffect, useState } from 'react';

interface TOCItem {
  title: string;
  id: string;
}

export default function ClientTOC({ items, locale }: { items: TOCItem[], locale?: string }) {
  const [activeId, setActiveId] = useState<string>('');
  const isEn = locale === 'en';

  useEffect(() => {
    const handleScroll = () => {
      const headingElements = items
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);

      let currentActiveId = '';
      for (const el of headingElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.3 && rect.bottom >= 0) {
          currentActiveId = el.id;
        }
      }

      if (currentActiveId) {
        setActiveId(currentActiveId);
      } else if (headingElements.length > 0 && window.scrollY < 100) {
        setActiveId('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full my-10">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 inline-block min-w-[280px]">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4">{isEn ? 'Table of Contents' : 'İçindekiler'}</h4>
        <ul className="space-y-3 relative before:absolute before:inset-y-0 before:left-[3px] before:w-[2px] before:bg-slate-200">
          {items.map((item, i) => {
            const isActive = activeId === item.id;
            return (
              <li key={i} className="relative z-10 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 transition-colors duration-300 ${isActive ? 'bg-[#D22B2B] ring-4 ring-red-50' : 'bg-slate-300'}`}></div>
                <a 
                  href={`#${item.id}`} 
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`text-sm font-bold transition-colors duration-300 leading-tight ${isActive ? 'text-[#D22B2B]' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {item.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
