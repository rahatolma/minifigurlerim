'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function NewsFilterClient({
  totalCount
}: {
  totalCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'newest';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
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

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      <select 
        name="sort" 
        value={currentSort} 
        onChange={handleChange}
        className="border border-gray-200 bg-white shadow-sm rounded-lg px-4 py-3 text-[13px] font-bold outline-none sm:w-48 flex-1 cursor-pointer appearance-none text-black focus:ring-2 focus:ring-[#D22B2B] hover:border-black transition-all"
      >
        <option value="newest">En Yeniler</option>
        <option value="oldest">En Eskiler</option>
        <option value="popular">En Çok Okunanlar</option>
      </select>
      
      {/* 6. Kutucuk: Rozet ve Temizle Butonu (Görseldeki gibi eşit aralıklı ve ince X) */}
      <div className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-center flex-1 shrink-0 min-w-[200px]">
         <div className="flex items-center justify-center gap-5 sm:gap-6 w-full">
            {/* Rakam */}
            <span className="font-black leading-none -mt-0.5" style={{ color: '#D22B2B', fontSize: '18px' }}>{totalCount}</span> 
            
            {/* Yazı */}
            <span className="text-[11px] sm:text-[12px] font-black tracking-[0.15em] text-[#6b7280] mt-0.5 whitespace-nowrap">HABER LİSTELENİYOR</span>
            
            {/* Temizle X İkonu (Her zaman DOM'da, boşluk kaplaması için gizlenir) */}
            <button onClick={clearFilters} className={`transition-colors flex items-center justify-center shrink-0 ${hasFilters ? 'visible' : 'invisible'}`} style={{ color: '#9ca3af' }} onMouseOver={(e) => e.currentTarget.style.color = '#D22B2B'} onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'} title="Filtreleri Temizle">
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
         </div>
      </div>
    </div>
  );
}
