import Link from 'next/link';
import LegoHeadIcon from '@/components/ui/icons/LegoHeadIcon';

export default function AuthCTA() {
  return (
    <div className="w-full relative overflow-hidden bg-gray-900 rounded-3xl p-8 md:p-12 shadow-[0_15px_40px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center text-center group border border-gray-800">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#D22B2B]/20 blur-[60px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-[#D22B2B]/30"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600/10 blur-[50px] rounded-full pointer-events-none"></div>

      {/* Icon */}
      <div className="relative z-10 w-16 h-16 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
        <LegoHeadIcon mode="happy" className="w-10 h-10" color="text-yellow-400" />
      </div>

      {/* Main Copy */}
      <h2 className="relative z-10 text-3xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-sm">
        Koleksiyonunu oluştur. İlerlemeni takip et.
      </h2>

      {/* CTA Button */}
      <div className="relative z-10 mt-6 mb-8 w-full md:w-auto">
        <Link 
          href="/login"
          className="relative overflow-hidden inline-flex items-center justify-center bg-[#D22B2B] text-white font-black text-[13px] tracking-[0.15em] uppercase py-4 px-12 rounded-xl hover:bg-red-600 transition-all duration-300 shadow-[0_0_20px_rgba(210,43,43,0.4)] hover:shadow-[0_0_30px_rgba(210,43,43,0.6)] group/btn w-full md:w-auto transform hover:-translate-y-1"
        >
          <span className="relative z-10">Erişim Aç</span>
          {/* Button shine effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
        </Link>
      </div>

      {/* Bonus Trust Copy */}
      <div className="relative z-10 flex items-center justify-center gap-4 text-[11px] md:text-[13px] font-bold text-gray-400 tracking-wide">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#D22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          1000+ Figür
        </span>
        <span className="text-gray-600">•</span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#D22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          25+ Seri
        </span>
        <span className="text-gray-600">•</span>
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#D22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          Sürekli güncellenen veri
        </span>
      </div>
    </div>
  );
}
