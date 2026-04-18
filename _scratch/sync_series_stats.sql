-- BÜTÜN GEÇMİŞ KOLEKSİYON VERİSİNİ PROGRESS TABLOSUNA (CACHE'E) EŞİTLEME SCRİPTİ
-- Bu script'i Supabase SQL editöründe çalıştırarak eski figslerini cache tablosuna indirebilirsin.

INSERT INTO user_series_stats (user_id, series_id, owned_count, total_count, completion_percent)
SELECT 
  uc.user_id,
  m.series_id,
  COUNT(DISTINCT uc.minifigure_id) as owned_count,
  s.total_count,
  ROUND((COUNT(DISTINCT uc.minifigure_id)::numeric / s.total_count::numeric) * 100, 2) as completion_percent
FROM user_collections uc
JOIN minifigures m ON m.id = uc.minifigure_id
JOIN (
  SELECT series_id, COUNT(*) as total_count 
  FROM minifigures 
  GROUP BY series_id
) s ON s.series_id = m.series_id
WHERE uc.status = 'have'
GROUP BY uc.user_id, m.series_id, s.total_count
ON CONFLICT (user_id, series_id) 
DO UPDATE SET 
  owned_count = EXCLUDED.owned_count,
  total_count = EXCLUDED.total_count,
  completion_percent = EXCLUDED.completion_percent;
