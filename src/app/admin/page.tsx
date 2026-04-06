import { createClient } from '@/utils/supabase/server';
import { Package, Users, Database, Box, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalSeries },
    { count: totalFigures },
    { count: totalCollections }
  ] = await Promise.all([
    supabase.from('series').select('*', { count: 'exact', head: true }),
    supabase.from('minifigures').select('*', { count: 'exact', head: true }),
    supabase.from('user_collections').select('*', { count: 'exact', head: true })
  ]);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-8 md:p-12 pb-24">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-[#111] tracking-tight mb-2">
          Sistem <span className="text-[#D22B2B]">Özeti</span>
        </h1>
        <p className="text-base font-semibold text-gray-500 uppercase tracking-widest mt-3">
          MINIFIG OS. ENTERPRISE SYSTEM
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* TOTAL SERIES */}
        <div className="bg-white rounded-[24px] p-6 lg:p-8 flex flex-col justify-between border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#D22B2B]/20 transition-all min-h-[180px]">
          <div className="flex items-center justify-between z-10 relative">
             <div className="w-12 h-12 bg-blue-50 text-blue-500 flex items-center justify-center rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
               <Database className="w-6 h-6" strokeWidth={2} />
             </div>
          </div>
          <div className="mt-6 z-10 relative">
             <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-3">TANIMLI SERİLER</p>
             <p className="text-4xl font-black text-gray-900 leading-none">{totalSeries || 0}</p>
          </div>
        </div>

        {/* TOTAL FIGURES */}
        <div className="bg-white rounded-[24px] p-6 lg:p-8 flex flex-col justify-between border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#D22B2B]/20 transition-all min-h-[180px]">
          <div className="flex items-center justify-between z-10 relative">
             <div className="w-12 h-12 bg-orange-50 text-orange-500 flex items-center justify-center rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
               <Package className="w-6 h-6" strokeWidth={2} />
             </div>
          </div>
          <div className="mt-6 z-10 relative">
             <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-3">TANIMLI FİGÜRLER</p>
             <p className="text-4xl font-black text-gray-900 leading-none">{totalFigures || 0}</p>
          </div>
        </div>

        {/* TOTAL COLLECTIONS */}
        <div className="bg-white rounded-[24px] p-6 lg:p-8 flex flex-col justify-between border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#D22B2B]/20 transition-all min-h-[180px]">
          <div className="flex items-center justify-between z-10 relative">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-500 flex items-center justify-center rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
               <Box className="w-6 h-6" strokeWidth={2} />
             </div>
          </div>
          <div className="mt-6 z-10 relative">
             <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-3">KOLEKSİYONLARA EKLENEN</p>
             <p className="text-4xl font-black text-[#D22B2B] leading-none">{totalCollections || 0}</p>
          </div>
        </div>

        {/* ACTIVE USERS (Placeholder/Hit) */}
        <div className="bg-white rounded-[24px] p-6 lg:p-8 flex flex-col justify-between border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#D22B2B]/20 transition-all min-h-[180px]">
          <div className="flex items-center justify-between z-10 relative">
             <div className="w-12 h-12 bg-purple-50 text-purple-500 flex items-center justify-center rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
               <Users className="w-6 h-6" strokeWidth={2} />
             </div>
          </div>
          <div className="mt-6 z-10 relative">
             <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-3">SİSTEM DURUMU</p>
             <p className="text-4xl font-black text-gray-900 leading-none">Aktif</p>
          </div>
        </div>

      </div>
      
      {/* QUICK ACTIONS */}
      <div className="mt-12">
        <h2 className="text-xl font-black text-gray-900 mb-6">Hızlı İşlemler</h2>
        <div className="flex flex-wrap gap-4">
           <Link href="/admin/seriler/yeni" className="flex items-center gap-3 bg-[#111] hover:bg-[#D22B2B] text-white px-6 py-4 rounded-xl transition-all font-bold text-sm">
             <Database className="w-5 h-5" />
             Yeni Seri Tanımla
           </Link>
           <Link href="/admin/figurler/yeni" className="flex items-center gap-3 bg-white border border-gray-200 hover:border-gray-400 text-[#111] px-6 py-4 rounded-xl transition-all font-bold text-sm">
             <Package className="w-5 h-5" />
             Yeni Figür Ekle
           </Link>
           <Link href="/" target="_blank" className="flex items-center gap-3 bg-white border border-gray-200 hover:border-gray-400 text-[#111] px-6 py-4 rounded-xl transition-all font-bold text-sm ml-auto">
             <PlayCircle className="w-5 h-5" />
             Canlı Siteye Git
           </Link>
        </div>
      </div>
      
    </div>
  );
}
