'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function VaultFilterClient({
  seriesList,
  roles,
  types,
  rarities,
  totalCount
}: {
  seriesList: any[];
  roles: string[];
  types: string[];
  rarities: string[];
  totalCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') || 'all';
  const currentSeries = searchParams.get('series') || 'all';
  const currentRole = searchParams.get('role') || 'all';
  const currentType = searchParams.get('type') || 'all';
  const currentRarity = searchParams.get('rarity') || 'all';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'all') {
        params.delete(name);
    } else {
        params.set(name, value);
    }

    router.push(`/koleksiyonum?${params.toString()}`, { scroll: false });

    setTimeout(() => {
        const filterSection = document.getElementById('filter-section');
        if (filterSection) {
            const box = filterSection.getBoundingClientRect();
            if (box.top < 120 || box.top > 140) {
                 filterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, 50);
  };

  const clearFilters = () => {
    router.push('/koleksiyonum', { scroll: false });
    setTimeout(() => {
        const filterSection = document.getElementById('filter-section');
        if (filterSection) {
             filterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 50);
  };

  const hasFilters = currentStatus !== 'all' || currentSeries !== 'all' || currentRole !== 'all' || currentType !== 'all' || currentRarity !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      <select 
        name="status" 
        value={currentStatus} 
        onChange={handleChange}
        className="border border-gray-200 rounded-lg px-4 py-3 text-[13px] font-bold outline-none sm:w-48 flex-1 bg-white cursor-pointer appearance-none text-black focus:ring-2 focus:ring-[#D22B2B] hover:border-black transition-all"
      >
        <option value="all">Koleksiyon Filtresi</option>
        <option value="have">Kasamda Olanlar</option>
        <option value="want">Takip Ettiklerim</option>
      </select>
      
      <select 
        name="series" 
        value={currentSeries} 
        onChange={handleChange}
        className="border border-gray-200 rounded-lg px-4 py-3 text-[13px] font-bold outline-none sm:w-48 flex-1 bg-white cursor-pointer appearance-none text-black focus:ring-2 focus:ring-[#D22B2B] hover:border-black transition-all"
      >
        <option value="all">Tüm Seriler</option>
        {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
      </select>
      
      <select 
        name="role" 
        value={currentRole} 
        onChange={handleChange}
        className="border border-gray-200 rounded-lg px-4 py-3 text-[13px] font-bold outline-none sm:w-40 flex-1 bg-white cursor-pointer appearance-none text-black focus:ring-2 focus:ring-[#D22B2B] hover:border-black transition-all"
      >
        <option value="all">Figür Rolü</option>
        {roles.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      
      <select 
        name="type" 
        value={currentType} 
        onChange={handleChange}
        className="border border-gray-200 rounded-lg px-4 py-3 text-[13px] font-bold outline-none sm:w-40 flex-1 bg-white cursor-pointer appearance-none text-black focus:ring-2 focus:ring-[#D22B2B] hover:border-black transition-all"
      >
        <option value="all">Figür Tipi</option>
        {types.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <select 
        name="rarity" 
        value={currentRarity} 
        onChange={handleChange}
        className="border border-gray-200 rounded-lg px-4 py-3 text-[13px] font-bold outline-none sm:w-40 flex-1 bg-white cursor-pointer appearance-none text-black focus:ring-2 focus:ring-[#D22B2B] hover:border-black transition-all"
      >
        <option value="all">Nadirlik</option>
        {rarities.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      
      {/* 6. Kutucuk: Rozet ve Temizle Butonu (Görseldeki gibi eşit aralıklı ve ince X) */}
      <div className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-center flex-1 shrink-0 min-w-max">
         <div className="flex items-center justify-center gap-5 sm:gap-6 w-full">
            {/* Rakam */}
            <span className="font-black leading-none -mt-0.5" style={{ color: '#D22B2B', fontSize: '18px' }}>{totalCount}</span> 
            
            {/* Yazı */}
            <span className="text-[11px] sm:text-[12px] font-black tracking-[0.15em] text-[#6b7280] mt-0.5 whitespace-nowrap">FİGÜR LİSTELENİYOR</span>
            
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
