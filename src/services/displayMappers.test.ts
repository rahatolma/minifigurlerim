import { describe, it, expect } from 'vitest';
import { toRarityOption, toSeriesOption } from './displayMappers';
import { normalizeRarityKey } from '../utils/filterHelpers';

describe('displayMappers', () => {
  describe('normalizeRarityKey', () => {
    it('normalizes Turkish rarity strings to canonical keys', () => {
      expect(normalizeRarityKey('yaygın')).toBe('common');
      expect(normalizeRarityKey('nadir')).toBe('rare');
      expect(normalizeRarityKey('çok nadir')).toBe('epic');
      expect(normalizeRarityKey('efsanevi')).toBe('legendary');
    });

    it('handles mixed casing and spacing', () => {
      expect(normalizeRarityKey(' Çok Nadir ')).toBe('epic');
      expect(normalizeRarityKey('RARE')).toBe('rare');
    });

    it('returns the raw string if no map matches', () => {
      expect(normalizeRarityKey(null)).toBe('');
      expect(normalizeRarityKey('invalid')).toBe('invalid');
    });
  });

  describe('toRarityOption', () => {
    it('returns proper English label for canonical key', () => {
      expect(toRarityOption('nadir', 'en')).toEqual({ value: 'rare', label: 'Rare' });
      expect(toRarityOption('epic', 'en')).toEqual({ value: 'epic', label: 'Super Rare' });
    });

    it('returns proper Turkish label for canonical key', () => {
      expect(toRarityOption('rare', 'tr')).toEqual({ value: 'rare', label: 'Nadir' });
      expect(toRarityOption('common', 'tr')).toEqual({ value: 'common', label: 'Yaygın' });
    });
  });

  describe('toSeriesOption', () => {
    it('returns explicit fallback when EN title is missing', () => {
      const result = toSeriesOption({ title_tr: 'LEGO® Minifigürler Serisi X', title_en: null }, 'en');
      expect(result.label).toBe('[TR] LEGO® Minifigürler Serisi X');
      expect(result.fallbackUsed).toBe(true);
      expect(result.fallbackSource).toBe('tr');
    });

    it('returns valid EN title when present', () => {
      const result = toSeriesOption({ title_en: 'LEGO® Minifigures Series X' }, 'en');
      expect(result.label).toBe('LEGO® Minifigures Series X');
      expect(result.fallbackUsed).toBe(false);
      expect(result.fallbackSource).toBe('none');
    });

    it('returns valid TR title for TR locale', () => {
      const result = toSeriesOption({ title_tr: 'LEGO® Minifigürler Serisi X', title_en: 'LEGO® Minifigures Series X' }, 'tr');
      expect(result.label).toBe('LEGO® Minifigürler Serisi X');
      expect(result.fallbackUsed).toBe(false);
      expect(result.fallbackSource).toBe('none');
    });
    
    it('handles totally missing titles', () => {
      const result = toSeriesOption({ id: 1 }, 'tr');
      expect(result.label).toBe('İsimsiz seri');
      expect(result.fallbackUsed).toBe(true);
      expect(result.fallbackSource).toBe('en');
    });
  });
});
