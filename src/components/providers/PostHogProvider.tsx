'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { shouldTrackAnalytics } from '@/lib/analytics'

export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Sadece browser ortamında çalışır ve eğer init edildiyse event atar.
    if (pathname && typeof window !== 'undefined') {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      if (shouldTrackAnalytics()) {
          posthog.capture('$pageview', {
            $current_url: url,
          })
      } else {
          console.log(`[analytics:debug] pageview skipped: ${url}`);
      }
    }
  }, [pathname, searchParams])
  
  return null
}

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY && shouldTrackAnalytics()) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST as string || "https://eu.i.posthog.com",
        person_profiles: 'always', 
        // Next.js App Router için capture_pageview kapalı, özel component (PostHogPageView) ile manuel atılıyor ki duplicate olmasın.
        capture_pageview: false, 
        autocapture: true, // Kullanıcı veri girişleri (şifre vb.) PostHog tarafından varsayılan olarak maskelenir/kaydedilmez.
        sanitize_properties: (properties: any) => {
            // URL üzerinden gelebilecek session id vb hassas parametreleri engelle
            if (properties.$current_url) {
                try {
                    const url = new URL(properties.$current_url);
                    const sensitiveKeys = ['token', 'session', 'access_token', 'refresh_token', 'code', 'email', 'magiclink', 'callback', 'secret', 'password'];
                    sensitiveKeys.forEach(k => url.searchParams.delete(k));
                    properties.$current_url = url.toString();
                } catch (e) {
                    // Ignore URL parsing errors
                }
            }
            return properties;
        }
    });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    return <PHProvider client={posthog}>{children}</PHProvider>
}
