import React from 'react';
import { Link } from '@/i18n/routing';

export type LegalSection = {
  title: string;
  content: React.ReactNode;
};

export type LegalPageData = {
  title: string;
  intro: React.ReactNode;
  sections: LegalSection[];
};

export const legalContent: Record<string, Record<string, LegalPageData>> = {
  tr: {
    'gizlilik-politikasi': {
      title: 'Gizlilik Politikası',
      intro: (
        <>
          Minifigürlerim (“Platform”), kullanıcıların LEGO® minifigür koleksiyonlarını keşfetmelerine, incelemelerine ve dijital olarak takip etmelerine olanak tanıyan bağımsız bir koleksiyon platformudur.<br/><br/>
          Bu Gizlilik Politikası, platformu kullanırken hangi verilerin toplandığını, nasıl kullanıldığını ve nasıl korunduğunu açıklar.
        </>
      ),
      sections: [
        {
          title: 'Toplanan Veriler',
          content: (
            <>
              <p className="mb-4">Platform aşağıdaki verileri toplayabilir:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">E-posta adresi</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Kullanıcı adı</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Koleksiyon verileri (eklenen figürler, takip edilen içerikler vb.)</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Teknik veriler (IP adresi, cihaz bilgisi, tarayıcı türü)</li>
              </ul>
            </>
          )
        },
        {
          title: 'Verilerin Kullanım Amacı',
          content: (
             <>
              <p className="mb-4">Toplanan veriler:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Kullanıcı hesabı oluşturmak ve yönetmek</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Koleksiyon takibi ve kişiselleştirilmiş deneyim sunmak</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Platform performansını analiz etmek ve geliştirmek</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Güvenlik ve kötüye kullanım önleme amacıyla kullanılmaktadır</li>
              </ul>
             </>
          )
        },
        {
          title: 'Veri Paylaşımı',
          content: (
             <>
              <p className="mb-4">Minifigürlerim:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Kullanıcı verilerini üçüncü taraflara satmaz</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Reklam amaçlı paylaşmaz</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Yalnızca teknik servis sağlayıcılarla (hosting, analiz araçları vb.) sınırlı şekilde paylaşabilir</li>
              </ul>
             </>
          )
        },
        {
          title: 'Veri Güvenliği',
          content: <p>Platform, kullanıcı verilerini korumak için gerekli teknik ve idari önlemleri almaktadır. Ancak internet üzerinden veri iletiminin tamamen güvenli olduğu garanti edilemez.</p>
        },
        {
          title: 'Çerezler (Cookies)',
          content: <p>Platform, kullanıcı deneyimini geliştirmek ve analiz yapmak amacıyla çerezler kullanır. Detaylı bilgi için Çerez Politikası incelenebilir.</p>
        },
        {
          title: 'Kullanıcı Hakları',
          content: (
            <>
              <p className="mb-4">Kullanıcılar:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Hesaplarını silebilir</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Verilerinin silinmesini talep edebilir</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Veri işleme hakkında bilgi isteyebilir</li>
              </ul>
            </>
          )
        },
        {
          title: 'Değişiklikler',
          content: <p>Bu politika zaman zaman güncellenebilir. Güncel versiyon her zaman platform üzerinde yayınlanır.</p>
        }
      ]
    },
    'kullanim-kosullari': {
      title: 'Kullanım Koşulları',
      intro: 'Minifigürlerim, LEGO® minifigür koleksiyonuna odaklanan bağımsız bir içerik ve koleksiyon platformudur.',
      sections: [
        {
          title: 'Bağımsızlık Beyanı',
          content: (
            <>
              <p className="mb-4">Bu platform:</p>
              <ul className="list-none space-y-2 pl-4 mb-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">LEGO Group ile resmi bir bağlantıya sahip değildir</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">LEGO® ve ilgili tüm markalar, ilgili hak sahiplerine aittir</li>
              </ul>
              <p className="text-sm bg-[#FAFAFA] p-4 rounded-xl border border-gray-100 font-medium">
                Platformda yer alan marka isimleri ve referanslar yalnızca bilgilendirme amacıyla kullanılmaktadır.
              </p>
            </>
          )
        },
        {
          title: 'İçerik Kullanımı',
          content: (
            <>
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
            </>
          )
        },
        {
          title: 'Kullanım Şartları',
          content: (
            <>
              <p className="mb-4">Kullanıcılar:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Platformu yalnızca kişisel kullanım amacıyla kullanabilir</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">İçerikleri izinsiz çoğaltamaz, dağıtamaz veya ticari amaçla kullanamaz</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Platformu kötüye kullanamaz</li>
              </ul>
            </>
          )
        },
        {
          title: 'Sorumluluk Reddi',
          content: (
            <>
              <p className="mb-4">Platformda sunulan bilgiler:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Koleksiyon ve hobi amaçlıdır</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Yatırım tavsiyesi değildir</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Tam doğruluk garantisi verilmez</li>
              </ul>
            </>
          )
        },
        {
          title: 'Hesap Kullanımı',
          content: <p>Kullanıcılar hesap bilgilerinin güvenliğinden kendileri sorumludur.</p>
        },
        {
          title: 'Hizmet Değişiklikleri',
          content: <p>Minifigürlerim, platform içeriğini ve özelliklerini önceden bildirmeksizin değiştirme hakkını saklı tutar.</p>
        },
        {
          title: 'Hukuki Çerçeve',
          content: <p>Bu platform, ilgili fikri mülkiyet ve telif hakları mevzuatına uygun şekilde faaliyet göstermeyi amaçlar.</p>
        }
      ]
    },
    'uyelik-sozlesmesi': {
      title: 'Üyelik Sözleşmesi',
      intro: 'Minifigürlerim platformuna üye olan kullanıcılar aşağıdaki şartları kabul etmiş sayılır.',
      sections: [
        {
          title: 'Üyelik',
          content: <p>Kullanıcı, doğru ve güncel bilgiler ile kayıt olmayı kabul eder.</p>
        },
        {
          title: 'Kullanıcı Sorumluluğu',
          content: (
            <>
              <p className="mb-4">Kullanıcı:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Hesap güvenliğinden sorumludur</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Platformu kötüye kullanmamayı kabul eder</li>
              </ul>
            </>
          )
        },
        {
          title: 'Kullanım Hakları',
          content: (
            <>
              <p className="mb-4">Üyeler:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Koleksiyon oluşturabilir</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Figür ekleyebilir</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">İçerikleri inceleyebilir</li>
              </ul>
            </>
          )
        },
        {
          title: 'Yasaklı Davranışlar',
          content: (
            <ul className="list-none space-y-2 pl-4">
              <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Sistemi manipüle etmek</li>
              <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Sahte veri oluşturmak</li>
              <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Platforma zarar verecek eylemler</li>
            </ul>
          )
        },
        {
          title: 'Hesap Askıya Alma',
          content: <p>Minifigürlerim, kurallara aykırı davranan kullanıcıların hesaplarını askıya alma veya silme hakkını saklı tutar.</p>
        },
        {
          title: 'Hizmet Sürekliliği',
          content: <p>Platform kesintisiz hizmet garantisi vermez.</p>
        },
        {
          title: 'Güncellemeler',
          content: <p>Bu sözleşme zaman zaman güncellenebilir.</p>
        }
      ]
    },
    'hak-ihlali': {
      title: 'Hak İhlali Bildirimi',
      intro: 'İlgili içerik hak ihlali oluşturuyorsa bizimle iletişime geçebilirsiniz.',
      sections: [
        {
          title: '',
          content: (
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
          )
        }
      ]
    },
    'cerez-politikasi': {
      title: 'Çerez Politikası',
      intro: 'Bu Çerez Politikası, Minifigürlerim platformunda çerezlerin nasıl kullanıldığını açıklamaktadır.',
      sections: [
        {
          title: 'Çerez Nedir?',
          content: <p>Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınıza kaydedilen küçük veri dosyalarıdır.</p>
        },
        {
          title: 'Çerezleri Neden Kullanıyoruz?',
          content: (
            <ul className="list-none space-y-2 pl-4">
              <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Kullanıcı oturumunu yönetmek</li>
              <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Kişiselleştirilmiş bir deneyim sunmak</li>
              <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Site performansını analiz etmek</li>
            </ul>
          )
        },
        {
          title: 'Çerez Tercihlerini Yönetme',
          content: <p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz, ancak bu durumda platformun bazı özellikleri çalışmayabilir.</p>
        }
      ]
    }
  },
  en: {
    'gizlilik-politikasi': {
      title: 'Privacy Policy',
      intro: (
        <>
          Minifigürlerim (“Platform”) is an independent collection platform that allows users to discover, review, and digitally track their LEGO® minifigure collections.<br/><br/>
          This Privacy Policy explains what data is collected, how it is used, and how it is protected when using the platform.
        </>
      ),
      sections: [
        {
          title: 'Data Collected',
          content: (
            <>
              <p className="mb-4">The platform may collect the following data:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Email address</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Username</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Collection data (added figures, tracked items, etc.)</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Technical data (IP address, device info, browser type)</li>
              </ul>
            </>
          )
        },
        {
          title: 'Purpose of Data Use',
          content: (
             <>
              <p className="mb-4">Collected data is used to:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Create and manage user accounts</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Track collections and provide a personalized experience</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Analyze and improve platform performance</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Ensure security and prevent abuse</li>
              </ul>
             </>
          )
        },
        {
          title: 'Data Sharing',
          content: (
             <>
              <p className="mb-4">Minifigürlerim:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Does not sell user data to third parties</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Does not share data for advertising purposes</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">May share data in a limited capacity only with technical service providers (hosting, analytics tools, etc.)</li>
              </ul>
             </>
          )
        },
        {
          title: 'Data Security',
          content: <p>The platform takes necessary technical and administrative measures to protect user data. However, data transmission over the internet cannot be guaranteed to be entirely secure.</p>
        },
        {
          title: 'Cookies',
          content: <p>The platform uses cookies to improve user experience and conduct analysis. For detailed information, you can review our Cookie Policy.</p>
        },
        {
          title: 'User Rights',
          content: (
            <>
              <p className="mb-4">Users can:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Delete their accounts</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Request the deletion of their data</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Request information about data processing</li>
              </ul>
            </>
          )
        },
        {
          title: 'Changes',
          content: <p>This policy may be updated from time to time. The current version will always be published on the platform.</p>
        }
      ]
    },
    'kullanim-kosullari': {
      title: 'Terms of Use',
      intro: 'Minifigürlerim is an independent content and collection platform focused on LEGO® minifigure collecting.',
      sections: [
        {
          title: 'Statement of Independence',
          content: (
            <>
              <p className="mb-4">This platform:</p>
              <ul className="list-none space-y-2 pl-4 mb-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Has no official connection to the LEGO Group</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">LEGO® and all related trademarks belong to their respective rights holders</li>
              </ul>
              <p className="text-sm bg-[#FAFAFA] p-4 rounded-xl border border-gray-100 font-medium">
                Brand names and references on the platform are used for informational purposes only.
              </p>
            </>
          )
        },
        {
          title: 'Content Use',
          content: (
            <>
              <p className="mb-4">The following content found on the platform belongs to Minifigürlerim:</p>
              <ul className="list-none space-y-2 pl-4 mb-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Texts</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Reviews</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Original photographs</li>
              </ul>
              <p className="text-sm bg-[#FAFAFA] p-4 rounded-xl border border-gray-100 font-medium">
                Some product images and brand materials may belong to their respective right holders and are used solely for promotional and informational purposes.
              </p>
            </>
          )
        },
        {
          title: 'Terms of Use',
          content: (
            <>
              <p className="mb-4">Users:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">May use the platform for personal use only</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Cannot reproduce, distribute, or use content for commercial purposes without permission</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Must not abuse the platform</li>
              </ul>
            </>
          )
        },
        {
          title: 'Disclaimer',
          content: (
            <>
              <p className="mb-4">The information provided on the platform:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Is for collecting and hobby purposes</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Is not financial or investment advice</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Is not guaranteed to be completely accurate</li>
              </ul>
            </>
          )
        },
        {
          title: 'Account Usage',
          content: <p>Users are responsible for the security of their account information.</p>
        },
        {
          title: 'Service Modifications',
          content: <p>Minifigürlerim reserves the right to modify the platform content and features without prior notice.</p>
        },
        {
          title: 'Legal Framework',
          content: <p>This platform aims to operate in compliance with relevant intellectual property and copyright legislation.</p>
        }
      ]
    },
    'uyelik-sozlesmesi': {
      title: 'Membership Agreement',
      intro: 'Users who register on the Minifigürlerim platform are deemed to have accepted the following terms.',
      sections: [
        {
          title: 'Membership',
          content: <p>The user agrees to register with accurate and up-to-date information.</p>
        },
        {
          title: 'User Responsibility',
          content: (
            <>
              <p className="mb-4">The user:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Is responsible for account security</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Agrees not to abuse the platform</li>
              </ul>
            </>
          )
        },
        {
          title: 'Usage Rights',
          content: (
            <>
              <p className="mb-4">Members can:</p>
              <ul className="list-none space-y-2 pl-4">
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Create a collection</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Add figures</li>
                <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Review content</li>
              </ul>
            </>
          )
        },
        {
          title: 'Prohibited Actions',
          content: (
            <ul className="list-none space-y-2 pl-4">
              <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Manipulating the system</li>
              <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Creating fake data</li>
              <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">Actions that will harm the platform</li>
            </ul>
          )
        },
        {
          title: 'Account Suspension',
          content: <p>Minifigürlerim reserves the right to suspend or delete the accounts of users who violate the rules.</p>
        },
        {
          title: 'Service Continuity',
          content: <p>The platform does not guarantee uninterrupted service.</p>
        },
        {
          title: 'Updates',
          content: <p>This agreement may be updated from time to time.</p>
        }
      ]
    },
    'hak-ihlali': {
      title: 'Rights Violation Notice',
      intro: 'If you believe any content constitutes a rights violation, you can contact us.',
      sections: [
        {
          title: '',
          content: (
            <div className="bg-[#FAFAFA] p-8 sm:p-10 rounded-[20px] border border-gray-100 flex flex-col gap-6 items-start">
              <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center shrink-0">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                </span>
                DMCA / Contact Portal
              </h2>
              <p className="text-gray-600 font-medium leading-relaxed">
                If you believe that any content on the platform violates your trademark, copyright, or usage rights, please notify us with details. We will review it and take necessary actions as soon as possible.
              </p>
              
              <Link href="/iletisim" className="mt-2 flex items-center justify-center gap-2 bg-[#D22B2B] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-[#B22222] transition-all hover:-translate-y-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Go to Contact Form
              </Link>
            </div>
          )
        }
      ]
    },
    'cerez-politikasi': {
      title: 'Cookie Policy',
      intro: 'This Cookie Policy explains how cookies are used on the Minifigürlerim platform.',
      sections: [
        {
          title: 'What is a Cookie?',
          content: <p>Cookies are small data files saved to your browser when you visit our website.</p>
        },
        {
          title: 'Why Do We Use Cookies?',
          content: (
            <ul className="list-none space-y-2 pl-4">
              <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">To manage user sessions</li>
              <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">To provide a personalized experience</li>
              <li className="flex items-center gap-3 before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-[#D22B2B]/50">To analyze site performance</li>
            </ul>
          )
        },
        {
          title: 'Managing Cookie Preferences',
          content: <p>You can delete or block cookies from your browser settings, but in this case, some features of the platform may not work properly.</p>
        }
      ]
    }
  }
};
