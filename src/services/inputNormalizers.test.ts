import { describe, it, expect } from 'vitest';
import { normalizeIncomingMinifigure } from './inputNormalizers';

describe('inputNormalizers', () => {
  describe('normalizeIncomingMinifigure', () => {
    it('throws error if name is missing', () => {
      expect(() => normalizeIncomingMinifigure({ role: 'Warrior' }))
        .toThrow('A Minifigure must have a valid name.');
    });

    it('trims string fields and converts empty strings to null', () => {
      const input = {
        name: '  Luke Skywalker  ',
        role: ' Jedi ',
        type: '   ',
        category: 'Star Wars'
      };

      const { safeRecord, logs } = normalizeIncomingMinifigure(input);

      expect(safeRecord.name).toBe('Luke Skywalker');
      expect(safeRecord.role).toBe('Jedi');
      expect(safeRecord.type).toBeNull(); // Empty string became null
      expect(safeRecord.category).toBe('Star Wars');
      
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some(l => l.field === 'name')).toBe(true);
    });

    it('normalizes dirty rarity strings to canonical values', () => {
      expect(normalizeIncomingMinifigure({ name: 'A', rarity: 'çok nadir' }).safeRecord.rarity).toBe('epic');
      expect(normalizeIncomingMinifigure({ name: 'A', rarity: 'YAYGIN' }).safeRecord.rarity).toBe('common');
      expect(normalizeIncomingMinifigure({ name: 'A', rarity: 'Efsanevi' }).safeRecord.rarity).toBe('legendary');
      // Unrecognized strings fall back to common
      expect(normalizeIncomingMinifigure({ name: 'A', rarity: ' çok nadirr ' }).safeRecord.rarity).toBe('common');
    });

    it('defaults unknown or missing rarity to common', () => {
      expect(normalizeIncomingMinifigure({ name: 'A', rarity: 'garbage-value' }).safeRecord.rarity).toBe('common');
      expect(normalizeIncomingMinifigure({ name: 'A', rarity: null }).safeRecord.rarity).toBe('common');
      expect(normalizeIncomingMinifigure({ name: 'A', rarity: '' }).safeRecord.rarity).toBe('common');
    });

    it('cleans custom_attributes object', () => {
      const input = {
        name: 'A',
        custom_attributes: {
          ' weapon ': ' Lightsaber ',
          'empty-attr': '   ',
          'valid': '123'
        }
      };

      const { safeRecord, logs } = normalizeIncomingMinifigure(input);

      expect(safeRecord.custom_attributes).toEqual({
        'weapon': 'Lightsaber',
        'valid': '123'
      });
      expect(logs.some(l => l.field === 'custom_attributes')).toBe(true);
    });

    it('throws error in strict mode when dirty data is encountered', () => {
      expect(() => normalizeIncomingMinifigure({ name: 'A', role: ' Jedi ' }, true))
        .toThrow("Strict Mode Violation: Field 'role' requires normalization from ' Jedi ' to 'Jedi'.");
    });
  });
});
