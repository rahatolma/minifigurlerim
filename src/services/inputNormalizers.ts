import { normalizeRarityKey } from '@/utils/filterHelpers';

export interface NormalizationLog {
  field: string;
  originalValue: any;
  normalizedValue: any;
  timestamp: string;
}

export interface NormalizationResult {
  safeRecord: any;
  logs: NormalizationLog[];
}

export function normalizeIncomingMinifigure(record: any, strictMode: boolean = false): NormalizationResult {
  if (!record || typeof record !== 'object') {
    throw new Error('Invalid record provided for normalization.');
  }

  const safeRecord = { ...record };
  const logs: NormalizationLog[] = [];

  const logNormalization = (field: string, original: any, normalized: any) => {
    if (original !== normalized) {
      if (strictMode) {
         throw new Error(`Strict Mode Violation: Field '${field}' requires normalization from '${original}' to '${normalized}'.`);
      }
      logs.push({
        field,
        originalValue: original,
        normalizedValue: normalized,
        timestamp: new Date().toISOString()
      });
    }
  };

  // 1. Strings: Trim whitespace to prevent dirty taxonomy injection
  const stringFields = [
    'name', 'figure_name', 'role', 'type', 'category', 'brand', 
    'code', 'figure_code', 'series_name', 'figure_no', 'figure_number', 'body_material', 'description'
  ];

  for (const field of stringFields) {
    if (typeof safeRecord[field] === 'string') {
      const original = safeRecord[field];
      let normalized: string | null = original.trim();
      
      // Enforce null over empty strings for cleaner DB state (except for required name)
      if (normalized === '' && field !== 'name' && field !== 'figure_name') {
        normalized = null;
      }
      
      if (original !== normalized) {
        logNormalization(field, original, normalized);
        safeRecord[field] = normalized;
      }
    }
  }

  // 2. Enum: Rarity normalization
  const originalRarity = safeRecord.rarity;
  if (originalRarity === undefined || originalRarity === null) {
    if (originalRarity !== 'common') {
        logNormalization('rarity', originalRarity, 'common');
        safeRecord.rarity = 'common';
    }
  } else {
    const canonicalNormalized = normalizeRarityKey(originalRarity);
    const validKeys = ['common', 'rare', 'epic', 'legendary'];
    const finalRarity = validKeys.includes(canonicalNormalized) ? canonicalNormalized : 'common';
    
    if (originalRarity !== finalRarity) {
        logNormalization('rarity', originalRarity, finalRarity);
        safeRecord.rarity = finalRarity;
    }
  }

  // 3. Optional Custom Attributes cleanup
  if (safeRecord.custom_attributes && typeof safeRecord.custom_attributes === 'object') {
    const cleanedAttrs: Record<string, string> = {};
    let attributesChanged = false;
    for (const [key, value] of Object.entries(safeRecord.custom_attributes)) {
      if (typeof value === 'string' && value.trim() !== '') {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();
        cleanedAttrs[trimmedKey] = trimmedValue;
        if (key !== trimmedKey || value !== trimmedValue) {
            attributesChanged = true;
        }
      } else {
          attributesChanged = true; // Key was removed
      }
    }
    if (attributesChanged) {
        logNormalization('custom_attributes', safeRecord.custom_attributes, cleanedAttrs);
        safeRecord.custom_attributes = cleanedAttrs;
    }
  }

  // 4. Strict requirements check
  if (!safeRecord.name && !safeRecord.figure_name) {
    throw new Error('A Minifigure must have a valid name.');
  }

  return { safeRecord, logs };
}
