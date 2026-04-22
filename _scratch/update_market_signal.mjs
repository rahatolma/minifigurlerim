import fs from 'fs';
const path = 'src/app/[locale]/(public)/figurler/[seriesSlug]/[figureSlug]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the Inline demand logic
const inlineLogic = `{(rawFigure.total_views || 0) < 50 ? 'Düşük' : (rawFigure.total_views || 0) < 200 ? 'Stabil' : 'Yükseliyor'}`;

if (content.includes(inlineLogic)) {
  // Add momentum calculation before return
  const calculationLogic = `  // 30 Günlük Momentum Hesaplaması (Market Sinyali İçin)
  const views30d = rawFigure.view_count_30d || 0;
  const col30d = rawFigure.collection_count_30d || 0;
  const fav30d = rawFigure.favorite_count_30d || 0;
  
  // Etkileşim Ağırlığı: Koleksiyon(3x) + İstek(2x) + Görüntüleme(1x)
  const momentumScore = (col30d * 3) + (fav30d * 2) + views30d;
  
  let demandSignal = 'Veri Bekleniyor';
  if (momentumScore > 100 || (rawFigure.demand_score || 0) > 80) demandSignal = 'Güçlü (Sıcak)';
  else if (momentumScore > 30 || (rawFigure.demand_score || 0) > 50) demandSignal = 'Yükseliyor';
  else if (momentumScore > 5) demandSignal = 'Stabil';
  
  // Ana Görseller`;
  
  content = content.replace("  // Ana Görseller", calculationLogic);
  content = content.replace(inlineLogic, "{demandSignal}");
  
  fs.writeFileSync(path, content);
  console.log("Updated market signal logic in page.tsx");
} else {
  console.log("Could not find inline logic to replace.");
}
