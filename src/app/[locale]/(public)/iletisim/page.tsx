import ContactForm from "@/components/ui/ContactForm";
import FeedbackForm from "@/components/ui/FeedbackForm";
import { getActiveFaqs } from "@/services/dal";
import InstagramBlock from "@/components/ui/InstagramBlock";

export const metadata = {
  title: 'İletişim | Minifigürlerim',
  description: 'Bizimle iletişime geçin. Her türlü soru, görüş ve önerileriniz için buradayız.',
};

export const revalidate = 86400; // FAQs can change dynamically

export default async function ContactPage() {
  const faqs = await getActiveFaqs();
  const activeFaqs = faqs || [];

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-16">


      <div className="max-w-7xl mx-auto px-6 md:px-8 mt-8 mb-8 flex flex-col gap-8">
         
         {/* 1/3 and 2/3 Layout for Forms */}
         <div className="flex flex-col md:flex-row w-full gap-6 md:gap-10 items-stretch min-h-[500px]">
            {/* SOL Taraf: Geri Bildirim Formu */}
            <div className="w-full md:w-1/3 bg-white rounded-[32px] p-8 md:p-12 text-gray-900 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -left-12 -bottom-12 opacity-5 scale-150 -rotate-[15deg] transition-all duration-700 ease-out pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </div>
                <div className="relative z-10 flex-1 flex flex-col">
                  <FeedbackForm />
                </div>
            </div>

            {/* SAĞ Taraf: İletişim Formu */}
            <div className="w-full md:w-2/3 bg-white rounded-[32px] p-8 md:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden flex flex-col">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">Sorunuz Mu Var?</h1>
                    <p className="text-gray-600 text-[13px] font-medium leading-relaxed max-w-xl">Her türlü soru, görüş ve öneri için bize aşağıdaki iletişim formundan ulaşabilirsiniz. En kısa sürede dönüş yapacağız.</p>
                </div>
                <div className="relative z-10 flex-1 flex flex-col">
                  <ContactForm />
                </div>
            </div>
         </div>

         <div className="w-full">
            {activeFaqs.length > 0 ? (
               <div className="bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-[32px] p-8 md:p-12 border-t-4 border-t-[#D22B2B]">
                  <h2 className="text-3xl font-black text-center text-gray-900 mb-10 tracking-tight">Sıkça Sorulan Sorular</h2>
                  <div className="space-y-3">
                      {activeFaqs.map((faq: import("@/services/dal").FaqDTO, idx: number) => (
                          <details key={faq.id} className="group border border-gray-100 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                              <summary className="w-full text-left py-5 px-6 font-bold text-[15px] text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer select-none">
                                  <span className="flex gap-4 items-center">
                                     <span className="text-[12px] font-black text-gray-400">{(idx + 1).toString().padStart(2, '0')}</span>
                                     <span className="leading-snug pr-4">{faq.question}</span>
                                  </span>
                                  <span className="text-2xl text-gray-300 font-light group-open:rotate-45 group-hover:text-[#D22B2B] transition-all duration-300 shrink-0 flex justify-end">+</span>
                              </summary>
                              <div className="py-5 bg-gray-50/50 text-gray-600 font-medium text-[14px] leading-relaxed px-6 border-t border-gray-100">
                                  {faq.answer}
                              </div>
                          </details>
                      ))}
                  </div>
               </div>
            ) : null}
         </div>

      </div>

      {/* Instagram Bloğu (Full Width / Max-7xl) */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 mb-8">
         <InstagramBlock />
      </div>
    </div>
  );
}
