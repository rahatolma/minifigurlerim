-- Filtre Kolonları Üzerindeki Yavaşlamaları Engellemek İçin İndeks Katmanı
-- Bu indeksler Pagination (Load More) arayüzündeki sorguların veri büyüdüğünde dahi milisaniyelik sürede dönmesini garantiler.
CREATE INDEX IF NOT EXISTS idx_minifigures_role ON public.minifigures (role);
CREATE INDEX IF NOT EXISTS idx_minifigures_type ON public.minifigures (type);
CREATE INDEX IF NOT EXISTS idx_minifigures_rarity ON public.minifigures (rarity);
CREATE INDEX IF NOT EXISTS idx_minifigures_series_id ON public.minifigures (series_id);
