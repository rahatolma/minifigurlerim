'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import CustomDropdown from './CustomDropdown';

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

  const currentStatus = searchParams.get('status') || 'have';
  const currentSeries = searchParams.get('series') || 'all';
  const currentRole = searchParams.get('role') || 'all';
  const currentType = searchParams.get('type') || 'all';
  const currentRarity = searchParams.get('rarity') || 'all';
  const t = useTranslations('Collection');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    handleFilterUpdate(name, value);
  };

  const handleFilterUpdate = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'all') {
        if (name === 'status') {
            params.set(name, 'all'); // status için 'all' parametresi silinmesin, URL'ye açıkça yazılsın
        } else {
            params.delete(name);
        }
    } else {
        params.set(name, value);
    }

    router.push(`/koleksiyonum?${params.toString()}` as any, { scroll: false });

    setTimeout(() => {
        const filterSection = document.getElementById('filter-section');
        if (filterSection) {
            const box = filterSection.getBoundingClientRect();
            if (box.top < 65 || box.top > 85) {
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

  const hasFilters = currentStatus !== 'have' || currentSeries !== 'all' || currentRole !== 'all' || currentType !== 'all' || currentRarity !== 'all';

  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="hidden md:flex flex-nowrap md:flex-wrap items-center gap-2 md:gap-3 w-full">

        {/* MASAÜSTÜ: Doğrudan Açılır Kutular */}
        <CustomDropdown 
          name="status"
          options={[
            { value: 'all', label: t('FilterAll') },
            { value: 'have', label: t('FilterHave') },
            { value: 'want', label: t('FilterWant') }
          ]}
          value={currentStatus}
          onChange={(val: string) => handleFilterUpdate('status', val)}
          placeholder={t('FilterStatus')}
          showSearch={false}
        />
        
        <CustomDropdown 
          name="series"
          options={[
            { value: 'all', label: t('FilterSeries') },
            ...seriesList.map(s => ({ value: s.id.toString(), label: s.title }))
          ]}
          value={currentSeries}
          onChange={(val: string) => handleFilterUpdate('series', val)}
          placeholder={t('CompletedSeriesItems')}
          searchPlaceholder={t('SearchSeries')}
          showSearch={true}
          dropdownWidthClass="w-[450px]"
        />
        
        <CustomDropdown 
          name="role"
          options={[
            { value: 'all', label: t('FilterRoles') },
            ...roles.map(r => ({ value: r, label: r }))
          ]}
          value={currentRole}
          onChange={(val: string) => handleFilterUpdate('role', val)}
          placeholder={t('FilterRoleLabel')}
          showSearch={false}
        />
        
        <CustomDropdown 
          name="type"
          options={[
            { value: 'all', label: t('FilterTypes') },
            ...types.map(t => ({ value: t, label: t }))
          ]}
          value={currentType}
          onChange={(val: string) => handleFilterUpdate('type', val)}
          placeholder={t('FilterTypeLabel')}
          showSearch={false}
        />

        <CustomDropdown 
          name="rarity"
          options={[
            { value: 'all', label: t('FilterRarities') },
            ...rarities.map(r => ({ value: r, label: r }))
          ]}
          value={currentRarity}
          onChange={(val: string) => handleFilterUpdate('rarity', val)}
          placeholder={t('FilterRarityLabel')}
          showSearch={false}
        />

        {/* ORTAK: Rozet ve Temizle Butonu */}
        <div className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-center flex-1 shrink-0 md:min-w-max">
           <div className="flex items-center justify-center gap-4 md:gap-6 w-full">
              {/* Rakam */}
              <span className="font-black leading-none -mt-0.5" style={{ color: '#D22B2B', fontSize: '18px' }}>{totalCount}</span> 
              
              {/* Yazı */}
              <span className="text-[10px] md:text-[12px] font-black tracking-[0.15em] text-[#6b7280] mt-0.5 whitespace-nowrap">{t('ListingText')}</span>
              
              {/* Temizle X İkonu */}
              <button onClick={clearFilters} className={`transition-colors flex items-center justify-center shrink-0 ${hasFilters ? 'visible' : 'invisible'}`} style={{ color: '#9ca3af' }} onMouseOver={(e) => e.currentTarget.style.color = '#D22B2B'} onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'} title="{t('Clear')}">
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
              <span className="text-[11px] font-bold text-[#D22B2B] whitespace-nowrap">{totalCount} {t('ListingText')}</span>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 mb-8">
            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black tracking-widest text-[#D22B2B] uppercase">{t('FilterStatus')}</label>
                <select 
                  name="status" 
                  value={currentStatus} 
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 shadow-sm rounded-xl px-4 py-4 text-[14px] font-bold outline-none cursor-pointer text-black"
                >
                  <option value="all">{t('NoFilter')}</option>
                  <option value="have">{t('FilterHave')}</option>
                  <option value="want">{t('FilterWant')}</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black tracking-widest text-[#D22B2B] uppercase">{t('CompletedSeriesItems')}</label>
                <select 
                  name="series" 
                  value={currentSeries} 
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 shadow-sm rounded-xl px-4 py-4 text-[14px] font-bold outline-none cursor-pointer text-black"
                >
                  <option value="all">{t('FilterSeries')}</option>
                  {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black tracking-widest text-[#D22B2B] uppercase">{t('FilterRoleLabel')}</label>
                <select 
                  name="role" 
                  value={currentRole} 
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 shadow-sm rounded-xl px-4 py-4 text-[14px] font-bold outline-none cursor-pointer text-black"
                >
                  <option value="all">{t('FilterRoles')}</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black tracking-widest text-[#D22B2B] uppercase">{t('FilterTypeLabel')}</label>
                <select 
                  name="type" 
                  value={currentType} 
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 shadow-sm rounded-xl px-4 py-4 text-[14px] font-bold outline-none cursor-pointer text-black"
                >
                  <option value="all">{t('FilterTypes')}</option>
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black tracking-widest text-[#D22B2B] uppercase">{t('FilterRarityLabel')}</label>
                <select 
                  name="rarity" 
                  value={currentRarity} 
                  onChange={handleChange}
                  className="w-full border border-gray-200 bg-gray-50 shadow-sm rounded-xl px-4 py-4 text-[14px] font-bold outline-none cursor-pointer text-black"
                >
                  <option value="all">{t('FilterRarities')}</option>
                  {rarities.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
        </div>

        <div className="flex items-center gap-3 w-full pt-4 mt-auto">
            {hasFilters && (
                <button 
                  onClick={() => { clearFilters(); setDrawerOpen(false); }} 
                  className="py-4 px-4 bg-gray-100 font-bold text-gray-700 rounded-xl whitespace-nowrap text-xs uppercase tracking-wider"
                >{t('Clear')}</button>
            )}
            <button 
               onClick={() => setDrawerOpen(false)}
               className="w-full bg-[#1D2136] text-white font-black py-4 px-6 rounded-xl shadow-lg hover:bg-[#131627] tracking-widest uppercase text-xs"
            >{t('Apply')}</button>
        </div>
      </div>
    </>
  );
}
