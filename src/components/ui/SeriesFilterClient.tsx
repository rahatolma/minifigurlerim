'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import CustomDropdown from './CustomDropdown';

export default function SeriesFilterClient({
  categories,
  seriesList,
  totalCount
}: {
  categories: { value: string, label: string }[];
  seriesList: { value: string, label: string }[];
  totalCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('SeriesPage');
  const tFilter = useTranslations('SeriesFilter');

  const currentSort = searchParams.get('sort') || 'newest';
  const currentCategory = searchParams.get('category') || 'all';
  const currentSeries = searchParams.get('series') || 'all';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    handleFilterUpdate(name, value);
  };

  const handleFilterUpdate = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'all' || (value === 'newest' && name === 'sort')) {
        params.delete(name);
        if (name === 'sort' && value !== 'newest') params.set(name, value);
    } else {
        params.set(name, value);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    // Sayfa zaten çok aşağıdaysa (örneğin eski sonuçlarda), yeni filtre sonrası tekrar filtre alanına hizala (snap)
    setTimeout(() => {
        const filterSection = document.getElementById('filter-section');
        if (filterSection) {
            const box = filterSection.getBoundingClientRect();
            if (box.top < 65 || box.top > 85) { // Sticky bar is at top-[75px]
                 filterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, 50);
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
    setTimeout(() => {
        const filterSection = document.getElementById('filter-section');
        if (filterSection) {
             filterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 50);
  };

  const hasFilters = currentCategory !== 'all' || currentSort !== 'newest' || currentSeries !== 'all';

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="hidden md:flex flex-nowrap md:flex-wrap items-center gap-2 md:gap-3 w-full">

        {/* MASAÜSTÜ: Doğrudan Açılır Kutular */}
        <CustomDropdown 
          name="sort"
          options={[
            { value: 'newest', label: t('SortNewest') },
            { value: 'oldest', label: t('SortOldest') },
            { value: 'popular', label: t('SortPopular') }
          ]}
          value={currentSort}
          onChange={(val: string) => handleFilterUpdate('sort', val)}
          placeholder={t('SortNewest')}
          showSearch={false}
        />

        <CustomDropdown 
          name="series"
          options={[
            { value: 'all', label: tFilter('AllSeries') },
            ...seriesList
          ]}
          value={currentSeries}
          onChange={(val: string) => handleFilterUpdate('series', val)}
          placeholder={t('BreadcrumbSeries')}
          searchPlaceholder={tFilter('SearchSeries')}
          showSearch={true}
          dropdownWidthClass="w-[450px]"
        />
        
        <CustomDropdown 
          name="category"
          options={[
            { value: 'all', label: tFilter('AllCategories') },
            ...categories
          ]}
          value={currentCategory}
          onChange={(val: string) => handleFilterUpdate('category', val)}
          placeholder={tFilter('Categories')}
          showSearch={false}
        />
        
        {/* ORTAK: Rozet ve Temizle Butonu */}
        <div className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-center flex-1 shrink-0 md:min-w-[200px]">
           <div className="flex items-center justify-center w-full">
              <div className="flex items-baseline gap-0">
                  <span className="font-black leading-none text-[#D22B2B] text-[18px]">{totalCount}</span>
                  {hasFilters && totalCount !== seriesList.length && (
                      <span className="font-black leading-none text-gray-900 text-[18px]">/{seriesList.length}</span>
                  )}
              </div>
              
              <span className="text-[10px] md:text-[12px] font-black tracking-[0.15em] text-[#6b7280] mt-0.5 whitespace-nowrap ml-2">
                  {tFilter('SeriesListed')}
              </span>
              
              {/* Temizle X İkonu (Her zaman DOM'da, boşluk kaplaması için gizlenir) */}
              <button 
                onClick={clearFilters} 
                className={`transition-colors flex items-center justify-center shrink-0 ml-auto ${hasFilters ? 'visible' : 'invisible'}`} 
                style={{ color: '#9ca3af' }} 
                onMouseOver={(e) => e.currentTarget.style.color = '#D22B2B'} 
                onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'} 
                title={tFilter('ClearAllFilters')}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="md:w-[22px] md:h-[22px]">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
           </div>
        </div>
      </div>

      {/* MOBİL: Yüzen Filtre Butonu (FAB) */}
      <button 
        onClick={() => setDrawerOpen(true)}
        className="md:hidden fixed bottom-24 right-5 z-[70] bg-[#D22B2B] text-white shadow-[0_8px_30px_rgba(210,43,43,0.4)] rounded-full w-14 h-14 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        aria-label="Filtrele"
      >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          {hasFilters && <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-white text-[#D22B2B] text-[10px] font-black flex items-center justify-center border-2 border-[#D22B2B]"></span>}
      </button>

      {/* MOBİL: Filtre Çekmecesi (Bottom Sheet) */}
      {drawerOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      
      <div 
        className={`md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white rounded-t-[32px] p-6 shadow-2xl transition-transform duration-300 ease-out transform ${drawerOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col gap-1">
              <h2 className="text-xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                 {t('FilterTitle').split(' ')[0]}
              </h2>
              <span className="text-[11px] font-bold text-[#D22B2B] whitespace-nowrap">{totalCount} {tFilter('RecordsListed')}</span>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 mb-8">
            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black tracking-widest text-[#D22B2B] uppercase">{t('SortTitle')}</label>
                <select 
                  name="sort" 
                  value={currentSort} 
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 shadow-sm rounded-xl px-4 py-4 text-[14px] font-bold outline-none cursor-pointer text-black"
                >
                  <option value="newest">{t('SortNewest')}</option>
                  <option value="oldest">{t('SortOldest')}</option>
                  <option value="popular">{t('SortPopular')}</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black tracking-widest text-[#D22B2B] uppercase">{t('BreadcrumbSeries')}</label>
                <select 
                  name="series" 
                  value={currentSeries} 
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 shadow-sm rounded-xl px-4 py-4 text-[14px] font-bold outline-none cursor-pointer text-black"
                >
                  <option value="all">{t('BreadcrumbSeries')}</option>
                  {seriesList.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black tracking-widest text-[#D22B2B] uppercase">{tFilter('Category')}</label>
                <select 
                  name="category" 
                  value={currentCategory} 
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 shadow-sm rounded-xl px-4 py-4 text-[14px] font-bold outline-none cursor-pointer text-black"
                >
                  <option value="all">{tFilter('AllCategories')}</option>
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>
        </div>

        <div className="flex items-center gap-3 w-full pt-4 mt-auto">
            {hasFilters && (
                <button 
                  onClick={() => { clearFilters(); setDrawerOpen(false); }} 
                  className="py-4 px-4 bg-gray-100 font-bold text-gray-700 rounded-xl whitespace-nowrap text-xs uppercase tracking-wider"
                >
                   {tFilter('Clear')}
                </button>
            )}
            <button 
               onClick={() => setDrawerOpen(false)}
               className="w-full bg-[#1D2136] text-white font-black py-4 px-6 rounded-xl shadow-lg hover:bg-[#131627] tracking-widest uppercase text-xs"
            >
               {tFilter('Apply')}
            </button>
        </div>
      </div>
    </>
  );
}


