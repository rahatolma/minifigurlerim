import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Series Rarity Cron Job Started...');

    const { data: seriesList, error: seriesError } = await supabaseAdmin
      .from('series')
      .select('id, title, release_year, manual_rarity');

    if (seriesError) throw seriesError;

    let rawScores = [];
    const currentYear = new Date().getFullYear();

    for (const series of seriesList) {
      const { data: figures } = await supabaseAdmin
        .from('minifigures')
        .select('value_score, demand_score, avg_price')
        .eq('series_id', series.id);

      const figuresLength = figures?.length || 0;
      let totalScore = 0;
      let hasEnoughData = false;

      if (figuresLength > 0) {
        let values = [];
        let demands = [];
        let prices = [];
        let validFigCount = 0;

        for (const f of figures) {
          const hasVal = typeof f.value_score === 'number' && f.value_score > 0;
          const hasDem = typeof f.demand_score === 'number' && f.demand_score > 0;
          const hasPrc = typeof f.avg_price === 'number' && f.avg_price > 0;
          
          if (hasVal) values.push(f.value_score);
          if (hasDem) demands.push(f.demand_score);
          if (hasPrc) prices.push(f.avg_price);

          if (hasVal || hasDem) validFigCount++;
        }

        const requiredValid = Math.min(3, Math.ceil(figuresLength * 0.40));
        if (validFigCount >= requiredValid && figuresLength > 0) {
           hasEnoughData = true;
        }

        if (hasEnoughData) {
          const trimmedAverage = (arr: number[]) => {
            if (arr.length === 0) return 0;
            if (arr.length < 5) return arr.reduce((a,b)=>a+b,0) / arr.length;
            const sorted = [...arr].sort((a,b) => a-b);
            const sliced = sorted.slice(1, -1);
            return sliced.reduce((a,b)=>a+b,0) / sliced.length;
          };

          const avgValue = trimmedAverage(values);
          const avgDemand = trimmedAverage(demands);
          const avgPrice = trimmedAverage(prices);

          const releaseYear = series.release_year ? parseInt(series.release_year.toString()) : currentYear;
          const age = Math.max(0, currentYear - (isNaN(releaseYear) ? currentYear : releaseYear));
          
          const ageScore = (Math.min(15, age) / 15) * 35;
          const valueScore = (Math.min(5, avgValue) / 5) * 30;
          const demandScore = (Math.min(5, avgDemand) / 5) * 20;
          const priceScore = (Math.min(50, avgPrice) / 50) * 15;

          totalScore = valueScore + demandScore + ageScore + priceScore;
        }
      }

      rawScores.push({ series, figuresLength, hasEnoughData, totalScore });
    }

    const validScores = rawScores.filter(s => s.hasEnoughData).map(s => s.totalScore).sort((a, b) => a - b);
    
    let cokNadirThreshold = 80; 
    let nadirThreshold = 45;    
    
    if (validScores.length >= 15) {
      const top10Index = Math.floor(validScores.length * 0.90);
      const top40Index = Math.floor(validScores.length * 0.60);
      cokNadirThreshold = validScores[top10Index];
      nadirThreshold = validScores[top40Index];
    } else if (validScores.length > 0) {
      cokNadirThreshold = 85; 
      nadirThreshold = 45;
    }

    let results = [];
    let metrics = {
       totalEvaluated: seriesList.length,
       skippedDueToData: 0,
       computedSeries: 0,
       updatedInDB: 0
    };
    
    for (const item of rawScores) {
      const { series, totalScore, hasEnoughData } = item;
      
      let computedRarity = null;
      let finalRarity = 'Belirsiz';

      if (hasEnoughData) {
        metrics.computedSeries++;
        if (totalScore >= cokNadirThreshold) {
          computedRarity = 'Çok Nadir';
        } else if (totalScore >= nadirThreshold) {
          computedRarity = 'Nadir';
        } else {
          computedRarity = 'Yaygın';
        }
      } else {
        metrics.skippedDueToData++;
      }

      const specialExceptions = ['Sınırlı Üretim', 'Özel Üretim', 'Özel Sürüm'];
      if (specialExceptions.includes(series.manual_rarity)) {
        finalRarity = series.manual_rarity; 
      } else if (series.manual_rarity && series.manual_rarity !== '') {
        if (hasEnoughData) {
           finalRarity = computedRarity;
        } else {
           finalRarity = series.manual_rarity;
        }
      } else {
        finalRarity = computedRarity || 'Belirsiz';
      }

      await supabaseAdmin
        .from('series')
        .update({
          computed_rarity: computedRarity,
          final_rarity: finalRarity
        })
        .eq('id', series.id);
      
      metrics.updatedInDB++;

      results.push({
        title: series.title,
        totalScore: hasEnoughData ? totalScore : null,
        status: hasEnoughData ? 'COMPUTED' : 'SKIPPED_INSUFFICIENT_DATA',
        computed: computedRarity,
        final: finalRarity
      });
    }

    console.log(`✅ Cron Job Completed: ${metrics.updatedInDB} updated. ${metrics.computedSeries} computed, ${metrics.skippedDueToData} skipped due to low data.`);

    return NextResponse.json({
      success: true,
      metrics,
      distribution: {
        total_valid_scores: validScores.length,
        cok_nadir_threshold: cokNadirThreshold,
        nadir_threshold: nadirThreshold
      },
      sample_results: results.slice(0, 3)
    });

  } catch (error: any) {
    console.error('CRON ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
