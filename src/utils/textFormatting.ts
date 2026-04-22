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
