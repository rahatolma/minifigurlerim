'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import CustomDropdown from './CustomDropdown';

export default function NewsFilterClient({
  totalCount
}: {
  totalCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'newest';

  const handleFilterUpdate = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'newest') {
        params.delete('sort');
    } else {
        params.set('sort', value);
    }

    router.push(`/haberler?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/haberler');
  };

  const hasFilters = currentSort !== 'newest';
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="hidden md:grid md:grid-cols-2 gap-5 w-full">
        <div className="w-full h-full flex items-center">
          <CustomDropdown 
            name="sort"
          options={[
            { value: 'newest', label: 'En Yeniler' },
            { value: 'oldest', label: 'En Eskiler' },
            { value: 'popular', label: 'En Popüler' }
          ]}
          value={currentSort}
          onChange={(val: string) => handleFilterUpdate('sort', val)}
          placeholder="Sıralama"
          showSearch={false}
          wrapperClass="w-full h-full flex items-center"
        />
        </div>
        
        {/* ORTAK: Rozet ve Temizle Butonu */}
        <div className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-center w-full h-full">
           <div className="flex items-center justify-center gap-4 md:gap-6 w-full">
              {/* Rakam */}
              <span className="font-black leading-none -mt-0.5" style={{ color: '#D22B2B', fontSize: '18px' }}>{totalCount}</span> 
              
              {/* Yazı */}
              <span className="text-[10px] md:text-[12px] font-black tracking-[0.15em] text-[#6b7280] mt-0.5 whitespace-nowrap">HABER LİSTELENİYOR</span>
              
              {/* Temizle X İkonu */}
              <button 
                onClick={clearFilters} 
                className={`transition-colors flex items-center justify-center shrink-0 ${hasFilters ? 'visible' : 'invisible'}`} 
                style={{ color: '#9ca3af' }} 
                onMouseOver={(e) => e.currentTarget.style.color = '#D22B2B'} 
                onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'} 
                title="Tüm Filtreleri Temizle"
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
                 Filtreler
              </h2>
              <span className="text-[11px] font-bold text-[#D22B2B] whitespace-nowrap">{totalCount} Kayıt Listeleniyor</span>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 mb-8">
            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black tracking-widest text-[#D22B2B] uppercase">Sıralama</label>
                <select 
                  name="sort" 
                  value={currentSort} 
                  onChange={(e) => handleFilterUpdate('sort', e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 shadow-sm rounded-xl px-4 py-4 text-[14px] font-bold outline-none cursor-pointer text-black"
                >
                  <option value="newest">En Yeniler</option>
                  <option value="oldest">En Eskiler</option>
                  <option value="popular">En Popüler</option>
                </select>
            </div>
        </div>

        <div className="flex items-center gap-3 w-full pt-4 mt-auto">
            {hasFilters && (
                <button 
                  onClick={() => { clearFilters(); setDrawerOpen(false); }} 
                  className="py-4 px-4 bg-gray-100 font-bold text-gray-700 rounded-xl whitespace-nowrap text-xs uppercase tracking-wider"
                >
                   Temizle
                </button>
            )}
            <button 
               onClick={() => setDrawerOpen(false)}
               className="w-full bg-[#1D2136] text-white font-black py-4 px-6 rounded-xl shadow-lg hover:bg-[#131627] tracking-widest uppercase text-xs"
            >
               Uygula
            </button>
        </div>
      </div>
    </>
  );
}
