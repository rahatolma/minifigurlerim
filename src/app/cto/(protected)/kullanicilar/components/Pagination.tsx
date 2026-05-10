'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ totalCount, limit }: { totalCount: number, limit: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(totalCount / limit);

  if (totalPages <= 1) return null;

  const navigateTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
       <button 
          onClick={() => navigateTo(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
       >
          <ChevronLeft className="w-5 h-5" />
       </button>
       
       <span className="text-sm font-black text-gray-700 px-4">
          Sayfa {currentPage} / {totalPages}
       </span>

       <button 
          onClick={() => navigateTo(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
       >
          <ChevronRight className="w-5 h-5" />
       </button>
    </div>
  );
}
