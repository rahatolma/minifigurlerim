import type { Locale, LocalizedDisplay, SelectOption } from '@/services/displayMappers';

const FORBIDDEN_EN_PATTERNS = [
  'Minifigürler',
  'Serisi',
  'Yaygın',
  'Nadir',
  'Çok Nadir',
  'Efsanevi',
];

export function guardDisplayOption<T extends SelectOption | LocalizedDisplay>(
  option: T,
  locale: Locale,
  context?: string
): T {
  if (process.env.NODE_ENV === 'production') return option;

  if (locale === 'en') {
    const hasLeak = FORBIDDEN_EN_PATTERNS.some((pattern) =>
      option.label
        .toLocaleLowerCase('tr-TR')
        .includes(pattern.toLocaleLowerCase('tr-TR'))
    );

    const isExplicitFallback = option.label.startsWith('[TR]') || option.label.endsWith('(TR)');

    if (hasLeak && !isExplicitFallback) {
      console.error(`[i18n contract violation] Turkish label leaked into EN UI in ${context || 'Unknown Context'}:`, option);
      // In tests, we want this to explicitly throw to fail the test and catch regression.
      // E2E tests often don't fail just on console.error.
      if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
        throw new Error(`[i18n contract violation] Turkish label leaked into EN UI in ${context || 'Unknown Context'}: ${option.label}`);
      }
    }
  }

  return option;
}
