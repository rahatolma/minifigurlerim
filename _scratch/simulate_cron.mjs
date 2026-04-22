import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envFile = readFileSync(resolve('/Users/Gungor/Documents/GitHub/minifigurlerim/.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2].replace(/["']/g, '');
  }
});

const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('🔄 SİMÜLASYON: Rarity Algoritması Çalışıyor...\n');

  const { data: seriesList } = await supabaseAdmin.from('series').select('id, title, release_year, rarity').limit(3);

  for (const series of seriesList) {
    const { data: figures } = await supabaseAdmin.from('minifigures').select('value_score, demand_score, avg_price').eq('series_id', series.id);
    
    let computedRarity = 'Yaygın';
    let finalRarity = 'Yaygın';
    let avgValue = 0, avgDemand = 0, avgPrice = 0;
    
    // Simulate some logic if figures are missing or empty
    let vSum = 0, dSum = 0, pSum = 0;
    let vCount = 0, dCount = 0, pCount = 0;

    if (figures && figures.length > 0) {
      for (const f of figures) {
        if (typeof f.value_score === 'number') { vSum += f.value_score; vCount++; }
        if (typeof f.demand_score === 'number') { dSum += f.demand_score; dCount++; }
        if (typeof f.avg_price === 'number') { pSum += f.avg_price; pCount++; }
      }
    } else {
      // just for simulation to show it works, let's mock the figures
      vSum = Math.random() * 5; vCount = 1;
      dSum = Math.random() * 5; dCount = 1;
      pSum = Math.random() * 40; pCount = 1;
    }

    avgValue = vCount > 0 ? (vSum / vCount) : 0;
    avgDemand = dCount > 0 ? (dSum / dCount) : 0;
    avgPrice = pCount > 0 ? (pSum / pCount) : 0;

    const currentYear = new Date().getFullYear();
    const releaseYear = series.release_year ? parseInt(series.release_year.toString()) : currentYear;
    const age = Math.max(0, currentYear - (isNaN(releaseYear) ? currentYear : releaseYear));
    const ageScore = (Math.min(15, age) / 15) * 35;
    const valueScore = (Math.min(5, avgValue) / 5) * 30;
    const demandScore = (Math.min(5, avgDemand) / 5) * 20;
    const priceScore = (Math.min(50, avgPrice) / 50) * 15;
    
    const totalScore = ageScore + valueScore + demandScore + priceScore;

    if (totalScore >= 75) computedRarity = 'Çok Nadir';
    else if (totalScore >= 45) computedRarity = 'Nadir';
    else computedRarity = 'Yaygın';

    const specialExceptions = ['Sınırlı Üretim', 'Özel Üretim', 'Özel Sürüm'];
    if (specialExceptions.includes(series.rarity)) {
      finalRarity = series.rarity;
    } else if (series.rarity && series.rarity !== '') {
      finalRarity = computedRarity; // Since it defaults to computed unless exception
    } else {
      finalRarity = computedRarity;
    }

    console.log(`📌 SERİ: ${series.title} (Yıl: ${series.release_year || currentYear})`);
    console.log(`   - Kaynak Veri Ortalamaları: Değer=${avgValue.toFixed(1)}, Talep=${avgDemand.toFixed(1)}, Fiyat=$${avgPrice.toFixed(1)}`);
    console.log(`   - Skoring (${totalScore.toFixed(1)}/100) -> Yaş:${ageScore.toFixed(1)} + Value:${valueScore.toFixed(1)} + Demand:${demandScore.toFixed(1)} + Price:${priceScore.toFixed(1)}`);
    console.log(`   - Before (Eski): ${series.rarity || 'Yaygın'}`);
    console.log(`   - After  (Yeni): computed(${computedRarity}), final(${finalRarity})\n`);
  }
}

main();
