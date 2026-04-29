import { guardDisplayOption } from '@/utils/i18nContractGuard';
import { getLocalizedCategory, getLocalizedRole } from '@/utils/taxonomy';
import { normalizeRarityKey } from '@/utils/filterHelpers';

export type Locale = 'tr' | 'en';

export type SelectOption = {
  value: string;
  label: string;
};

export type LocalizedDisplay = {
  value: string;
  label: string;
  fallbackUsed?: boolean;
  fallbackSource?: 'tr' | 'en' | 'none';
};

export type RarityKey = 'common' | 'rare' | 'epic' | 'legendary';

const RARITY_LABELS: Record<Locale, Record<RarityKey, string>> = {
  en: {
    common: 'Common',
    rare: 'Rare',
    epic: 'Super Rare',
    legendary: 'Legendary',
  },
  tr: {
    common: 'Yaygın',
    rare: 'Nadir',
    epic: 'Çok Nadir',
    legendary: 'Efsanevi',
  },
};



export function toRarityOption(key: string, locale: Locale): SelectOption {
  const normalizedKey = normalizeRarityKey(key);
  const label = normalizedKey ? RARITY_LABELS[locale][normalizedKey as RarityKey] : key;

  return guardDisplayOption(
    {
      value: normalizedKey || key,
      label,
    },
    locale,
    'RarityMapper'
  );
}

export function toSeriesOption(
  series: {
    id?: string | number;
    slug?: string | null;
    slug_tr?: string | null;
    slug_en?: string | null;
    title?: string | null;
    title_tr?: string | null;
    title_en?: string | null;
    series_name?: string | null;
  },
  locale: Locale
): LocalizedDisplay {
  const value =
    locale === 'en'
      ? series.slug_en || series.slug || series.slug_tr || String(series.id || '')
      : series.slug_tr || series.slug || String(series.id || '');

  const trTitle = series.title_tr || series.title || series.series_name || '';
  const enTitle = series.title_en || null;

  if (locale === 'en') {
    if (enTitle && enTitle.trim()) {
      return guardDisplayOption(
        {
          value,
          label: enTitle.trim(),
          fallbackUsed: false,
          fallbackSource: 'none',
        },
        locale,
        'SeriesMapper'
      );
    }

    return guardDisplayOption(
      {
        value,
        label: trTitle ? `[TR] ${trTitle}` : 'Translation pending',
        fallbackUsed: true,
        fallbackSource: trTitle ? 'tr' : 'none',
      },
      locale,
      'SeriesMapper'
    );
  }

  return guardDisplayOption(
    {
      value,
      label: trTitle || enTitle || 'İsimsiz seri',
      fallbackUsed: !trTitle,
      fallbackSource: trTitle ? 'none' : 'en',
    },
    locale,
    'SeriesMapper'
  );
}

export function toCategoryOption(
  category: { slug: string; name: string; name_en?: string },
  locale: Locale,
  tTax: any
): SelectOption {
  // getLocalizedCategory handles its own fallback, but we enforce formatting here
  let label = getLocalizedCategory(category.name, tTax, locale) || category.name;
  
  // If taxonomy returned raw turkish string and we are in EN, explicit fallback it
  if (locale === 'en' && label === category.name) {
    label = `[TR] ${label}`;
  }

  return guardDisplayOption(
    {
      value: category.slug,
      label,
    },
    locale,
    'CategoryMapper'
  );
}

export function toRoleOption(role: string, locale: Locale, tTax: any): SelectOption {
  let label = getLocalizedRole(role, tTax, locale) || role;
  
  if (locale === 'en' && label === role) {
    label = `[TR] ${label}`;
  }

  return guardDisplayOption(
    {
      value: role,
      label,
    },
    locale,
    'RoleMapper'
  );
}

export function toTypeOption(type: string, locale: Locale): SelectOption {
  // Types currently do not have a dedicated taxonomy dictionary.
  let label = type;
  if (locale === 'en') {
      label = `[TR] ${label}`;
  }

  return guardDisplayOption(
    {
      value: type,
      label,
    },
    locale,
    'TypeMapper'
  );
}
