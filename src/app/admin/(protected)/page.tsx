import { createClient } from '@/utils/supabase/server';
import { Package, Users, Database, Box, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import DashboardCharts from '@/components/admin/analytics/DashboardCharts';

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

  // -- ANALYTICS VERİ DERLEMESİ (Son 30 Gün) --
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // 1. Raw veriyi çekiyoruz (Sadece son 30 gün timeline için, ancak top 5 için tüm zamanları çekebiliriz veya son 30 günü kullanabiliriz. Şimdilik son 30 günü kullanalım)
  const { data: rawCollections } = await supabase
    .from('user_collections')
    .select('created_at, status, minifigure_id')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .limit(5000);

  // TOP 5 SERİLER İÇİN HARİTALAMA VERİSİ
  const [ { data: allFigures }, { data: allSeries } ] = await Promise.all([
    supabase.from('minifigures').select('id, series_id'),
    supabase.from('series').select('id, name, image_url')
  ]);

  const figToSeries = new Map(allFigures?.map(f => [f.id, f.series_id]) || []);
  const seriesScores: Record<string, number> = {};

  // 2. Timeline Aggregation (Gün bazlı gruplama)
  const timelineMap: Record<string, number> = {};
  
  // Son 30 günü sıfır data ile dolduralım (çizgi kopuk olmasın)
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    timelineMap[dateStr] = 0;
  }

  // 3. Status Aggregation (Bende Var vs İstiyorum)
  let haveCount = 0;
  let wantCount = 0;

  if (rawCollections) {
    rawCollections.forEach(log => {
      // Timeline için
      if (log.created_at) {
        const d = new Date(log.created_at);
        const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
        if (timelineMap[dateStr] !== undefined) {
          timelineMap[dateStr] += 1;
        }
      }
      // Status oranı için
      if (log.status === 'have') haveCount++;
      if (log.status === 'want') wantCount++;

      // Top 5 Seriler için puanlama
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
      
      <DashboardCharts 
        timelineData={timelineData} 
        statusData={statusData} 
        topSeriesData={topSeriesData}
      />
      
    </div>
  );
}
