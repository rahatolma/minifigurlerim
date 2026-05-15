import { getAdminDashboardMetricsDal } from '@/services/action_dal';
import { Package, Users, Database, Box, AlertTriangle, Image as ImageIcon, Link as LinkIcon, Mail, UserPlus } from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboard() {
  const metrics = await getAdminDashboardMetricsDal();

  const totalSeries = metrics.totalSeries || 0;
  const totalFigures = metrics.totalFigures || 0;
  
  const totalMembers = metrics.totalMembers || 0;
  const pendingMembers = metrics.pendingMembers || 0;
  const newMessages = metrics.newMessages || 0;
  const newSubscribers = metrics.newSubscribers || 0;
  
  // Placeholders for future Data Quality Metrics (Phase 4C)
  const missingEnContent = '?';
  const missingImages = '?';
  const missingAffiliate = '?';

  return (
    <div className="w-full max-w-[1600px] mx-auto p-8 md:p-12 pb-24">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-[#111] tracking-tight mb-2">
          Sistem <span className="text-[#D22B2B]">Özeti</span>
        </h1>
        <p className="text-gray-500 font-medium mt-2">Operasyonel sağlık ve veri kalitesi durumu.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        {/* TOTAL SERIES */}
        <div className="bg-white rounded-[24px] p-6 lg:p-8 flex flex-col justify-between border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#D22B2B]/20 transition-all min-h-[180px]">
          <div className="flex items-center justify-between z-10 relative">
             <div className="w-12 h-12 bg-blue-50 text-blue-500 flex items-center justify-center rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
               <Database className="w-6 h-6" strokeWidth={2} />
             </div>
          </div>
          <div className="mt-6 z-10 relative">
             <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-3">TANIMLI SERİLER</p>
             <p className="text-4xl font-black text-gray-900 leading-none">{totalSeries}</p>
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
             <p className="text-4xl font-black text-gray-900 leading-none">{totalFigures}</p>
          </div>
        </div>

        {/* TOTAL MEMBERS */}
        <div className="bg-white rounded-[24px] p-6 lg:p-8 flex flex-col justify-between border border-gray-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-[#D22B2B]/20 transition-all min-h-[180px]">
          <div className="flex items-center justify-between z-10 relative">
             <div className="w-12 h-12 bg-purple-50 text-purple-500 flex items-center justify-center rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
               <Users className="w-6 h-6" strokeWidth={2} />
             </div>
          </div>
          <div className="mt-6 z-10 relative">
             <p className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-3">TOPLAM ÜYE</p>
             <p className="text-4xl font-black text-gray-900 leading-none">{totalMembers}</p>
          </div>
        </div>

        {/* PENDING MEMBERS */}
        <div className="bg-white rounded-[24px] p-6 lg:p-8 flex flex-col justify-between border border-yellow-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-yellow-300 transition-all min-h-[180px]">
          <div className="flex items-center justify-between z-10 relative">
             <div className="w-12 h-12 bg-yellow-50 text-yellow-500 flex items-center justify-center rounded-2xl group-hover:bg-yellow-500 group-hover:text-white transition-colors">
               <UserPlus className="w-6 h-6" strokeWidth={2} />
             </div>
          </div>
          <div className="mt-6 z-10 relative">
             <p className="text-[10px] sm:text-[11px] font-black text-yellow-600 uppercase tracking-widest leading-none mb-3">ONAY BEKLEYEN ÜYE</p>
             <p className="text-4xl font-black text-gray-900 leading-none">{pendingMembers}</p>
          </div>
        </div>

      </div>

      <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Veri Kalitesi & Sağlık (Yakında)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
             <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 leading-none">{missingEnContent}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Eksik İngilizce</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
             <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 leading-none">{missingImages}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Eksik Görsel</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
             <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 leading-none">{missingAffiliate}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Eksik Affiliate</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
             <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 leading-none">{newMessages}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Yeni Mesaj</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
             <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 leading-none">{newSubscribers}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Yeni Abone</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
