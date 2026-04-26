'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface TimelineData {
  date: string;
  count: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface TopSeriesData {
  id: string;
  name: string;
  image_url: string;
  count: number;
}

interface DashboardChartsProps {
  timelineData: TimelineData[];
  statusData: StatusData[];
  topSeriesData?: TopSeriesData[];
}

const COLORS = ['#D22B2B', '#1f2937']; // Red for 'Bende Var', Dark Gray for 'İstiyorum'

export default function DashboardCharts({ timelineData, statusData, topSeriesData = [] }: DashboardChartsProps) {
  // Tooltip bileşeni için özel stil
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl shadow-2xl">
          <p className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">{label}</p>
          <p className="text-white text-lg font-black">
            {payload[0].value} <span className="text-gray-500 text-sm font-semibold">İşlem</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      
      {/* SOL KOLON: 1. Koleksiyon Aktivitesi (Timeline - Area Chart) */}
      <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_40px_rgba(210,43,43,0.08)] transition-all duration-300">
        <div className="mb-8">
          <h3 className="text-gray-900 text-lg font-black tracking-tight">30 Günlük Koleksiyon Aktivitesi</h3>
          <p className="text-gray-400 text-sm font-semibold mt-1">Sisteme eklenen ve istek listesine alınan figür trendleri</p>
        </div>
        
        <div className="w-full h-[300px] lg:h-[450px]">
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D22B2B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D22B2B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#D22B2B" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#D22B2B' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">
                Yeterli veri bulunamadı.
             </div>
          )}
        </div>
      </div>

      {/* SAĞ KOLON: Pie Chart ve Top 5 Listesi */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        
        {/* 2. Koleksiyon Durum Dağılımı (Pie Chart) */}
        <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_40px_rgba(210,43,43,0.08)] transition-all duration-300 flex flex-col">
          <div className="mb-4">
            <h3 className="text-gray-900 text-lg font-black tracking-tight">Kullanıcı Eğilimleri</h3>
            <p className="text-gray-400 text-sm font-semibold mt-1">İstek listesi vs Sahip olunanlar oranı</p>
          </div>
          
          <div className="w-full flex-1 min-h-[220px] relative flex items-center justify-center">
            {statusData.length > 0 && statusData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value: any) => <span className="text-gray-900 font-bold ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <div className="w-16 h-16 rounded-full border-4 border-gray-100 flex items-center justify-center mb-3">
                   <span className="text-2xl font-black text-gray-200">0</span>
                </div>
                <p className="font-bold text-sm">Sistemde henüz koleksiyon kaydı yok.</p>
              </div>
            )}
            
            {/* Pie Chart Merkez Yazısı (Opsiyonel Estetik) */}
            {statusData.length > 0 && statusData.some(d => d.value > 0) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                <div className="text-center">
                  <span className="text-2xl font-black text-gray-900 leading-none">
                    {statusData.reduce((acc, curr) => acc + curr.value, 0)}
                  </span>
                  <span className="text-[10px] text-gray-400 font-black tracking-widest block uppercase mt-1">Toplam</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Top 5 En Çok Eklenen Seriler */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_40px_rgba(210,43,43,0.08)] transition-all duration-300 flex flex-col">
          <div className="mb-5">
            <h3 className="text-gray-900 text-lg font-black tracking-tight">Koleksiyonerlerin Favorileri</h3>
            <p className="text-gray-400 text-sm font-semibold mt-1">Sistemde en çok etkileşim alan ilk 5 seri</p>
          </div>
          
          <div className="flex flex-col gap-4">
            {topSeriesData.length > 0 ? (
              topSeriesData.map((series, index) => (
                <div key={series.id} className="flex items-center gap-3 w-full bg-gray-50/50 p-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-white font-black text-gray-800 flex items-center justify-center text-sm shadow-sm border border-gray-100 shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate" title={series.name}>{series.name}</p>
                    <p className="text-[11px] font-semibold text-gray-400">{series.count} Kez Eklendi</p>
                  </div>
                  {series.image_url && (
                    <img src={series.image_url} alt={series.name} className="w-10 h-10 object-contain drop-shadow-md shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <span className="text-gray-300 text-3xl mb-3">⭐</span>
                <p className="text-sm font-bold text-gray-400">Henüz yeterli veri yok.</p>
                <p className="text-xs text-gray-300 mt-1">Kullanıcılar figür ekledikçe sıralama oluşacak.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>

    </div>
  );
}
