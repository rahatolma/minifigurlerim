export default function MaintenancePage() {
  return (
    <main className="flex-1 w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#D22B2B]/20 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
        <img src="/images/site-logo.png" alt="Minifigürlerim" className="h-12 md:h-16 mb-10 invert opacity-90" />
        <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Çok Yakında Yayında</h1>
        <p className="text-gray-400 text-lg md:text-xl font-semibold leading-relaxed">
          Koleksiyonerler için kapsamlı minifigür platformu hazırlanıyor.
        </p>
        
        {/* Decorative elements */}
        <div className="mt-12 flex gap-4 opacity-50">
           <div className="w-16 h-1.5 bg-[#D22B2B] rounded-full" />
           <div className="w-4 h-1.5 bg-[#D22B2B] rounded-full" />
           <div className="w-4 h-1.5 bg-[#D22B2B] rounded-full" />
        </div>
      </div>
    </main>
  );
}
