import { Link } from '@/i18n/routing';
import LegalNoticeButton from '@/components/ui/LegalNoticeButton';
import FooterNewsletterForm from '@/components/ui/FooterNewsletterForm';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const tNav = useTranslations('Navigation');
  const tFooter = useTranslations('Footer');
  
  return (
    <footer className="hidden md:block bg-[#F8F9FA] text-black w-full pt-24 pb-12 mt-auto relative border-t border-gray-100">
      <div className="max-w-[1300px] mx-auto px-6 md:px-8">
        
        {/* UPPER FOOTER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-12 mb-12 relative">
          
          {/* BLOK 1: Logo & Haber Bülteni */}
          <div className="flex flex-col items-start md:col-span-5 lg:col-span-4">
            <Link href="/" className="inline-block transform hover:scale-105 transition-transform mb-8">
              <img src="/images/site-logo.png" alt="Minifigürlerim Logo" className="h-[36px] w-auto" />
            </Link>
            <p className="text-[14px] text-gray-700 font-bold leading-relaxed pr-4">
              {tFooter('NewsletterText')}
            </p>
            <FooterNewsletterForm />
          </div>

          {/* BLOK 2: Keşfet */}
          <div className="flex flex-col gap-6 md:col-span-3 lg:col-span-3 lg:pl-4">
            <h4 className="text-[14px] font-black tracking-widest text-[#D22B2B]">{tFooter('NavigationHeading')}</h4>
            <ul className="flex flex-col gap-3.5 font-bold text-[15px] text-gray-700 w-full whitespace-nowrap">
              <li><Link href="/seriler" className="hover:text-black hover:underline transition-all">{tNav('Series')}</Link></li>
              <li><Link href="/figurler" className="hover:text-black hover:underline transition-all">{tNav('Figures')}</Link></li>
              <li><Link href="/lego-hakkinda" className="hover:text-black hover:underline transition-all">{tNav('AboutLego')}</Link></li>
              <li><Link href="/hakkimizda" className="hover:text-black hover:underline transition-all">{tNav('AboutUs')}</Link></li>
              <li><Link href="/haberler" className="hover:text-black hover:underline transition-all">{tNav('Blog')}</Link></li>
              <li><Link href="/iletisim" className="hover:text-black hover:underline transition-all">{tNav('Contact')}</Link></li>
            </ul>
          </div>

          {/* BLOK 3: Destek & Sosyal */}
          <div className="flex flex-col gap-6 md:col-span-4 lg:col-span-3 lg:pl-2">
            <h4 className="text-[14px] font-black tracking-widest text-[#D22B2B]">{tFooter('LegalHeading')}</h4>
            <ul className="flex flex-col gap-3.5 font-bold text-[15px] text-gray-700 mb-2 w-full whitespace-nowrap">
              <li><Link href="/yasal/gizlilik-politikasi" className="hover:text-black hover:underline transition-all">{tFooter('PrivacyPolicy')}</Link></li>
              <li><Link href="/yasal/kullanim-kosullari" className="hover:text-black hover:underline transition-all">{tFooter('TermsOfUse')}</Link></li>
              <li><Link href="/yasal/uyelik-sozlesmesi" className="hover:text-black hover:underline transition-all">{tFooter('MembershipAgreement')}</Link></li>
              <li><Link href="/yasal/hak-ihlali" className="hover:text-black hover:underline transition-all">{tFooter('CopyrightViolation')}</Link></li>
            </ul>
            
            <div className="flex gap-4 mt-2">
               {/* Instagram */}
               <a href="https://instagram.com/minifigurlerim" target="_blank" rel="noreferrer" className="w-[42px] h-[42px] bg-[#fcfcfc] rounded-2xl flex items-center justify-center text-gray-900 border border-gray-200 hover:bg-[#D22B2B] hover:text-white hover:border-[#D22B2B] transition-all shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
               </a>
               {/* Youtube */}
               <a href="https://youtube.com/@minifigurlerim" target="_blank" rel="noreferrer" className="w-[42px] h-[42px] bg-[#fcfcfc] rounded-2xl flex items-center justify-center text-gray-900 border border-gray-200 hover:bg-[#D22B2B] hover:text-white hover:border-[#D22B2B] transition-all shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
               </a>
               {/* İletişim (Mail Icon) */}
               <Link href="/iletisim" className="w-[42px] h-[42px] bg-[#D22B2B] rounded-2xl flex items-center justify-center text-white shadow-md hover:bg-[#B22222] transition-all border border-[#cc2424]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
               </Link>
            </div>
          </div>

          {/* BLOK 4: Image - Only visible on lg+ screens for precise layout */}
          <div className="hidden lg:flex flex-col items-center justify-end lg:col-span-2 relative h-full">
            <img 
              src="/images/footer-lego-guy.png" 
              alt="LEGO Contact Minifigure" 
              className="absolute bottom-[-16px] right-0 w-[240px] max-w-none object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)] z-10"
              style={{ pointerEvents: "none" }}
            />
          </div>

        </div>

        {/* BOTTOM FOOTER GRID */}
        <div className="relative z-20 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between pt-10 pb-4 gap-6">
          <p className="text-[#a0a0a0] text-center md:text-left text-[14px] font-semibold tracking-wide">
            {tFooter('CopyrightText')} <br className="md:hidden"/> <span className="text-gray-900 font-black">{tFooter('BrandText')}</span>
           <br />
           <span className="text-gray-600 font-semibold">{tFooter('BrandSubText')}</span>
          </p>
          <LegalNoticeButton className="bg-[#F2CD37] text-black border border-[#d4b32c] font-black py-4 px-8 rounded-xl shadow-[0_8px_20px_rgba(242,205,55,0.3)] hover:bg-[#e0bd31] hover:scale-105 hover:shadow-[0_12px_25px_rgba(242,205,55,0.4)] transition-all tracking-[0.2em] uppercase text-[11px]" />
        </div>

      </div>
    </footer>
  );
}
