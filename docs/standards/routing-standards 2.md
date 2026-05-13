# Route Builder ve URL Standartları (Routing Standards)

Minifigürlerim projesinde **asla static string birleşimi** ile URL oluşturulmamalıdır. (Örn: `href={"/figurler/${slug}"}`). Bu durum hem localization (i18n) eksikliklerine hem de eksik URL bileşenlerinin (Örn: `seriesSlug` boş gelmesi) 404 sayfalarına koparmasına sebep olmaktaydı.

## Yeni Standart: routeBuilder.ts

Tüm lokal route'lar, `src/utils/routeBuilder.ts` içerisindeki type-safe fonksiyonlar kullanılarak üretilmelidir.

### 1. Figür Detay Linkleri (`getFigureUrl`)
Figür Detay sayfasına giderken **hem serinin slug'ı hem de figürün slug'ı zorunludur.** Eksikse fonksiyon konsolda hata atar ve `#` döndürerek sayfaya kırık link yansımasını engeller. (Fail-fast prensibi).

**DOĞRU KULLANIM:**
```tsx
import { getFigureUrl } from '@/utils/routeBuilder';
import { useLocale } from 'next-intl';

export default function MyComponent({ figure }) {
  const locale = useLocale();
  return (
    <Link href={getFigureUrl({
        seriesSlug: figure.series_slug || 'genel',
        figureSlug: figure.slug || figure.id,
        locale: locale as any
    })}>
      İncele
    </Link>
  );
}
```

### 2. Seri ve Listeleme Linkleri
Aynı şekilde seri sayfaları veya listeleme arşivleri için helper'lar kullanılmalıdır:
* `getSeriesUrl({ seriesSlug: '...', locale: 'tr' })`
* `getFiguresListUrl(locale)`
* `getSeriesListUrl(locale)`

## Localization Notu
Next-Intl kütüphanesinin varsayılan `<Link>` componenti routing.ts'i kullanırken iç içe string bozulmaları yapabiliyordu. Artık rotayı `routeBuilder` üzerinden global formatta çözdüğümüz için Next.js'in tamamen Native `<Link>` componentini (`next/link`) **güvenle kullanabilirsiniz.**
