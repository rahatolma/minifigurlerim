import LegalSidebar from "@/components/layout/LegalSidebar";


export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#fcfcfc] min-h-[calc(100vh-300px)] relative flex flex-col">
      {/* Decorative background elements wrapped in overflow-hidden to allow sticky to work! */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#f0f0f0] to-[#fcfcfc]" />
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-[#D22B2B]/[0.02] rounded-full blur-3xl" />
      </div>
      

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 w-full mt-8 mb-24 flex-1">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar Menu */}
          <div className="w-full lg:w-1/4 lg:sticky lg:top-44 shrink-0 self-start z-10">
             <LegalSidebar />
          </div>

          {/* Right Content Area */}
          <div className="w-full lg:w-3/4 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-8 sm:p-12 md:p-16 relative overflow-hidden">
            {/* Subtle top indicator line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D22B2B] to-[#F2CD37]" />
            
            <div className="legal-content text-gray-700 leading-relaxed text-[15px] sm:text-[16px]">
              {children}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
