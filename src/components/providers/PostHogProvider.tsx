'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST as string || "https://us.i.posthog.com",
                person_profiles: 'always', 
                capture_pageview: false // We prefer to turn this off and capture pageviews manually in Next.js, or keep it true if preferred. Let's keep it true to match watchsignature.
            })
        }
    }, [])

    return <PHProvider client={posthog}>{children}</PHProvider>
}
