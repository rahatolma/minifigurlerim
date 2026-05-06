'use client';

import { useEffect, useRef } from 'react';
import { trackViewFigure, FigureTrackingProps } from '@/lib/analytics';
import { usePostHog } from 'posthog-js/react';
import { usePathname } from 'next/navigation';

interface AnalyticsViewTrackerProps {
  figure: Omit<FigureTrackingProps, 'route' | 'source_section'>;
}

export default function AnalyticsViewTracker({ figure }: AnalyticsViewTrackerProps) {
  const posthog = usePostHog();
  const pathname = usePathname();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (figure && posthog && pathname) {
      if (!trackedRef.current) {
         trackViewFigure({ ...figure, route: pathname, source_section: 'figure_detail' }, posthog);
         trackedRef.current = true;
      }
    }
  }, [figure.figure_id, posthog, pathname]);

  return null;
}
