import ContactForm from "@/components/ui/ContactForm";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: 'İletişim | Minifigürlerim',
  description: 'Bizimle iletişime geçin. Her türlü soru, görüş ve önerileriniz için buradayız.',
};

export const revalidate = 0; // FAQs can change dynamically

export default async function ContactPage() {
  const supabase = await createClient();
  
  // Sıkça Sorulan Soruları Çek
  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const activeFaqs = faqs || [];

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-32">
      {/* 🧱 ÜST BLOĞU: Şablon Breadcrumb (İz Yolu) */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex items-center text-[10px] sm:text-[11px] font-black text-gray-400 tracking-[0.2em] uppercase" style={{ minHeight: '70px' }}>
             <a href="/" className="hover:text-black transition-colors">Ana Sayfa</a> 
             <span className="mx-3 text-gray-200">/</span> 
             <span className="text-gray-900">İLETİŞİM</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-10 mb-24 flex justify-center">
        <div className="w-full max-w-3xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-black text-black">Sorunuz Mu Var?</h1>
                <p className="text-gray-700 mt-4 text-[15px] font-medium leading-relaxed">Her türlü soru, görüş ve öneri için bize aşağıdaki iletişim formundan ulaşabilirsiniz:</p>
            </div>

            <ContactForm />
        </div>
      </div>

      {/* SIKÇA SORULAN SORULAR */}
      {activeFaqs.length > 0 && (
          <div className="max-w-7xl mx-auto px-8 mt-32 flex justify-center">
            <div className="w-full max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-black">Sıkça Sorulan Sorular</h2>
                </div>
                
                {/* Gerçek Akordiyon Yapısı - HTML5 details / summary logicle state gerektirmez */}
                <div className="space-y-4">
                    {activeFaqs.map((faq) => (
                        <details key={faq.id} className="group border border-gray-200 bg-white rounded-sm overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                            <summary className="w-full text-left px-6 py-5 font-bold text-[15px] text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer select-none">
                                {faq.question}
                                <span className="text-2xl text-gray-300 font-light group-open:rotate-45 transition-transform duration-300">+</span>
                            </summary>
                            <div className="px-6 py-4 pt-0 text-gray-600 font-medium text-[14px] leading-relaxed border-t border-gray-100 bg-gray-50/50">
                                {faq.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
          </div>
      )}

    </div>
  );
}
