'use client';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function PriceChart({ history }: { history: any[] }) {
  // Veri yoksa veya yetersizse boş durması yerine fallback gösterebiliriz
  if (!history || history.length < 2) {
    return (
      <div className="w-full h-[250px] flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
        <p className="text-gray-400 font-medium text-sm text-center px-4">Bu figür için yeterli borsa geçmişi verisi henüz oluşmadı.<br/>(En az 2 fiyatlandırma kaydı gereklidir)</p>
      </div>
    );
  }

  // Veriyi Recharts formatına dönüştür (Tarihe göre sıralı olmalı)
  const sortedHistory = [...history].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  
  const chartData = sortedHistory.map(record => ({
    name: new Date(record.recorded_at).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
    Fiyat: Number(record.value_usd),
  }));

  return (
    <div className="w-full h-[300px] bg-white rounded-2xl border border-gray-100 shadow-sm p-4 pt-6">
       <h3 className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-6 pl-2">Son 6 Aylık Fiyat Trendi (USD)</h3>
       <div className="w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                 dataKey="name" 
                 tick={{ fill: '#A0AEC0', fontSize: 10, fontWeight: 700 }} 
                 axisLine={false}
                 tickLine={false}
                 dy={10}
              />
              <YAxis 
                 tick={{ fill: '#A0AEC0', fontSize: 10, fontWeight: 700 }} 
                 axisLine={false}
                 tickLine={false}
                 tickFormatter={(value: any) => `$${value}`}
              />
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px' }}
                 itemStyle={{ color: '#D22B2B' }}
                 formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Piyasa Değeri']}
                 labelStyle={{ color: '#A0AEC0', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
              />
              <Line 
                 type="monotone" 
                 dataKey="Fiyat" 
                 stroke="#D22B2B" 
                 strokeWidth={3} 
                 dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                 activeDot={{ r: 6, strokeWidth: 0, fill: '#D22B2B' }}
              />
            </LineChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
}
