/**
 * Replaces occurrences of 'LEGO' with 'LEGO®' globally in a safe manner.
 * Ensures that if 'LEGO' already has '®', it does not add an extra one.
 * 
 * @param text The string to format
 * @returns The safely formatted string
 */
export function formatBrandText(text: string | null | undefined): string {
    if (!text) return '';
    
    // Regular expression:
    // \bLEGO\b matches exact word 'LEGO'
    // (?!\®) negative lookahead to ensure it isn't followed by '®'
    return text.replace(/\bLEGO\b(?!\®)/g, 'LEGO®');
}
