/**
 * Replaces occurrences of 'LEGO' with 'LEGO®' globally in a safe manner.
 * Ensures that if 'LEGO' already has '®', it does not add an extra one.
 * 
 * @param text The string to format
 * @returns The safely formatted string
 */
export function formatBrandText(text: string | null | undefined): string {
    if (!text) return '';
    
    // 1. Replaces occurrences of 'LEGO' with 'LEGO®' globally in a safe manner
    // \bLEGO\b matches exact word 'LEGO'
    // (?!\®) negative lookahead to ensure it isn't followed by '®'
    let formatted = text.replace(/\bLEGO\b(?!\®)/g, 'LEGO®');
    
    // 2. Standardize 'Figür' to 'Minifigür' (case-preserved, respecting prefixes)
    // Matches 'Figür' or 'figür' with word boundaries at the start.
    formatted = formatted.replace(/\bFigür/g, 'Minifigür').replace(/\bfigür/g, 'minifigür');
    
    return formatted;
}

/**
 * Cleans the series display title by removing redundant taxonomy prefixes 
 * (like "LEGO Minifigures Series") to ensure a clean UI display.
 */
export function cleanSeriesDisplayTitle(title: string, locale: string): { prefix: string | null, mainTitle: string } {
    const rawTitle = formatBrandText(title);
    
    const prefixFullTR = "LEGO® Minifigürler Serisi";
    const prefixShortTR = "LEGO® Minifigürler";
    const prefixFullEN = "LEGO® Minifigures Series";
    const prefixShortEN = "LEGO® Minifigures";

    const prefixFull = locale === 'en' ? prefixFullEN : prefixFullTR;
    const prefixShort = locale === 'en' ? prefixShortEN : prefixShortTR;

    if (rawTitle.startsWith(prefixFull) && rawTitle.length > prefixFull.length) {
        return {
            prefix: prefixFull,
            mainTitle: rawTitle.substring(prefixFull.length).replace(/^[\s:\-]+/, '').trim()
        };
    } else if (rawTitle.startsWith(prefixShort) && rawTitle.length > prefixShort.length) {
        return {
            prefix: prefixShort,
            mainTitle: rawTitle.substring(prefixShort.length).replace(/^[\s:\-]+/, '').trim()
        };
    }

    return {
        prefix: null,
        mainTitle: rawTitle
    };
}
