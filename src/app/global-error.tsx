'use client';

import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // Sentry'ye kritik altyapı çöküşlerini raporla
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="tr">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
           <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#D22B2B', fontWeight: 900 }}>Kritik Bir Hata Meydana Geldi</h1>
           <p style={{ color: '#666', marginBottom: '2rem' }}>Sistemdeki görünmez bir sorun sebebiyle teknik ekiplerimiz bilgilendirildi.</p>
           <button 
             onClick={() => window.location.href = '/'}
             style={{ padding: '10px 20px', backgroundColor: '#D22B2B', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
           >
             Ana Sayfaya Dön
           </button>
        </div>
      </body>
    </html>
  );
}
