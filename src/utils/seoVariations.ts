/**
 * Deterministik SEO Varyasyon Motoru
 * Google'ın "AI-Template" spam algısını kırmak için kullanılır.
 * Girdi olarak verilen slug veya ID'ye göre her zaman aynı (deterministik) varyasyonu seçer.
 * Böylece cache ve SSR dostudur, hydration error yaratmaz.
 */

// Basit ve hızlı bir string hash fonksiyonu
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32bit integer'a çevir
  }
  return Math.abs(hash);
};

export const getDeterministicVariation = (key: string, variations: string[]): string => {
  if (!variations || variations.length === 0) return '';
  const hash = hashString(key);
  return variations[hash % variations.length];
};

// Seri sayfaları için title suffix varyasyonları
export const SERIES_TITLE_SUFFIXES_EN = [
  "Complete Checklist",
  "Collector Guide",
  "Character Archive",
  "Full Figure Lineup",
  "Collectible Series Overview"
];

export const SERIES_TITLE_SUFFIXES_TR = [
  "Tam Liste",
  "Koleksiyoner Rehberi",
  "Karakter Arşivi",
  "Tüm Figürler",
  "Koleksiyon İncelemesi"
];

// Figür detay sayfaları için description başlangıç varyasyonları
export const FIGURE_DESC_PREFIXES_EN = [
  "Discover the details of",
  "Complete your collection with",
  "Explore the collector profile of",
  "View the archive entry for",
  "Detailed information about"
];

export const FIGURE_DESC_PREFIXES_TR = [
  "Detaylı inceleyin:",
  "Koleksiyonunuzu tamamlayın:",
  "Koleksiyoner profilini keşfedin:",
  "Arşiv kayıtlarını görüntüleyin:",
  "Hakkında tüm detaylar:"
];
