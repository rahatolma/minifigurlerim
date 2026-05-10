'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function UserAdminFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('statusFilter') || 'all');

  const applyFilters = (newSearch?: string, newStatus?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSearch !== undefined) {
      if (newSearch) params.set('search', newSearch);
      else params.delete('search');
    }
    
    if (newStatus !== undefined) {
      if (newStatus && newStatus !== 'all') params.set('statusFilter', newStatus);
      else params.delete('statusFilter');
    }

    params.set('page', '1'); // Reset to first page on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchTerm, undefined);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="flex-1 relative">
        <input 
          type="text" 
          placeholder="Kullanıcı adı veya e-posta ara..." 
          className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
      </form>
      
      <select 
        value={status}
        onChange={(e) => {
           setStatus(e.target.value);
           applyFilters(undefined, e.target.value);
        }}
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:border-red-500 transition-all shadow-sm w-full sm:w-48 appearance-none cursor-pointer"
      >
        <option value="all">Tüm Durumlar</option>
        <option value="active">Aktif (Onaylı)</option>
        <option value="pending">İnceleme Bekliyor</option>
        <option value="banned">Yasaklı</option>
        <option value="suspended">Askıya Alınmış</option>
      </select>
    </div>
  );
}
