'use client';

import { useEffect } from 'react';
import { trackViewFigure, FigureTrackingProps } from '@/lib/analytics';

interface AnalyticsViewTrackerProps {
  figure: FigureTrackingProps;
}

export default function AnalyticsViewTracker({ figure }: AnalyticsViewTrackerProps) {
  useEffect(() => {
    // Sadece figure_detail bağlamında tetiklenir, deduplication lib içinde ele alınır.
    if (figure && figure.source_area === 'figure_detail') {
      trackViewFigure(figure);
    }
  }, [figure.figure_id]); // Sadece ID değiştiğinde (ve ilk mountta) çalışır, rerender'da tekrar çalışmaz.

  return null; // Arayüzü yok
}
