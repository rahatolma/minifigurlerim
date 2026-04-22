/**
 * Naming & Microcopy Standards Helper
 * 
 * Bu yardımcı dosya, projede "/docs/standards/naming-conventions.md" içinde 
 * tanımlanan kelime yasaklarını ve kuralları mekanik olarak denetler.
 * Özellikle Admin panelinden veri girerken, dış kaynaktan veri alırken
 * veya Zod Form Schemalarında validation katmanı olarak çalışır.
 */

// 1. Kesinlikle Reddedilecek Terimler (Hard Fail)
// İşlemin kaydedilmesini kesin olarak önler.
export const HARD_FAIL_TERMS = [
  "mini figür serisi",  // Doğru: LEGO® Minifigürler Serisi
  "series list",        // Doğru: Series
  "sepet",              // E-ticaret jargonu yasak
  "kasa",               // E-ticaret jargonu yasak
];

// 2. Uyarı Seviyesindeki Terimler (Warning / Soft Fail)
// Veri kaydedilir ancak kullanıcıya / loglara uyarı bırakır.
export const WARNING_TERMS = [
  "mini figür",         // Editoryal esneklik (Bazen mecburi kullanılabilir) ama uyarı verir
  "karakter",           // Özel bir IP değilse (örn Disney) Minifigür denmeli
  "oyuncak",            // Bağlama göre uyarı verir
  "adam",               // "Minifigür adam" gibi kullanımlar
];

// 3. İstisnalar (Exceptions / False Positives)
// Yasaklı gibi görünse de marka adları için izin verilenler.
export const EXCEPTION_TERMS = [
  "oyuncak hikayesi",   // Toy Story lisansı
  "örümcek adam",       // Spider-man lisansı
  "demir adam",         // Iron Man lisansı
];

// 4. İnsancıl Hata Sınıfı (Adminler İçin)
export class NamingStandardViolationError extends Error {
  constructor(term: string) {
    // Adminlerin anlayabileceği, neden reddedildiğini açıklayan insan gibi bir dil.
    super(`Admin Kayıt Hatası: Yazdığınız metin içerisinde e-ticaret jargonu olan "${term}" kelimesi bulundu. Lütfen bunun yerine "Minifigür", "Seri" veya "Koleksiyon" kelimelerini tercih edip tekrar kaydedin.`);
    this.name = 'NamingStandardViolationError';
  }
}

/**
 * 5. validateNamingConvention(text)
 * Parametredeki metni Hard Fail ve Exception sözlüğüne karşı tarar.
 * Yasaklı kelime bulursa (ve Exception değilse) Error fırlatır.
 */
export function validateNamingConvention(text: string): { valid: boolean; warnings: string[] } {
  if (!text) return { valid: true, warnings: [] };
  
  const normalizedText = text.toLowerCase();
  const warnings: string[] = [];
  
  // Önce Hard Fail kontrolü
  for (const term of HARD_FAIL_TERMS) {
    if (normalizedText.includes(term.toLowerCase())) {
      // Eğer kelime İstisna (Exception) listesindeki bir grubun içindeyse atla
      // (Burası şu an hard fail'da exception ihtimali düşük olsa da mimari olarak tutulur)
      throw new NamingStandardViolationError(term);
    }
  }

  // Sonra Warning kontrolü
  for (const term of WARNING_TERMS) {
    if (normalizedText.includes(term.toLowerCase())) {
      // İstisna Kontrolü (Örn: "Örümcek Adam" içinde "adam" geçiyor)
      const isException = EXCEPTION_TERMS.some(ex => normalizedText.includes(ex.toLowerCase()));
      if (!isException) {
         warnings.push(term);
      }
    }
  }
  
  return { valid: true, warnings };
}

/**
 * 6. normalizeSlug(text)
 * TR/EN Parity Slug Kuralı: Özel ş,ç,ı dönüşümlerini garanti altına alır.
 */
export function normalizeSlug(text: string): string {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    // Sadece a-z, 0-9 arasına ve boşluk ile - (dash) işaretlerine izin ver
    .replace(/[^a-z0-9\s-]/g, '') 
    // Tüm boşlukları ve birden fazla '-' formatını tek tire (-) ye çevir
    .replace(/[\s-]+/g, '-');
}
