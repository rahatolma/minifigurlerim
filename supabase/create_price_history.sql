-- Fiyat Geçmişi Tablosu: (Borsa Grafikleri ve Trend Analizi İçin)
CREATE TABLE IF NOT EXISTS public.minifigure_price_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  minifigure_id uuid REFERENCES public.minifigures(id) ON DELETE CASCADE,
  value_usd numeric(10,2) NOT NULL,
  source_api text DEFAULT 'manual', -- 'rebrickable', 'bricklink', 'manual'
  recorded_at timestamptz DEFAULT now()
);

-- Hızlı analiz için Index atatalım
CREATE INDEX IF NOT EXISTS idx_price_history_minifigure ON public.minifigure_price_history(minifigure_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON public.minifigure_price_history(recorded_at);

-- RLS (Row Level Security) Sadece Sistem ve Admin Yazabilir, Herkes Okuyabilir
ALTER TABLE public.minifigure_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes fiyat geçmişini okuyabilir"
  ON public.minifigure_price_history FOR SELECT
  USING (true);

-- Otomatik Loglama (Trigger Fonksiyonu): 
-- Eğer minifigures tablosunda 'value_usd' değişirse, price_history tablosuna otomatik olarak log atar.
-- Böylece API veya manuel panel üzerinden fiyat değiştirildiğinde arka planda arşiv oluşur.
CREATE OR REPLACE FUNCTION log_minifigure_price_change()
RETURNS trigger AS $$
BEGIN
  -- Eğer value_usd değiştiyse ve boş değilse
  IF NEW.value_usd IS DISTINCT FROM OLD.value_usd AND NEW.value_usd IS NOT NULL THEN
    INSERT INTO public.minifigure_price_history (minifigure_id, value_usd, source_api)
    VALUES (NEW.id, NEW.value_usd, 'system_update');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı tabloya bağlama (Önce varsa sil ki hata vermesin)
DROP TRIGGER IF EXISTS trigger_log_price_change ON public.minifigures;

CREATE TRIGGER trigger_log_price_change
AFTER UPDATE ON public.minifigures
FOR EACH ROW
EXECUTE FUNCTION log_minifigure_price_change();

-- İlk Kurulum: Mevcut tüm figürlerin şu anki fiyatlarını ("0" olmayanları) başlangıç verisi olarak geçmişe yazar
INSERT INTO public.minifigure_price_history (minifigure_id, value_usd, source_api)
SELECT id, value_usd, 'initial_seed'
FROM public.minifigures
WHERE value_usd IS NOT NULL AND value_usd > 0
ON CONFLICT DO NOTHING;
