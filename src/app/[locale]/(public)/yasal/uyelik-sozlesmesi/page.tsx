import { Metadata } from 'next';
import { legalContent } from '@/content/legal/legalContent';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale || 'tr';
  const data = legalContent[locale]['uyelik-sozlesmesi'];
  
  const trPath = `/tr/yasal/uyelik-sozlesmesi`;
  const enPath = `/en/legal/membership-agreement`;
  const canonicalUrl = locale === 'en' ? enPath : trPath;

  return {
    title: `${data.title} | Minifigürlerim`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'tr-TR': trPath,
        'en-US': enPath
      }
    }
  };
}

export default async function MembershipAgreementPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale || 'tr';
  const data = legalContent[locale]['uyelik-sozlesmesi'];

  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black mb-8 pb-6 border-b border-gray-100">
        {data.title}
      </h1>
      
      <p className="text-lg font-medium text-gray-500 mb-10">
        {data.intro}
      </p>

      {data.sections.map((section, index) => (
        <section key={index} className="mb-10">
          {section.title === '' ? (
             section.content
          ) : (
            <>
              <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#D22B2B]/10 text-[#D22B2B] flex items-center justify-center text-sm font-black">{index + 1}</span>
                {section.title}
              </h2>
              {section.content}
            </>
          )}
        </section>
      ))}
    </>
  );
}
