import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ShieldAlert } from 'lucide-react';

export default async function BannedPage() {
  const t = await getTranslations('Navigation');
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
         <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
        Hesabınız Yasaklanmıştır
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
        Sistem kurallarını ihlal ettiğiniz gerekçesiyle hesabınızın koleksiyon, borsa ve yorum özellikleri sistem yöneticileri tarafından kalıcı veya geçici olarak durdurulmuştur. Eğer bunun bir hata olduğunu düşünüyorsanız, iletişim formu üzerinden bizimle irtibata geçebilirsiniz.
      </p>
      <Link href="/" className="inline-flex items-center justify-center bg-gray-900 text-white font-black uppercase tracking-widest text-sm px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg">
         Ana Sayfaya Dön
      </Link>
    </div>
  );
}
