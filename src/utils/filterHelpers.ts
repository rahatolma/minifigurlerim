/**
 * Veritabanındaki kirli rarity datasını temizleyip teknik "canonical locale-independent key" üretir.
 * Çıktı: Her zaman lowercase pure key (Örn: "rare").
 */
export function normalizeRarityKey(rarity?: string | null, rarityLevel?: string | null): string {
    let raw = rarityLevel;
    if (!raw || raw.trim() === '') raw = rarity;
    
    if (!raw || typeof raw !== 'string') return '';
    const trimmed = raw.trim().toLowerCase();
    
    if (trimmed === 'null' || trimmed === 'undefined' || trimmed === '-' || trimmed === '') {
        return '';
    }

    // MAP DB VALUES TO CANONICAL KEYS
    const keyMap: Record<string, string> = {
        'yaygın': 'common',
        'yaygin': 'common',
        'nadir': 'rare',
        'çok nadir': 'epic',
        'cok nadir': 'epic',
        'destansı': 'epic',
        'destansi': 'epic',
        'efsanevi': 'legendary'
    };

    return keyMap[trimmed] || trimmed;
}

/**
 * Teknik Rarity Key'ı alıp UI'da gösterilecek Localized Label'a çevirir.
 */
export function toRarityLabel(key: string, locale: string): string {
    if (!key) return '';
    const localizedMap: Record<string, Record<string, string>> = {
        rare: { tr: 'Nadir', en: 'Rare' },
        common: { tr: 'Yaygın', en: 'Common' },
        epic: { tr: 'Çok Nadir', en: 'Epic' },
        legendary: { tr: 'Efsanevi', en: 'Legendary' }
    };
    
    const lowerKey = key.toLowerCase();
    const mapped = localizedMap[lowerKey];
    if (mapped && mapped[locale]) {
        return mapped[locale];
    }
    
    // Fallback: Label eşleşmediyse harfi büyüt ver
    return lowerKey.charAt(0).toUpperCase() + lowerKey.slice(1);
}

export interface FilterOptionsSet {
    roles: string[];
    types: string[];
    rarities: string[];
}

/**
 * Mevcut URL Search parametrelerini, izin verilen Daraltılmış Child Filter kümeleriyle karşılaştırır.
 * Geçersiz (Option Set içinde olmayan) tüm parametreleri atar.
 * Sözleşme: redirect logiği exact matching ile loop'ları engeller.
 * 
 * @returns { needsRedirect: boolean, canonicalQueryString: string }
 */
export function getCanonicalQueryString(
    searchParams: { [key: string]: string | string[] | undefined },
    filterOptions: FilterOptionsSet
): { needsRedirect: boolean; canonicalQueryString: string } {
    const currentParams = new URLSearchParams();
    
    // Güvenli şekilde Search Params'ı array/string döngüsünden kurtararak ekleme
    Object.entries(searchParams || {}).forEach(([k, v]) => {
        if (v !== undefined) {
            if (Array.isArray(v)) {
                v.forEach(val => currentParams.append(k, val));
            } else {
                currentParams.set(k, v);
            }
        }
    });

    const originalParamsString = currentParams.toString();
    
    const role = currentParams.get('role');
    if (role !== null && role !== 'all') {
        if (role.trim() === '' || !filterOptions.roles.includes(role)) {
            currentParams.delete('role');
        }
    }
    
    const type = currentParams.get('type');
    if (type !== null && type !== 'all') {
        if (type.trim() === '' || !filterOptions.types.includes(type)) {
            currentParams.delete('type');
        }
    }

    const rarity = currentParams.get('rarity');
    if (rarity !== null && rarity !== 'all') {
        if (rarity.trim() === '' || !filterOptions.rarities.includes(rarity)) {
            const exactMatch = filterOptions.rarities.find(r => r.toLowerCase() === rarity.toLowerCase());
            if (exactMatch && exactMatch !== '') {
                currentParams.set('rarity', exactMatch);
            } else {
                currentParams.delete('rarity');
            }
        }
    }

    // Redirect loop riski: original structure, canonical formla "semantik olarak" YZDEYÜZ aynıysa ASLA redirect yapma.
    // Literal string order değişebileceği için sort() ederek karşılaştırmak en güvenlidir.
    const originalSorted = new URLSearchParams(searchParams as any);
    originalSorted.sort();
    
    const canonicalSorted = new URLSearchParams(currentParams);
    canonicalSorted.sort();

    const needsRedirect = originalSorted.toString() !== canonicalSorted.toString();

    return { needsRedirect, canonicalQueryString: currentParams.toString() };
}

