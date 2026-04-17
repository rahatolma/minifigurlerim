'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Mimari Kural 4: Logging Standardı
    // Sentry veya log sistemine anında yazılır, 500 dönen hatanın root cause'u raporlanır
    console.error('[Public Boundary Error]:', error);
    Sentry.withScope((scope) => {
      scope.setTag('boundary', 'public_layout');
      scope.setLevel('fatal');
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <div className="w-full flex-col overflow-hidden min-h-[60vh] flex items-center justify-center p-8 bg-[#fcfcfc]">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-8 md:p-12 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-red-50 text-[#D22B2B] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Sistemsel Bir Hata Oluştu!</h2>
        <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
          Bu kısmı hemen onarmamız için mühendislik ekibine rapor eklendi. Gecikme için özür dileriz.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-gray-900 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-black transition-colors"
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 font-bold py-3 px-8 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
        
        {/* Sadece DEV ortamında error root cause analizi için vizibilite */}
        {process.env.NODE_ENV !== 'production' && (
           <div className="mt-8 p-4 bg-gray-50 border border-red-100 rounded-xl text-left overflow-x-auto text-xs font-mono text-red-500 opacity-80 break-words">
              <strong>Dev Yalnızlı Hata Çıktısı:</strong><br/>
              {error?.message || "Bilinmeyen hata"}
           </div>
        )}
      </div>
    </div>
  );
}
