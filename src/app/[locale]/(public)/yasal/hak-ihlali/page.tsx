import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hak İhlali Bildirimi | Minifigürlerim',
};

export default function DMCA() {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black mb-8 pb-6 border-b border-gray-100">
        Hak İhlali Bildirimi
      </h1>
      
      <p className="text-lg font-medium text-gray-500 mb-10">
        İlgili içerik hak ihlali oluşturuyorsa bizimle iletişime geçebilirsiniz.
      </p>

      <section>
        <div className="bg-[#FAFAFA] p-8 sm:p-10 rounded-[20px] border border-gray-100 flex flex-col gap-6 items-start">
           <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center shrink-0">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
              </span>
              DMCA / İletişim Kapısı
           </h2>
           <p className="text-gray-600 font-medium leading-relaxed">
             Platform üzerinde yer alan herhangi bir içeriğin marka, telif veya kullanım haklarınızı ihlal ettiğini düşünüyorsanız, lütfen durumu detaylarıyla birlikte bize bildirin. En kısa sürede inceleyip gerekli işlemleri yapacağız.
           </p>
           
           <Link href="/iletisim" className="mt-2 flex items-center justify-center gap-2 bg-[#D22B2B] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-[#B22222] transition-all hover:-translate-y-1">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
             İletişim Formuna Git
           </Link>
        </div>
      </section>
    </>
  );
}
