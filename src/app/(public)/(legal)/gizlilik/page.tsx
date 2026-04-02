import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | Minifigürlerim',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black mb-8 pb-6 border-b border-gray-100">
        Gizlilik Politikası
      </h1>
      
      <p className="text-lg font-medium text-gray-500 mb-10">
        Minifigürlerim (“Platform”), kullanıcıların LEGO® minifigür koleksiyonlarını keşfetmelerine, incelemelerine ve dijital olarak takip etmelerine olanak tanıyan bağımsız bir koleksiyon platformudur.<br/><br/>
        Bu Gizlilik Politikası, platformu kullanırken hangi verilerin toplandığını, nasıl kullanıldığını ve nasıl korunduğunu açıklar.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">1</span>
          Toplanan Veriler
        </h2>
        <p className="mb-4">Platform aşağıdaki verileri toplayabilir:</p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">E-posta adresi</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Kullanıcı adı</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Koleksiyon verileri (eklenen figürler, takip edilen içerikler vb.)</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Teknik veriler (IP adresi, cihaz bilgisi, tarayıcı türü)</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">2</span>
          Verilerin Kullanım Amacı
        </h2>
        <p className="mb-4">Toplanan veriler:</p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Kullanıcı hesabı oluşturmak ve yönetmek</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Koleksiyon takibi ve kişiselleştirilmiş deneyim sunmak</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Platform performansını analiz etmek ve geliştirmek</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Güvenlik ve kötüye kullanım önleme amacıyla kullanılmaktadır</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">3</span>
          Veri Paylaşımı
        </h2>
        <p className="mb-4">Minifigürlerim:</p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Kullanıcı verilerini üçüncü taraflara satmaz</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Reklam amaçlı paylaşmaz</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Yalnızca teknik servis sağlayıcılarla (hosting, analiz araçları vb.) sınırlı şekilde paylaşabilir</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">4</span>
          Veri Güvenliği
        </h2>
        <p>
          Platform, kullanıcı verilerini korumak için gerekli teknik ve idari önlemleri almaktadır. Ancak internet üzerinden veri iletiminin tamamen güvenli olduğu garanti edilemez.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">5</span>
          Çerezler (Cookies)
        </h2>
        <p>
          Platform, kullanıcı deneyimini geliştirmek ve analiz yapmak amacıyla çerezler kullanır. Detaylı bilgi için Çerez Politikası incelenebilir.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">6</span>
          Kullanıcı Hakları
        </h2>
        <p className="mb-4">Kullanıcılar:</p>
        <ul className="list-none space-y-2 pl-4">
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Hesaplarını silebilir</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Verilerinin silinmesini talep edebilir</li>
          <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Veri işleme hakkında bilgi isteyebilir</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">7</span>
          Değişiklikler
        </h2>
        <p>
          Bu politika zaman zaman güncellenebilir. Güncel versiyon her zaman platform üzerinde yayınlanır.
        </p>
      </section>
    </>
  );
}
