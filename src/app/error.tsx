'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error using our standard format
    console.error(JSON.stringify({
      code: 'GLOBAL_RENDER_ERROR',
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString()
    }));
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#fcfcfc] flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center flex flex-col items-center">
        {/* Warning Icon Container */}
        <div className="w-20 h-20 bg-red-50 rounded-[20px] flex items-center justify-center mb-8 rotate-3 border border-red-100">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
          Beklenmeyen Bir Hata
        </h1>
        
        <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
          Sistemsel bir pürüz yaşadık. Merak etmeyin, altyapı ekibimize (loglarımıza) anında ping gönderildi.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={() => reset()}
            className="w-full bg-[#111] hover:bg-black text-white text-sm font-bold tracking-widest uppercase py-4 rounded-2xl transition-all shadow-md hover:shadow-xl hover:-translate-y-1"
          >
            Tekrar Dene
          </button>
          
          <Link 
            href="/"
            className="w-full bg-white hover:bg-gray-50 text-gray-900 text-sm font-bold tracking-widest uppercase py-4 rounded-2xl transition-all border-2 border-gray-100 shadow-sm hover:border-gray-200"
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
