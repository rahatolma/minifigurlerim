'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AuditFilters({ currentAction, currentTarget }: { currentAction?: string, currentTarget?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [targetId, setTargetId] = useState(currentTarget || '');
  const [action, setAction] = useState(currentAction || 'all');

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    
    if (action && action !== 'all') {
       params.set('action', action);
    } else {
       params.delete('action');
    }

    if (targetId.trim()) {
       params.set('target_user', targetId.trim());
    } else {
       params.delete('target_user');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    setTargetId('');
    setAction('all');
    router.push(pathname);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
       <div className="flex-1 w-full">
           <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">İşlem Türü</label>
           <select 
              value={action} 
              onChange={(e) => setAction(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
           >
               <option value="all">Tümü</option>
               <option value="approve_user">Kullanıcı Onaylama</option>
               <option value="revoke_approval">Onay İptali</option>
               <option value="ban_user">Yasaklama (Ban)</option>
               <option value="unban_user">Yasak Kaldırma (Unban)</option>
               <option value="change_role">Rol Değişimi</option>
           </select>
       </div>
       <div className="flex-1 w-full">
           <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Hedef Kullanıcı ID</label>
           <input 
              type="text" 
              placeholder="UUID girin..." 
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-black"
           />
       </div>
       <div className="flex gap-2 w-full md:w-auto">
           <button onClick={resetFilters} className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors whitespace-nowrap">Temizle</button>
           <button onClick={applyFilters} className="px-6 py-2.5 rounded-lg bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors whitespace-nowrap">Filtrele</button>
       </div>
    </div>
  );
}
