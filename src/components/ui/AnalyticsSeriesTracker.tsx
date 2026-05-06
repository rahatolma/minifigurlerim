'use client';

import { useEffect, useRef } from 'react';
import { trackViewSeries, SeriesTrackingProps } from '@/lib/analytics';
import { usePostHog } from 'posthog-js/react';
import { usePathname } from 'next/navigation';

interface AnalyticsSeriesTrackerProps {
  series: Omit<SeriesTrackingProps, 'route' | 'source_section'>;
}

export default function AnalyticsSeriesTracker({ series }: AnalyticsSeriesTrackerProps) {
  const posthog = usePostHog();
  const pathname = usePathname();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (series && posthog && pathname) {
      if (!trackedRef.current) {
         trackViewSeries({ ...series, route: pathname, source_section: 'series_detail' }, posthog);
         trackedRef.current = true;
      }
    }
  }, [series.series_id, posthog, pathname]);

  return null;
}
