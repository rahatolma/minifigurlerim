import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider';

export default function WelcomeBlock() {
  return (
    <section className="max-w-7xl mx-auto py-[64px] px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-0">
      <div className="w-full lg:w-1/2 space-y-8 pr-0 lg:pr-12">
        <h2 className="text-[36px] font-black tracking-tight leading-[43px] text-[#111]">
          Merhaba, Minifigürlerim<br />Websitesine Hoş Geldiniz!
        </h2>
        <div className="space-y-6 lg:max-w-xl">
          <p className="text-[#111] font-normal text-[16px] leading-[28px]">
            2010'dan beri tutkuyla biriktirdiğim LEGO® minifigürleri artık bu platformda sizlerle buluşturuyorum. Kendi koleksiyonumdan özenle çekilmiş fotoğraflar, her figüre dair bilgiler ve minifigür dünyasına dair ilham veren içerikler burada yer alacak.
          </p>
          <p className="text-[#111] font-normal text-[16px] leading-[28px]">
            Minifigürlerim, sadece benim koleksiyonumun sergilendiği bir alan değil; aynı zamanda bu hobiye gönül verenlerin buluşma noktası. <strong className="font-bold">Koleksiyonerler, meraklılar ve yeni başlayanlar</strong> için keyifle vakit geçirilecek, bilgi alınacak ve paylaşım yapılacak bir merkez olmasını hedefliyorum.
          </p>
          <p className="text-[#111] font-normal text-[16px] leading-[28px]">
            Burada minifigür sevgisini paylaşacak, yepyeni hikâyeler keşfedecek ve bu hobiye dair ilham alacaksınız.
          </p>
        </div>
        <div className="pt-4">
          <img src="/uploads/media__1774632782593.png" alt="Minifigür Hastası İmza" className="h-14 md:h-16 w-auto mix-blend-multiply opacity-90 -ml-2" />
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-12 lg:mt-0 lg:pl-10">
        <BeforeAfterSlider 
          beforeImage="/images/lego-art-before.png" 
          afterImage="/images/lego-art-after.png" 
        />
      </div>
    </section>
  );
}
