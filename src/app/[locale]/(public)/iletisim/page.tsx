import ContactForm from "@/components/ui/ContactForm";
import { getActiveFaqs } from "@/services/dal";

export const metadata = {
  title: 'İletişim | Minifigürlerim',
  description: 'Bizimle iletişime geçin. Her türlü soru, görüş ve önerileriniz için buradayız.',
};

export const revalidate = 86400; // FAQs can change dynamically

export default async function ContactPage() {
  const faqs = await getActiveFaqs();
  const activeFaqs = faqs || [];

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-32">


      <div className="max-w-4xl mx-auto px-6 md:px-8 mt-8 mb-24 flex flex-col gap-16">
         
         <div className="w-full">
            <div className="bg-white border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] rounded-[32px] p-8 md:p-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Sorunuz Mu Var?</h1>
                    <p className="text-gray-600 text-[15px] font-medium leading-relaxed max-w-2xl mx-auto">Her türlü soru, görüş ve öneri için bize aşağıdaki iletişim formundan ulaşabilirsiniz. En kısa sürede dönüş yapacağız.</p>
                </div>
                <ContactForm />
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
    </div>
  );
}
