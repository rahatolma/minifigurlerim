/**
 * Türkçe karakterleri dönüştürerek SEO uyumlu URL (slug) stringi oluşturur.
 * Örn: "LEGO® Minifigürler Serisi 1" -> "lego-minifigurler-serisi-1"
 */
export function slugify(text: string): string {
  if (!text) return '';
  
  let result = text.toString();
  
  // Türkçe karakter eşleştirmesi
  const trMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'c', 
    'ğ': 'g', 'Ğ': 'g', 
    'ş': 's', 'Ş': 's', 
    'ü': 'u', 'Ü': 'u', 
    'ı': 'i', 'İ': 'i', 
    'ö': 'o', 'Ö': 'o'
  };

  // Türkçe karakterleri dönüştür
  for (let key in trMap) {
    result = result.replace(new RegExp(key, 'g'), trMap[key]);
  }

  return result
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Harf ve rakam olmayanları tireye çevir (Boşluklar dahil)
    .replace(/-+/g, '-')         // Peşpeşe gelen tireleri tek tire yap
    .replace(/^-|-$/g, '');      // Baş veya sondaki tireleri temizle
}

/**
 * Environment-aware URL çözümleyici
 * Production, Preview ve Localhost ortamları için doğru URL'yi döndürür.
 */
export function getURL(): string {
  let url = 'http://localhost:3004'; // Varsayılan fallback

  if (process.env.VERCEL_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL) {
    url = process.env.NEXT_PUBLIC_SITE_URL;
  } else if (process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL) {
    url = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || url;
  }

  // Protokolü garantiye al
  url = url.startsWith('http') ? url : `https://${url}`;
  
  // Sondaki slash'i temizle
  url = url.charAt(url.length - 1) === '/' ? url.slice(0, -1) : url;
  
  return url;
}
