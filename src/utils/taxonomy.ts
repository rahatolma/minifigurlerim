// Controlled Vocabulary Layer
// Fetches taxonomy dynamically from next-intl (which is synced with Supabase taxonomy_terms)

export function generateTaxonomyKey(str: any): string {
  if (!str) return 'unknown';
  if (typeof str !== 'string') {
    if (typeof str === 'number' || typeof str === 'boolean') {
      str = String(str);
    } else {
      return 'unknown';
    }
  }
  
  return str
    .trim()
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/[\s-]+/)
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Track warned keys to prevent log spam in production
const warnedTaxonomyKeys = new Set<string>();

/**
 * Fallback mekanizmalı güvenli taxonomy okuyucusu.
 * Eğer key sözlükte (DB'de) yoksa, ham değeri döndürür.
 */
function safeTranslate(dbValue: any, namespace: string, t: any, locale?: string): string {
  try {
    if (!dbValue) return '';
    
    const key = generateTaxonomyKey(dbValue);
    
    if (t && typeof t.has === 'function' && t.has(`${namespace}.${key}`)) {
      return t(`${namespace}.${key}`);
    }
    
    // Prod loglama: Admin'in haberdar olması için Vercel/Datadog loglarına da düşsün
    // Dedupe: Sadece ilk defa karşılaşıldığında logla
    const warnId = `${namespace}:${key}`;
    if (!warnedTaxonomyKeys.has(warnId)) {
      console.warn(`[Taxonomy Missing EN] Unmapped ${namespace} found: "${dbValue}" (Key: ${key}). Please map it in Admin Panel.`);
      warnedTaxonomyKeys.add(warnId);
    }
    
    if (locale === 'en') {
      return '';
    }
    
    return typeof dbValue === 'string' ? dbValue : String(dbValue);
  } catch (error) {
    console.error(`[Taxonomy Fatal Error] Fallback triggered for dbValue:`, dbValue, error);
    return typeof dbValue === 'string' ? dbValue : '';
  }
}

export function getLocalizedCategory(dbValue: string, t: any, locale?: string): string {
  return safeTranslate(dbValue, 'Category', t, locale);
}

export function getLocalizedRarity(dbValue: string, t: any, locale?: string): string {
  return safeTranslate(dbValue, 'Rarity', t, locale);
}

export function getLocalizedRole(dbValue: string, t: any, locale?: string): string {
  return safeTranslate(dbValue, 'Role', t, locale);
}

export function getLocalizedValueSignal(dbValue: string, t: any, locale?: string): string {
  return safeTranslate(dbValue, 'ValueSignal', t, locale);
}

export function getLocalizedDemandSignal(dbValue: string, t: any, locale?: string): string {
  return safeTranslate(dbValue, 'DemandSignal', t, locale);
}
