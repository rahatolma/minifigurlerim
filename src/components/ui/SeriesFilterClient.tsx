'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SeriesFilterClient({
  categories,
  seriesList,
  totalCount
}: {
  categories: { slug: string, name: string }[];
  seriesList: { slug: string, title: string }[];
  totalCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'newest';
  const currentCategory = searchParams.get('category') || 'all';
  const currentSeries = searchParams.get('series') || 'all';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value === 'all' || (value === 'newest' && name === 'sort')) {
        params.delete(name);
        if (name === 'sort' && value !== 'newest') params.set(name, value);
    } else {
        params.set(name, value);
    }

    router.push(`/seriler?${params.toString()}`, { scroll: false });

    // Sayfa zaten çok aşağıdaysa (örneğin eski sonuçlarda), yeni filtre sonrası tekrar filtre alanına hizala (snap)
    setTimeout(() => {
        const filterSection = document.getElementById('filter-section');
        if (filterSection) {
            const box = filterSection.getBoundingClientRect();
            if (box.top < 130 || box.top > 160) { // Sticky bar is at top-[150px]
                 filterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, 50);
  };

  const clearFilters = () => {
    router.push('/seriler', { scroll: false });
    setTimeout(() => {
        const filterSection = document.getElementById('filter-section');
        if (filterSection) {
             filterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 50);
  };

  const hasFilters = currentCategory !== 'all' || currentSort !== 'newest' || currentSeries !== 'all';

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
        <option value="popular">En Popüler</option>
      </select>

      <select 
        name="series" 
        value={currentSeries} 
        onChange={handleChange}
        className="border border-gray-200 bg-white shadow-sm rounded-lg px-4 py-3 text-[13px] font-bold outline-none sm:w-48 flex-1 cursor-pointer appearance-none text-black focus:ring-2 focus:ring-[#D22B2B] hover:border-black transition-all"
      >
        <option value="all">Seriler</option>
        {seriesList.map(s => <option key={s.slug} value={s.slug}>{s.title}</option>)}
      </select>
      
      <select 
        name="category" 
        value={currentCategory} 
        onChange={handleChange}
        className="border border-gray-200 bg-white shadow-sm rounded-lg px-4 py-3 text-[13px] font-bold outline-none sm:w-48 flex-1 cursor-pointer appearance-none text-black focus:ring-2 focus:ring-[#D22B2B] hover:border-black transition-all"
      >
        <option value="all">Kategori</option>
        {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
      
      {/* 6. Kutucuk: Rozet ve Temizle Butonu (Görseldeki gibi eşit aralıklı ve ince X) */}
      <div className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-center flex-1 shrink-0 min-w-[200px]">
         <div className="flex items-center justify-center gap-5 sm:gap-6 w-full">
            {/* Rakam */}
            <span className="font-black leading-none -mt-0.5" style={{ color: '#D22B2B', fontSize: '18px' }}>{totalCount}</span> 
            
            {/* Yazı */}
            <span className="text-[11px] sm:text-[12px] font-black tracking-[0.15em] text-[#6b7280] mt-0.5 whitespace-nowrap">SERİ LİSTELENİYOR</span>
            
            {/* Temizle X İkonu (Her zaman DOM'da, boşluk kaplaması için gizlenir) */}
            <button onClick={clearFilters} className={`transition-colors flex items-center justify-center shrink-0 ${hasFilters ? 'visible' : 'invisible'}`} style={{ color: '#9ca3af' }} onMouseOver={(e) => e.currentTarget.style.color = '#D22B2B'} onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'} title="Tüm Filtreleri Temizle">
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
         </div>
      </div>
    </div>
  );
}
