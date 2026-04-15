import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hmzgccvwgrgrgkudvljb.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

const isDev = process.env.NODE_ENV !== 'production';

// Sentry, dev ortamında Turbopack CPU spike'larına sebep olduğu için kapatıldı. Sadece Production'da çalışır.
export default isDev 
  ? withNextIntl(nextConfig)
  : withSentryConfig(
      withNextIntl(nextConfig),
      {
        org: "rahatolma",
        project: "minifigurlerim",
        silent: !process.env.CI,
        widenClientFileUpload: true,
        reactComponentAnnotation: {
          enabled: true,
        },
        tunnelRoute: "/monitoring",
        sourcemaps: {
          disable: true,
        },
        disableLogger: true,
      }
    );
