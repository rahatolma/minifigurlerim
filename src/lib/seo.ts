import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.minifigurlerim.com';

export interface BuildMetadataProps {
  title: string;
  description: string;
  locale: string;
  alternates: {
    tr: string;
    en: string;
  };
  ogImage?: string;
  noindex?: boolean;
}

export function buildMetadata({
  title,
  description,
  locale,
  alternates,
  ogImage,
  noindex = false,
}: BuildMetadataProps): Metadata {
  // Ensure we strip trailing slashes and normalize paths
  const normalizePath = (path: string) => {
    // Basic cleanup
    let clean = path.trim().toLowerCase();
    
    // Safety encode (in case of unencoded turkish chars or weird inputs)
    clean = encodeURI(decodeURI(clean));
    
    // Remove duplicate slashes
    clean = clean.replace(/\/{2,}/g, '/');

    // Ensure it starts with slash
    if (!clean.startsWith('/')) clean = '/' + clean;
    
    // Remove trailing slash
    if (clean.endsWith('/') && clean !== '/') clean = clean.slice(0, -1);
    
    return clean;
  };

  const pathTr = normalizePath(alternates.tr);
  const pathEn = normalizePath(alternates.en);

  // Construct absolute URLs (no trailing slashes, clean)
  const urlTr = pathTr === '/' ? `${BASE_URL}/tr` : `${BASE_URL}${pathTr.startsWith('/tr') ? '' : '/tr'}${pathTr.replace(/^\/tr/i, '')}`;
  const urlEn = pathEn === '/' ? `${BASE_URL}/en` : `${BASE_URL}${pathEn.startsWith('/en') ? '' : '/en'}${pathEn.replace(/^\/en/i, '')}`;

  const currentUrl = locale === 'tr' ? urlTr : urlEn;

  // Default OpenGraph
  const defaultOgImage = `${BASE_URL}/images/og-default.jpg`; // Fallback image
  const finalOgImage = ogImage || defaultOgImage;

  return {
    title,
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: currentUrl,
      languages: {
        'tr-TR': urlTr,
        'en-US': urlEn,
        'x-default': urlTr, // Enforced: Turkish is the primary domain language
      },
    },
    openGraph: {
      title,
      description,
      url: currentUrl,
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      type: 'website',
      images: [
        {
          url: finalOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [finalOgImage],
    },
    ...(noindex && {
      robots: {
        index: false,
        follow: true, // We still follow links on paginated/sorted pages
      },
    }),
  };
}
