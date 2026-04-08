'use client';

import { useEffect } from 'react';

interface ClientViewTrackerProps {
  table: string;
  id: string; // uuid
}

export default function ClientViewTracker({ table, id }: ClientViewTrackerProps) {
  useEffect(() => {
    // Component mount olduğunda (sayfa açıldığında) görüntülenmeyi 1 artır.
    const incrementView = async () => {
      // Doğrudan RPC yerine güvenli ve rate-limit korumalı Endpoint tetikleniyor
      try {
        await fetch('/api/track-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table, id })
        });
      } catch (err) {
        console.error('TrackView API Error:', err);
      }
    };
    
    // Her sayfaya giriş çıkışta mükerrer saymayı önlemek için SessionStorage kontrolü (ilk savunma hattı)
    const viewedKey = `viewed_${table}_${id}`;
    if (!sessionStorage.getItem(viewedKey)) {
      incrementView();
      sessionStorage.setItem(viewedKey, 'true');
    }
  }, [table, id]);

  return null; // Arayüzü yok, sadece görünmez sayaç tetikleyici
}
