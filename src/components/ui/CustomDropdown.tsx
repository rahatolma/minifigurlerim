'use client';

import { useState, useRef, useEffect } from 'react';

export default function CustomDropdown({ 
  name, 
  options, 
  value, 
  onChange, 
  placeholder, 
  searchPlaceholder, 
  showSearch = false,
  dropdownWidthClass = "w-full min-w-[200px]",
  wrapperClass = "flex-1 sm:w-48 shrink-0"
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = showSearch ? options.filter((opt: any) => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  ) : options;

  const selectedOption = options.find((opt: any) => opt.value === value);

  return (
    <div ref={wrapperRef} className={`relative hidden md:block ${wrapperClass}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-200 bg-white shadow-sm rounded-lg px-4 py-3 text-[13px] font-bold outline-none cursor-pointer text-black hover:border-black transition-all flex justify-between items-center group bg-no-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem'
        }}
      >
        <span className="truncate pr-2 select-none">{selectedOption ? selectedOption.label : placeholder}</span>
      </div>

      {isOpen && (
        <div className={`absolute z-[100] mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] overflow-hidden left-0 top-full ${dropdownWidthClass}`}>
           {showSearch && (
             <div className="p-3 border-b border-gray-100 bg-gray-50/80">
               <input
                 autoFocus
                 type="text"
                 className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] font-bold text-gray-900 outline-none focus:border-[#D22B2B] focus:ring-1 focus:ring-[#D22B2B] transition-all placeholder:text-gray-400 placeholder:font-semibold"
                 placeholder={searchPlaceholder || "Ara..."}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
           )}
           <div className="max-h-[280px] overflow-y-auto">
             {filteredOptions.length === 0 ? (
                <div className="px-4 py-6 text-[13px] text-gray-400 text-center font-bold">Sonuç bulunamadı...</div>
             ) : (
                filteredOptions.map((opt: any) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm(''); // Reset search on select
                    }}
                    className={`px-4 py-3 text-[13px] font-bold cursor-pointer transition-colors border-b border-gray-50 last:border-0 truncate ${value === opt.value ? 'bg-[#D22B2B]/10 text-[#D22B2B]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                  >
                    {opt.label}
                  </div>
                ))
             )}
           </div>
        </div>
      )}
    </div>
  );
}
