/**
 * Minifigurlerim JSON-LD Schema Generators
 * 
 * Bu dosya, platformun Google tarafindan bir e-ticaret sitesi DEGIL,
 * tamamen bir "Koleksiyon Arsivi" (Collector Archive) olarak algilanmasi
 * amaciyla Product/Offer semalarindan kacinilarak hazirlanmistir.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://minifigurlerim.com';

// Güvenli JSON-LD Serialize (XSS Koruması: </script> bypass engelleme)
export function safeJsonLd(data: any): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

// 1. BreadcrumbList Schema
export function generateBreadcrumbSchema(items: { name: string; item?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.item ? `${BASE_URL}${breadcrumb.item}` : undefined,
    })),
  };
}

// 2. CollectionPage Schema (Listings)
export function generateCollectionPageSchema(title: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description,
    url: `${BASE_URL}${url}`,
    publisher: {
      '@type': 'Organization',
      name: 'Minifigürlerim',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon.png`,
      },
    },
  };
}

// 3. ItemList Schema (For Series content / Top Figures)
export function generateItemListSchema(name: string, url: string, items: { name: string; url: string; image?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: name,
    url: `${BASE_URL}${url}`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Thing',
        name: item.name,
        url: `${BASE_URL}${item.url}`,
        ...(item.image && { image: item.image })
      }
    }))
  };
}

// 4. ItemPage Schema (For Figure Details)
// STRICT AVOIDANCE of Product Schema. We use ItemPage -> Thing.
export function generateItemPageSchema(title: string, description: string, url: string, image: string, seriesName?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    name: title,
    description: description,
    url: `${BASE_URL}${url}`,
    mainEntity: {
      '@type': 'Thing',
      name: title,
      description: description,
      image: image,
      url: `${BASE_URL}${url}`,
      ...(seriesName && { additionalType: 'https://schema.org/VisualArtwork', isPartOf: { '@type': 'CreativeWorkSeries', name: seriesName } })
    }
  };
}

// 5. Article Schema (For News)
export function generateArticleSchema(title: string, description: string, url: string, image: string, datePublished: string, dateModified: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: [image],
    datePublished: datePublished,
    dateModified: dateModified,
    author: {
      '@type': 'Organization',
      name: 'Minifigürlerim',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Minifigürlerim',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}${url}`,
    },
  };
}
