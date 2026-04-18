import { getAdminDashboardMetricsDal } from '@/services/action_dal';
import { Package, Users, Database, Box, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import DashboardCharts from '@/components/admin/analytics/DashboardCharts';

export const revalidate = 0;

export default async function AdminDashboard() {
  const metrics = await getAdminDashboardMetricsDal();

  const totalSeries = metrics.totalSeries;
  const totalFigures = metrics.totalFigures;
  const totalCollections = metrics.totalCollections;
  const rawCollections = metrics.rawCollections;
  const allFigures = metrics.allFigures;
  const allSeries = metrics.allSeries;

  const figToSeries = new Map(allFigures?.map(f => [f.id, f.series_id]) || []);
  const seriesScores: Record<string, number> = {};

  const timelineMap: Record<string, number> = {};
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    timelineMap[dateStr] = 0;
  }

  let haveCount = 0;
  let wantCount = 0;

  if (rawCollections) {
    rawCollections.forEach(log => {
      if (log.created_at) {
        const d = new Date(log.created_at);
        const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
        if (timelineMap[dateStr] !== undefined) {
          timelineMap[dateStr] += 1;
        }
      }
      if (log.status === 'have') haveCount++;
      if (log.status === 'want') wantCount++;

      if (log.minifigure_id) {
         const sId = figToSeries.get(log.minifigure_id);
         if (sId) seriesScores[sId] = (seriesScores[sId] || 0) + 1;
      }
    });
  }

  // Final dönüştürmeler
  const timelineData = Object.keys(timelineMap).map(key => ({
    date: key,
    count: timelineMap[key]
  }));

  const statusData = [
    { name: 'Bende Var', value: haveCount },
    { name: 'İstiyorum', value: wantCount }
  ];

  const topSeriesData = allSeries
    ?.map(s => ({ ...s, count: seriesScores[s.id] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .filter(s => s.count > 0) || [];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-8 md:p-12 pb-24">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-[#111] tracking-tight mb-2">
          Sistem <span className="text-[#D22B2B]">Özeti</span>
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* TOTAL SERIES */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 flex flex-col justify-between border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 min-h-[180px]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between z-10 relative">
             <div className="w-14 h-14 bg-blue-50 text-blue-600 flex items-center justify-center rounded-[20px] group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
               <Database className="w-6 h-6" strokeWidth={2.5} />
             </div>
          </div>
          <div className="mt-6 z-10 relative">
             <p className="text-[11px] sm:text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-3">TANIMLI SERİLER</p>
             <p className="text-4xl sm:text-5xl font-black text-gray-900 leading-none tracking-tight">{totalSeries || 0}</p>
          </div>
        </div>

        {/* TOTAL FIGURES */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 flex flex-col justify-between border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 min-h-[180px]">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between z-10 relative">
             <div className="w-14 h-14 bg-orange-50 text-orange-500 flex items-center justify-center rounded-[20px] group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-sm">
               <Package className="w-6 h-6" strokeWidth={2.5} />
             </div>
          </div>
          <div className="mt-6 z-10 relative">
             <p className="text-[11px] sm:text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-3">TANIMLI FİGÜRLER</p>
             <p className="text-4xl sm:text-5xl font-black text-gray-900 leading-none tracking-tight">{totalFigures || 0}</p>
          </div>
        </div>

        {/* TOTAL COLLECTIONS */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 flex flex-col justify-between border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 min-h-[180px]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between z-10 relative">
             <div className="w-14 h-14 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-[20px] group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
               <Box className="w-6 h-6" strokeWidth={2.5} />
             </div>
          </div>
          <div className="mt-6 z-10 relative">
             <p className="text-[11px] sm:text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-3">KOLEKSİYON EKLEMELERİ</p>
             <p className="text-4xl sm:text-5xl font-black text-[#D22B2B] leading-none tracking-tight">{totalCollections || 0}</p>
          </div>
        </div>

        {/* ACTIVE USERS (Placeholder/Hit) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 flex flex-col justify-between border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 min-h-[180px]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center justify-between z-10 relative">
             <div className="w-14 h-14 bg-purple-50 text-purple-600 flex items-center justify-center rounded-[20px] group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-sm">
               <Users className="w-6 h-6" strokeWidth={2.5} />
             </div>
          </div>
          <div className="mt-6 z-10 relative">
             <p className="text-[11px] sm:text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-3">SİSTEM DURUMU</p>
             <div className="flex items-center">
               <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2 animate-pulse" />
               <p className="text-4xl sm:text-5xl font-black text-gray-900 leading-none tracking-tight">Aktif</p>
             </div>
          </div>
        </div>

      </div>
      
      <DashboardCharts 
        timelineData={timelineData} 
        statusData={statusData} 
        topSeriesData={topSeriesData}
      />
      
    </div>
  );
}
