import Link from 'next/link';
import './globals.css';

export default function NotFound() {
  return (
    <html>
      <body className="min-h-screen w-full bg-[#fcfcfc] flex items-center justify-center p-6 m-0 font-sans">
        <div className="bg-white max-w-md w-full p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center flex flex-col items-center">
        {/* Warning Icon Container */}
        <div className="w-20 h-20 bg-amber-50 rounded-[20px] flex items-center justify-center mb-8 -rotate-3 border border-amber-100">
          <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
          404 - Sayfa Bulunamadı<br />
          <span className="text-lg text-gray-500 font-bold">Page Not Found</span>
        </h1>
        
        <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
          Aradığınız sayfa silinmiş, ismi değiştirilmiş veya geçici olarak ulaşılamıyor olabilir. <br /><br />
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link 
            href="/"
            className="w-full bg-[#D22B2B] hover:bg-black text-white text-sm font-bold tracking-widest uppercase py-4 rounded-2xl transition-all shadow-md hover:shadow-xl hover:-translate-y-1 block"
          >
            Ana Sayfa'ya Dön <span className="opacity-70 mx-1">/</span> Back to Home
          </Link>
        </div>
      </div>
      </body>
    </html>
  );
}
