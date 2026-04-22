'use client';

import { useEffect, useRef } from 'react';
import { trackViewFigure, FigureTrackingProps } from '@/lib/analytics';
import { usePostHog } from 'posthog-js/react';

interface AnalyticsViewTrackerProps {
  figure: FigureTrackingProps;
}

export default function AnalyticsViewTracker({ figure }: AnalyticsViewTrackerProps) {
  const posthog = usePostHog();
  const trackedRef = useRef(false);

  useEffect(() => {
    // Sadece figure_detail bağlamında ve posthog hazır olduğunda tetiklenir
    if (figure && figure.source_area === 'figure_detail' && posthog) {
      if (!trackedRef.current) {
         trackViewFigure(figure, posthog);
         trackedRef.current = true;
      }
    }
  }, [figure.figure_id, posthog]); // Sadece ID değiştiğinde (ve ilk mountta) çalışır, rerender'da tekrar çalışmaz.

  return null; // Arayüzü yok
}
