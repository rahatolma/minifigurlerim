import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Üyelik Sözleşmesi | Minifigürlerim',
};

export default function MembershipAgreementPage() {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black mb-8 pb-6 border-b border-gray-100">
        Üyelik Sözleşmesi
      </h1>
      
      <p className="text-lg font-medium text-gray-500 mb-10">
        Minifigürlerim platformuna üye olan kullanıcılar aşağıdaki şartları kabul etmiş sayılır.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">1</span>
          Üyelik
        </h2>
        <p>Kullanıcı, doğru ve güncel bilgiler ile kayıt olmayı kabul eder.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">2</span>
          Kullanıcı Sorumluluğu
        </h2>
        <p className="mb-4">Kullanıcı:</p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Hesap güvenliğinden sorumludur</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Platformu kötüye kullanmamayı kabul eder</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">3</span>
          Kullanım Hakları
        </h2>
        <p className="mb-4">Üyeler:</p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Koleksiyon oluşturabilir</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Figür ekleyebilir</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">İçerikleri inceleyebilir</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">4</span>
          Yasaklı Davranışlar
        </h2>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Sistemi manipüle etmek</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Sahte veri oluşturmak</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Platforma zarar verecek eylemler</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">5</span>
          Hesap Askıya Alma
        </h2>
        <p>
          Minifigürlerim, kurallara aykırı davranan kullanıcıların hesaplarını askıya alma veya silme hakkını saklı tutar.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">6</span>
          Hizmet Sürekliliği
        </h2>
        <p>Platform kesintisiz hizmet garantisi vermez.</p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">7</span>
          Güncellemeler
        </h2>
        <p>Bu sözleşme zaman zaman güncellenebilir.</p>
      </section>
    </>
  );
}
