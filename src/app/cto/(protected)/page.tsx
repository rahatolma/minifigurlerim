import { getAdminDashboardMetricsDal } from '@/services/action_dal';
import { 
  getTopViewedFigures, 
  getMostAddedToCollection, 
  getMarketplaceClicks, 
  getFunnelStats 
} from '@/services/analytics';
import { Package, Database, CheckCircle2, Eye, PlusCircle, ShoppingCart, Activity, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

export const revalidate = 0;

export default async function AdminDashboard() {
  // 1. Fetch Legacy System Metrics
  const metrics = await getAdminDashboardMetricsDal();
  const totalSeries = metrics.totalSeries || 0;
  const totalFigures = metrics.totalFigures || 0;

  const allFigures = metrics.allFigures || [];
  const figToName = new Map(allFigures.map((f: any) => [f.slug_tr, f.figure_name || f.name || f.slug_tr]));

  // 2. Fetch Product Insight Metrics from PostHog (7 Days)
  const topViewed = await getTopViewedFigures(7, 10);
  const mostAdded = await getMostAddedToCollection(7, 10);
  const marketplaceClicks = await getMarketplaceClicks(7, 10);
  const funnelStats = await getFunnelStats(7);

  // 3. Process Funnel & KPI Data
  const viewCount = funnelStats.find((f: any) => f.event === 'view_figure')?.total_count || 0;
  const addCount = funnelStats.find((f: any) => f.event === 'add_to_collection')?.total_count || 0;
  const clickCount = funnelStats.find((f: any) => f.event === 'click_marketplace')?.total_count || 0;

  const conversionRate = viewCount > 0 ? ((addCount / viewCount) * 100).toFixed(1) : '0.0';
  const marketConversion = addCount > 0 ? ((clickCount / addCount) * 100).toFixed(1) : '0.0';

  // Helper for max view to render CSS bars
  const maxViewCount = topViewed.length > 0 ? Math.max(...topViewed.map((v: any) => v.view_count)) : 1;
  const maxMarketClick = marketplaceClicks.length > 0 ? Math.max(...marketplaceClicks.map((m: any) => m.click_count)) : 1;

  // 4. Insight Engine (Karar Motoru)
  const generateInsight = () => {
    if (viewCount === 0) {
      return {
        title: "Veri Akışı Bekleniyor",
        message: "Son 7 günde henüz etkileşim oluşmadı. İlk veriler geldikçe burada stratejik trendleri göreceksin. Dilersen platformda gezerek test verisi oluşturabilirsin.",
        type: "neutral",
        icon: <Activity className="w-6 h-6 text-gray-500" />
      };
    }
    
    if (viewCount > 0 && addCount === 0) {
      return {
        title: "Trafik Var, Sahiplenme Yok",
        message: `Son 7 günde ${viewCount} inceleme yapıldı ancak koleksiyona ekleme oranı %0. Kullanıcıları aksiyona teşvik edecek "Ekle" butonlarını belirginleştirmeliyiz.`,
        type: "warning",
        icon: <AlertCircle className="w-6 h-6 text-orange-500" />
      };
    }

    if (addCount > 0 && clickCount === 0) {
      return {
        title: "İlgi Yüksek, Gelir Dönüşümü Eksik",
        message: `Kullanıcılar figürleri severek sahipleniyor (${addCount} ekleme) ancak pazaryeri butonlarına tıkla(ya)mıyor. Satın alma yönlendirmeleri gözden geçirilmeli.`,
        type: "warning",
        icon: <AlertCircle className="w-6 h-6 text-orange-500" />
      };
    }

    if (parseFloat(conversionRate) > 15 && parseFloat(marketConversion) > 10) {
      return {
        title: "Sistem Kusursuz İşliyor",
        message: `Kullanıcı yolculuğu çok sağlıklı! Görüntülemelerin %${conversionRate}'si koleksiyona, eklemelerin ise %${marketConversion}'si pazaryeri aksiyonuna (gelire) dönüşüyor.`,
        type: "success",
        icon: <Sparkles className="w-6 h-6 text-emerald-500" />
      };
    }

    return {
      title: "Standart Etkileşim İzleniyor",
      message: `Kullanıcılar platformu inceliyor. Görüntülemelerin %${conversionRate}'si koleksiyona dönüşürken, eklemelerin %${marketConversion}'si pazaryerine gidiyor.`,
      type: "neutral",
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />
    };
  };

  const insight = generateInsight();

  // Render Functions for Empty States
  const renderEmptyState = (message: string, compact = false) => (
    <div className={`${compact ? 'py-4' : 'py-8'} flex flex-col items-center justify-center text-center w-full`}>
      {!compact && (
        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-3">
          <Activity className="w-4 h-4 text-gray-300" />
        </div>
      )}
      <p className="text-xs font-semibold text-gray-400 max-w-[200px] leading-relaxed">{message}</p>
    </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto p-8 md:p-12 pb-24">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-[#111] tracking-tight mb-2">
          Ürün <span className="text-[#D22B2B]">Davranışı</span>
        </h1>
        <p className="text-gray-500 font-semibold text-sm">Son 7 günün kullanıcı analizleri ve dönüşüm oranları</p>
      </div>

      {/* 0) INSIGHT LAYER (Karar Motoru Yorumu) */}
      <div className={`mb-8 p-6 rounded-[28px] border bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex gap-5 items-center
        ${insight.type === 'warning' ? 'border-orange-100' : insight.type === 'success' ? 'border-emerald-100' : 'border-gray-100'}
      `}>
        <div className={`w-14 h-14 shrink-0 rounded-[20px] flex items-center justify-center
          ${insight.type === 'warning' ? 'bg-orange-50' : insight.type === 'success' ? 'bg-emerald-50' : 'bg-gray-50'}
        `}>
          {insight.icon}
        </div>
        <div>
          <h3 className="text-gray-900 font-black text-lg tracking-tight mb-1">{insight.title}</h3>
          <p className="text-gray-500 font-semibold text-sm">{insight.message}</p>
        </div>
      </div>
      
      {/* 1) ÜST KPI SATIRI (4 Kart) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI: Görüntüleme */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 flex flex-col border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[16px] flex items-center justify-center">
              <Eye className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">TOPLAM GÖRÜNTÜLEME</p>
          <p className="text-4xl font-black text-gray-900 tracking-tight">{viewCount > 0 ? viewCount : '—'}</p>
        </div>

        {/* KPI: Koleksiyona Ekleme */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 flex flex-col border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-[16px] flex items-center justify-center">
              <PlusCircle className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">KOLEKSİYONA EKLEME</p>
          <p className="text-4xl font-black text-gray-900 tracking-tight">{addCount > 0 ? addCount : '—'}</p>
        </div>

        {/* KPI: Pazaryeri Tıklama */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 flex flex-col border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-[16px] flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">PAZARYERİ TIKLAMASI</p>
          <p className="text-4xl font-black text-gray-900 tracking-tight">{clickCount > 0 ? clickCount : '—'}</p>
        </div>

        {/* KPI: Dönüşüm Oranı */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 flex flex-col border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D22B2B]/5 to-transparent opacity-100" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 bg-[#D22B2B]/10 text-[#D22B2B] rounded-[16px] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 relative z-10">GENEL DÖNÜŞÜM ORANI</p>
          <div className="flex items-baseline gap-2 relative z-10">
            <p className="text-4xl font-black text-[#D22B2B] tracking-tight">{viewCount > 0 ? `%${conversionRate}` : '—'}</p>
          </div>
        </div>
      </div>


      {/* 2 & 3 & 4) ANA BLOKLAR (Grid 3 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* SOL: En Çok Görüntülenen Figürler */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-gray-900 text-xl font-black tracking-tight">En Çok Görüntülenen Figürler</h3>
              <p className="text-gray-400 text-sm font-semibold mt-1">Hangi figürler kullanıcıların ilgisini daha çok çekiyor?</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {topViewed.length > 0 ? (
              topViewed.map((fig: any, idx: number) => {
                const percentage = Math.max(5, (fig.view_count / maxViewCount) * 100);
                return (
                  <div key={fig.figure_slug} className="flex items-center gap-4">
                    <div className="w-6 h-6 shrink-0 rounded-md bg-gray-100 text-gray-500 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-bold text-gray-800 truncate" title={figToName.get(fig.figure_slug) || fig.figure_slug}>
                          {figToName.get(fig.figure_slug) || fig.figure_slug}
                        </span>
                        <span className="text-sm font-black text-gray-900">{fig.view_count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-2.5 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : renderEmptyState("Kullanıcılar figürleri inceledikçe liste şekillenecek. Test için vitrindeki figürlere tıklayabilirsin.")}
          </div>
        </div>

        {/* SAĞ: İki Küçük Blok Alt Alta */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* SAĞ ÜST: En Çok Eklenenler */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex-1">
            <h3 className="text-gray-900 text-xl font-black tracking-tight mb-1">En Çok Sahiplenilenler</h3>
            <p className="text-gray-400 text-sm font-semibold mb-6">Koleksiyona eklenen favoriler</p>
            
            <div className="flex flex-col gap-3">
              {mostAdded.length > 0 ? (
                mostAdded.map((fig: any, idx: number) => (
                  <div key={fig.figure_slug} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-gray-300 font-bold text-xs">#{idx + 1}</span>
                      <span className="text-sm font-bold text-gray-800 truncate" title={figToName.get(fig.figure_slug) || fig.figure_slug}>{figToName.get(fig.figure_slug) || fig.figure_slug}</span>
                    </div>
                    <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                      +{fig.add_count}
                    </span>
                  </div>
                ))
              ) : renderEmptyState("Eklemeler başladıkça en popüler figürler burada belirecek.", true)}
            </div>
          </div>

          {/* SAĞ ALT: Pazaryeri Tıklamaları */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[28px] p-6 lg:p-8 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <h3 className="text-gray-900 text-xl font-black tracking-tight mb-1">Pazaryeri Dağılımı</h3>
            <p className="text-gray-400 text-sm font-semibold mb-6">Gelir potansiyeli nereden geliyor?</p>
            
            <div className="flex flex-col gap-4">
              {marketplaceClicks.length > 0 ? (
                marketplaceClicks.map((market: any, idx: number) => {
                   const mPercent = Math.max(5, (market.click_count / maxMarketClick) * 100);
                   const isAmazon = market.marketplace.toLowerCase().includes('amazon');
                   const isTrendyol = market.marketplace.toLowerCase().includes('trendyol');
                   const colorClass = isAmazon ? 'bg-orange-500' : isTrendyol ? 'bg-orange-600' : 'bg-gray-800';
                   return (
                    <div key={market.marketplace} className="flex flex-col">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-gray-800 capitalize">{market.marketplace.replace('_', ' ')}</span>
                        <span className="font-black text-gray-900">{market.click_count} <span className="text-xs text-gray-400 font-semibold">Tık</span></span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${mPercent}%` }} />
                      </div>
                    </div>
                   );
                })
              ) : renderEmptyState("Kullanıcılar fiyat linklerine tıkladığında pasta dağılımı oluşacak.", true)}
            </div>
          </div>

        </div>
      </div>

      {/* 5) ALT GENİŞ BLOK: Dönüşüm Hunisi (Funnel) */}
      <div className="w-full bg-[#111] rounded-[28px] p-8 lg:p-12 shadow-2xl mb-12 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#D22B2B]/10 to-transparent pointer-events-none" />
        
        <div className="mb-8">
          <h3 className="text-white text-2xl font-black tracking-tight">Dönüşüm Hunisi (Funnel)</h3>
          <p className="text-gray-400 text-sm font-semibold mt-1">İlgiden Satın Almaya: Kullanıcı yolculuğundaki kayıp noktaları</p>
        </div>

        <div className="relative">
          {/* Funnel Skeleton (Rendered even if empty, passive if viewCount == 0) */}
          <div className={`flex flex-col md:flex-row gap-4 items-center justify-between relative z-10 ${viewCount === 0 ? 'opacity-30 grayscale pointer-events-none blur-[1px]' : ''}`}>
            {/* Step 1: Görüntüleme */}
            <div className="flex-1 w-full bg-white/10 rounded-2xl p-6 border border-white/5 backdrop-blur-md">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Adım 1</p>
              <p className="text-white font-black text-lg mb-4">Figür İnceleme</p>
              <p className="text-4xl font-black text-white">{viewCount > 0 ? viewCount : '—'}</p>
            </div>
            
            {/* Arrow & Conversion 1 */}
            <div className="flex flex-col items-center shrink-0 w-24">
              <div className="text-[#D22B2B] font-black text-xl mb-1">%{conversionRate}</div>
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#D22B2B] to-transparent" />
            </div>

            {/* Step 2: Koleksiyona Ekleme */}
            <div className="flex-1 w-full bg-white/10 rounded-2xl p-6 border border-white/5 backdrop-blur-md">
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">Adım 2</p>
              <p className="text-white font-black text-lg mb-4">Koleksiyona Ekleme</p>
              <p className="text-4xl font-black text-white">{viewCount > 0 ? addCount : '—'}</p>
              {viewCount > 0 && <p className="text-xs text-red-400 font-bold mt-2">Kayıp: %{(100 - parseFloat(conversionRate)).toFixed(1)}</p>}
            </div>

            {/* Arrow & Conversion 2 */}
            <div className="flex flex-col items-center shrink-0 w-24">
              <div className="text-emerald-400 font-black text-xl mb-1">%{marketConversion}</div>
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            </div>

            {/* Step 3: Pazaryeri */}
            <div className="flex-1 w-full bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/20 backdrop-blur-md">
              <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest mb-1">Adım 3 (Hedef)</p>
              <p className="text-emerald-400 font-black text-lg mb-4">Pazaryerine Gidiş</p>
              <p className="text-4xl font-black text-emerald-400">{viewCount > 0 ? clickCount : '—'}</p>
              {addCount > 0 && <p className="text-xs text-red-400 font-bold mt-2">Kayıp: %{(100 - parseFloat(marketConversion)).toFixed(1)}</p>}
            </div>
          </div>

          {/* Empty State Overlay */}
          {viewCount === 0 && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="bg-[#1a1a1a]/80 backdrop-blur-sm border border-white/5 px-4 py-3 rounded-xl flex items-center gap-3">
                <Activity className="w-4 h-4 text-gray-400" />
                <p className="text-gray-300 font-semibold text-xs">Yolculuk akışı veriler biriktikçe şekillenecek</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6) SECONDARY BLOK: Sistem Durumu */}
      <div className="pt-8 border-t border-gray-100 flex flex-wrap gap-8 items-center justify-between">
        <div>
          <h4 className="text-gray-900 font-black tracking-tight text-lg">Sistem Durumu</h4>
          <p className="text-gray-400 text-xs font-semibold mt-1">Veritabanındaki yapısal metrikler</p>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 font-bold text-sm">Seriler:</span>
            <span className="text-gray-900 font-black">{totalSeries}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 font-bold text-sm">Figürler:</span>
            <span className="text-gray-900 font-black">{totalFigures}</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 font-bold text-sm tracking-tight">Sistem Aktif</span>
          </div>
        </div>
      </div>


    </div>
  );
}
