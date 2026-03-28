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
