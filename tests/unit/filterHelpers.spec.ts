import { test, expect } from '@playwright/test';
import { normalizeRarityKey, toRarityLabel, getCanonicalQueryString } from '../../src/utils/filterHelpers';

test.describe('Filter Helpers - Unit Tests', () => {

    test.describe('normalizeRarityKey', () => {
        test('gives precedence to rarity_level over rarity', () => {
            expect(normalizeRarityKey('common', 'Rare')).toBe('rare');
            expect(normalizeRarityKey('Epic', '')).toBe('epic');
        });

        test('discards invalid placeholder values', () => {
            expect(normalizeRarityKey('null', null)).toBe('');
            expect(normalizeRarityKey('-', 'undefined')).toBe('');
            expect(normalizeRarityKey(' ', ' ')).toBe('');
        });

        test('returns lowercase canonical key', () => {
            expect(normalizeRarityKey(' LeGeNdary ', null)).toBe('legendary');
        });
    });

    test.describe('toRarityLabel', () => {
        test('maps canonical key by locale', () => {
            expect(toRarityLabel('rare', 'tr')).toBe('Nadir');
            expect(toRarityLabel('rare', 'en')).toBe('Rare');
            expect(toRarityLabel('unknown-key', 'tr')).toBe('Unknown-key'); // fallback capitalization
        });
    });

    test.describe('getCanonicalQueryString', () => {
        const filters = { roles: ['Cowboy', 'Police'], types: ['Standard'], rarities: ['rare', 'epic'] };
        
        test('removes invalid dependent params', () => {
            const result = getCanonicalQueryString({ series: 'star-wars', role: 'Wizard' }, filters);
            expect(result.needsRedirect).toBe(true);
            expect(result.canonicalQueryString).toBe('series=star-wars');
        });

        test('cleans empty string parameters', () => {
            const result = getCanonicalQueryString({ series: 'star-wars', role: '' }, filters);
            expect(result.needsRedirect).toBe(true);
            expect(result.canonicalQueryString).toBe('series=star-wars');
        });

        test('standardizes casing of valid rarities', () => {
            const result = getCanonicalQueryString({ rarity: 'RARE' }, filters);
            expect(result.needsRedirect).toBe(true);
            expect(result.canonicalQueryString).toBe('rarity=rare');
        });

        test('does not request redirect for identical canonical query (exact match / loop prevention)', () => {
            const query = { rarity: 'rare', role: 'Cowboy' };
            const result = getCanonicalQueryString(query, filters);
            expect(result.needsRedirect).toBe(false);
            // Birebir literal string sırası önemli değil, canonical parametreler yeterli
        });

        test('does not request redirect when param order structurally changes but semantics are preserved', () => {
            // URLSearchParams'a `delete` ve `set` kullanıldığında, value string'in sonuna geçer.
            // Fakat semantik equality sort() mekanizması bunu loop olarak algılamamalı.
            const queryStrMap: any = { type: 'Standard', rarity: 'rare', role: 'Cowboy' };
            const result = getCanonicalQueryString(queryStrMap, filters);
            expect(result.needsRedirect).toBe(false);
        });
    });
});
