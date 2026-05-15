'use client';

import { useState } from 'react';
import { updateBorsaData } from '@/app/admin/actions/affiliate';

export default function AffiliateRowClient({ 
   figure 
} : { 
   figure: any 
}) {
   const [loading, setLoading] = useState(false);
   const [price, setPrice] = useState(figure.value_usd || 0);
   const [link, setLink] = useState(figure.affiliate_link || '');

   const handleSave = async () => {
       setLoading(true);
       const result = await updateBorsaData(figure.id, Number(price), link || null);
       
       if (result?.error) {
           alert(result.error);
       } else {
           // Başarılı efekti verebiliriz
       }
       setLoading(false);
   };

   return (
       <tr className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors group">
           {/* Figür Bilgileri */}
           <td className="py-4 px-6 relative">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative border border-gray-200">
                    <img src={figure.images?.[0] || 'https://via.placeholder.com/150'} alt="Figür" className="w-full h-full object-contain" />
                 </div>
                 <div>
                    <p className="text-sm font-black text-gray-900 line-clamp-1">{figure.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{figure.series_name} • {figure.figure_no}</p>
                 </div>
              </div>
           </td>

           {/* Fiyat Edit */}
           <td className="py-4 px-6">
              <div className="relative w-32">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold text-sm">$</span>
                 </div>
                 <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-transparent focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100 outline-none rounded-lg text-sm font-bold text-gray-900 transition-all font-mono"
                 />
              </div>
           </td>

           {/* Satın Alma Linki (Affiliate) */}
           <td className="py-4 px-6">
               <input 
                  type="text" 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full xl:w-64 px-3 py-2 bg-gray-50 border border-transparent focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-100 outline-none rounded-lg text-xs font-medium text-gray-700 transition-all placeholder:text-gray-400"
               />
           </td>

           {/* Kaydet Butonu */}
           <td className="py-4 px-6 text-right">
              <button 
                 onClick={handleSave}
                 disabled={loading}
                 className={`py-2 px-5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all shadow-sm flex items-center gap-2 w-max ml-auto ${loading ? 'bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-gray-800'}`}
              >
                  {loading ? '...' : (
                     <>
                        KAYDET
                        <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                     </>
                  )}
              </button>
           </td>
       </tr>
   );
}
