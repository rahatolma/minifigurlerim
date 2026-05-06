import { describe, it, expect } from 'vitest';
import { mapSeriesToCardViewModel } from '../mappers';

describe('mapSeriesToCardViewModel', () => {
  const mockTranslate = (key: string) => key;

  it('should not override canonical displayTitle with showcase title (editorial)', () => {
    const mockSeries = {
      id: 'test-series',
      title: 'LEGO Minifigürler Serisi: Seri 1',
      title_en: 'Series 1',
      content_blocks: [
        {
          type: 'SERIES_SHOWCASE',
          data: {
            title: 'Başlangıcın Efsanesi',
          },
        },
      ],
    };

    const result = mapSeriesToCardViewModel(
      mockSeries,
      'tr',
      mockTranslate,
      mockTranslate,
      mockTranslate
    );

    // The canonical identity should be preserved
    expect(result.displayTitle).toBe('Seri 1');
    expect(result.familyLabel).toBe('LEGO Minifigürler Serisi');
    
    // The showcase title should be captured separately but not override displayTitle
    expect(result.showcaseTitle).toBe('Başlangıcın Efsanesi');
  });

  it('should fallback to title_en if locale is en and en_status is not missing', () => {
    const mockSeries = {
      id: 'test-series',
      title: 'LEGO Minifigürler Serisi: Seri 1',
      title_en: 'Series 1',
      en_status: 'translated',
    };

    const result = mapSeriesToCardViewModel(
      mockSeries,
      'en',
      mockTranslate,
      mockTranslate,
      mockTranslate
    );

    expect(result.displayTitle).toBe('Series 1');
  });
});
