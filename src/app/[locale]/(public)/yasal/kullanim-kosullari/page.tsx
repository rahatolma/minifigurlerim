import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | Minifigürlerim',
};

export default function TermsOfUsePage() {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black mb-8 pb-6 border-b border-gray-100">
        Kullanım Koşulları
      </h1>
      
      <p className="text-lg font-medium text-gray-500 mb-10">
        Minifigürlerim, LEGO® minifigür koleksiyonuna odaklanan bağımsız bir içerik ve koleksiyon platformudur.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">1</span>
          Bağımsızlık Beyanı
        </h2>
        <p className="mb-4">Bu platform:</p>
        <ul className="list-none space-y-2 pl-4 mb-4">
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">LEGO Group ile resmi bir bağlantıya sahip değildir</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">LEGO® ve ilgili tüm markalar, ilgili hak sahiplerine aittir</li>
        </ul>
        <p className="text-sm bg-[#FAFAFA] p-4 rounded-xl border border-gray-100 font-medium">
          Platformda yer alan marka isimleri ve referanslar yalnızca bilgilendirme amacıyla kullanılmaktadır.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">2</span>
          İçerik Kullanımı
        </h2>
        <p className="mb-4">Platformda bulunan:</p>
        <ul className="list-none space-y-2 pl-4 mb-4">
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Metinler</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">İncelemeler</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Özgün fotoğraflar</li>
        </ul>
        <p className="font-black text-black mb-4">Minifigürlerim’e aittir.</p>
        <p className="text-sm bg-[#FAFAFA] p-4 rounded-xl border border-gray-100 font-medium">
          Bazı ürün görselleri ve marka materyalleri ilgili hak sahiplerine ait olabilir ve yalnızca tanıtım ve bilgilendirme amacıyla kullanılır.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">3</span>
          Kullanım Şartları
        </h2>
        <p className="mb-4">Kullanıcılar:</p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Platformu yalnızca kişisel kullanım amacıyla kullanabilir</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">İçerikleri izinsiz çoğaltamaz, dağıtamaz veya ticari amaçla kullanamaz</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Platformu kötüye kullanamaz</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">4</span>
          Sorumluluk Reddi
        </h2>
        <p className="mb-4">Platformda sunulan bilgiler:</p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Koleksiyon ve hobi amaçlıdır</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Yatırım tavsiyesi değildir</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Tam doğruluk garantisi verilmez</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">5</span>
          Hesap Kullanımı
        </h2>
        <p>
          Kullanıcılar hesap bilgilerinin güvenliğinden kendileri sorumludur.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">6</span>
          Hizmet Değişiklikleri
        </h2>
        <p>
          Minifigürlerim, platform içeriğini ve özelliklerini önceden bildirmeksizin değiştirme hakkını saklı tutar.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">7</span>
          Hukuki Çerçeve
        </h2>
        <p>
          Bu platform, ilgili fikri mülkiyet ve telif hakları mevzuatına uygun şekilde faaliyet göstermeyi amaçlar.
        </p>
      </section>
    </>
  );
}
