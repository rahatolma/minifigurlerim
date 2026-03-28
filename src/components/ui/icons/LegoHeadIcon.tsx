export default function LegoHeadIcon({ 
  className = "w-24 h-24", 
  mode = "sad",
  color = "text-gray-200"
}: { 
  className?: string, 
  mode?: "sad" | "happy" | "search" | "neutral" | "eye" | "fire",
  color?: string 
}) {
  return (
    <svg viewBox="0 0 120 120" className={`${className} ${color}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top Stud (Boyun veya Kafa Çıkıntısı) */}
      <path d="M43 28C43 25.7909 44.7909 24 47 24H73C75.2091 24 77 25.7909 77 28V34H43V28Z" fill="currentColor" />
      
      {/* Main Head (Ana Kafa Silindiri) */}
      <path d="M28 50C28 41.1634 35.1634 34 44 34H76C84.8366 34 92 41.1634 92 50V78C92 86.8366 84.8366 94 76 94H44C35.1634 94 28 86.8366 28 78V50Z" fill="currentColor" />
      
      {/* Yüz İfadeleri (Beyaz/Saydam Kesikler) */}
      {mode === 'sad' && (
        <>
          <circle cx="48" cy="56" r="6" fill="#fcfcfc" />
          <circle cx="72" cy="56" r="6" fill="#fcfcfc" />
          <path d="M48 78 Q60 68 72 78" stroke="#fcfcfc" strokeWidth="5" strokeLinecap="round" />
        </>
      )}
      
      {mode === 'happy' && (
        <>
          <circle cx="48" cy="54" r="6" fill="#fcfcfc" />
          <circle cx="72" cy="54" r="6" fill="#fcfcfc" />
          <path d="M46 70 Q60 84 74 70" stroke="#fcfcfc" strokeWidth="5" strokeLinecap="round" />
        </>
      )}

      {mode === 'search' && (
        <>
          {/* Sol Göz */}
          <circle cx="48" cy="56" r="6" fill="#fcfcfc" />
          {/* Sağ Göz (Büyüteç Gibi) */}
          <circle cx="70" cy="54" r="10" stroke="#fcfcfc" strokeWidth="4" fill="none" />
          <line x1="77" y1="61" x2="84" y2="68" stroke="#fcfcfc" strokeWidth="4" strokeLinecap="round" />
          {/* Meraklı Ağız */}
          <path d="M50 74 Q56 78 62 74" stroke="#fcfcfc" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      )}

      {mode === 'neutral' && (
        <>
          <circle cx="48" cy="56" r="5" fill="#fcfcfc" />
          <circle cx="72" cy="56" r="5" fill="#fcfcfc" />
          <path d="M48 74 L72 74" stroke="#fcfcfc" strokeWidth="4" strokeLinecap="round" />
        </>
      )}

      {mode === 'eye' && (
        <>
          {/* Tek devasa bir göz (Cyclops/Gözlem) */}
          <path d="M35 56 Q60 36 85 56 Q60 76 35 56" stroke="#fcfcfc" strokeWidth="4" fill="none" />
          <circle cx="60" cy="56" r="6" fill="#fcfcfc" />
        </>
      )}

      {mode === 'fire' && (
        <>
          {/* Alev ikonu kafanın içinde */}
          <path d="M60 40 Q50 55 52 65 Q54 75 60 75 Q68 75 68 65 Q70 50 60 40" fill="#fcfcfc" />
          <path d="M60 52 Q56 62 58 68 Q58 70 60 70 Q64 70 62 62 Q62 58 60 52" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
