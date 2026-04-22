const fs = require('fs');

const FILE_PATH = 'src/app/[locale]/(public)/figurler/[seriesSlug]/[figureSlug]/page.tsx';
const content = fs.readFileSync(FILE_PATH, 'utf-8');

// The marker lines
const START_MARKER = '        {/* 🧱 SOL KOLON: Detaylı Ansiklopedik Veriler */}';
const END_MARKER = '      {/* 🧱 ORTA BLOK: Finans ve Piyasa Yönetimi */}';

const startIndex = content.indexOf(START_MARKER);
const endIndex = content.indexOf(END_MARKER);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const beforeBlock = content.substring(0, startIndex);
const afterBlock = content.substring(endIndex);

const newBlock = `        {/* 🧱 SOL KOLON: Görsel ve Hızlı Aksiyonlar */}
        <div className="lg:col-span-4 xl:col-span-5 flex flex-col gap-6 sticky pb-6 z-40" style={{ top: '100px' }}>
            
            {/* 1- ANA GÖRSEL KUTUSU */}
            <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center lg:min-h-[350px]">
                <FigureGallery images={images} name={figure.name} />
            </div>

            {/* 2- KOLEKSİYON VE PUANLAMA BUTONLARI */}
            <CollectionActions minifigureId={figure.id} />

            {/* 3- DEĞER VE TALEP MOTORU BLOĞU (MİNİMAL YENİ TASARIM) */}
            <div className="w-full bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col flex-1 pl-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#D22B2B] mb-1 flex items-center gap-1.5">
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> 
                           Koleksiyon Değeri
                        </span>
                        <span className="text-xl font-black text-gray-900 tracking-tight">
                            {figure.min_price && figure.max_price ? \`$\${figure.min_price} - $\${figure.max_price}\` : (figure.value_usd ? \`$\${figure.value_usd}\` : 'Belirsiz')}
                        </span>
                    </div>
                    <div className="flex gap-2 flex-1">
                         <div className="flex flex-col items-center justify-center bg-yellow-50 px-2 py-2 rounded-lg border border-yellow-100 flex-1">
                            <span className="text-[9px] text-yellow-600/80 font-bold uppercase tracking-widest mb-1">Değer Skoru</span>
                            <span className="text-[12px] font-black text-yellow-700">
                                {figure.value_score === undefined || figure.value_score === null ? 'Yaygın' : 
                                 figure.value_score >= 4.5 ? 'Efsane' : 
                                 figure.value_score >= 3.5 ? 'Çok Değerli' : 
                                 figure.value_score >= 2.5 ? 'Değerli' : 
                                 figure.value_score >= 1.5 ? 'Orta' : 'Yaygın'}
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-blue-50 px-2 py-2 rounded-lg border border-blue-100 flex-1">
                            <span className="text-[9px] text-blue-600/80 font-bold uppercase tracking-widest mb-1">Talep Sinyali</span>
                            <span className="text-[12px] font-black text-blue-700">
                                {figure.demand_score === undefined || figure.demand_score === null ? 'Düşük Talep' :
                                 figure.demand_score >= 4.0 ? 'Çok Yüksek' : 
                                 figure.demand_score >= 3.0 ? 'Yüksek' : 
                                 figure.demand_score >= 2.0 ? 'Orta' : 'Düşük'}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* İtalik olmayan küçük uyarı */}
                <div className="pt-3 border-t border-gray-50 flex items-start gap-1.5 text-[10px] text-[#D22B2B] font-medium tracking-wide">
                   <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   <span>Fiyatlar yalnızca referans amaçlıdır, ticaret tavsiyesi değildir.</span>
                </div>
            </div>

        </div>

        {/* 🧱 SAĞ KOLON: Detaylı Ansiklopedik Veriler */}
        <div className="lg:col-span-8 xl:col-span-7 flex flex-col items-start bg-white p-6 sm:p-10 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            
            {/* Etiketler (Seri & Kategori) */}
            <div className="flex flex-wrap gap-2 items-center w-full mb-6">
                {figure.series_name && (
                    <Link href={figure.series?.slug ? \`/seriler/\${figure.series.slug}\` : \`/seriler\`} className="bg-red-50 text-[#D22B2B] hover:bg-[#D22B2B] hover:text-white transition-colors font-black uppercase tracking-widest text-[9px] sm:text-[10px] px-3.5 py-1.5 rounded-sm">
                        {figure.series_name}
                    </Link>
                )}
                {figure.category && (
                    <Link href={\`/seriler?category=\${slugify(figure.category)}\`} className="bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-black uppercase tracking-widest text-[9px] sm:text-[10px] px-3.5 py-1.5 rounded-sm">
                        {figure.category}
                    </Link>
                )}
            </div>

            {/* Başlık */}
            <h1 className="text-3xl md:text-5xl lg:text-5xl font-black text-[#111] leading-[1.1] tracking-tight mb-8">
                {formatBrandText(figure.name)}
            </h1>

            {/* Açıklama Alanı */}
            <div className="text-gray-600 text-[15px] sm:text-[16px] font-medium leading-relaxed mb-10 w-full min-h-[40px]">
                {figure.description ? formatBrandText(figure.description) : <span className="text-gray-400 opacity-60">Figür açıklaması girilmemiş...</span>}
            </div>

            {/* 🧱 DİKEY ÖZELLİK LİSTESİ ŞABLONU (TABLE) */}
            <div className="w-full">
                <div className="flex flex-col w-full border-t border-gray-900 mt-2">
                    <TableRow label="Marka" value={figure.brand} />
                    <TableRow label="Seri Adı" value={figure.series_name} />
                    <TableRow label="Seri No" value={figure.series_no} />
                    <TableRow label="Seri Kategori" value={figure.category} />
                    <TableRow label="Figür Adı" value={figure.name} />
                    <TableRow label="Figür Sıra No" value={figure.figure_no} />
                    <TableRow label="Figür Rolü" value={figure.role} />
                    <TableRow label="Figür Tipi" value={figure.type} />
                    <TableRow label="Figür Kodu" value={figure.code} />
                    <TableRow label="Parça Sayısı" value={figure.piece_count} />
                    <TableRow label="Nadirlik Derecesi" value={figure.rarity} />
                    <TableRow label="Çıkış Tarihi Ay" value={figure.release_month} />
                    <TableRow label="Çıkış Tarihi Yıl" value={figure.release_year} />
                    
                    {/* DİNAMİK JSON Özel Detaylar */}
                    {figure.custom_attributes && Object.keys(figure.custom_attributes).length > 0 && (
                        Object.entries(figure.custom_attributes).map(([key, val]) => {
                            const groupDef = defGroups?.find(g => g.slug === key);
                            const label = groupDef ? groupDef.name : key;
                            return (
                                <TableRow key={key} label={label} value={val} />
                            )
                        })
                    )}
                </div>
            </div>

            {/* 4- GÖRÜNTÜLENME KUTUSU (Tablonun Altına Taşındı) */}
            <div className="w-full mt-12 bg-gray-50/50 px-2 py-4 rounded-xl border border-gray-100 flex items-center justify-between">
                <div className="flex flex-col items-center flex-1">
                    <span className="text-green-700 font-bold text-[14px]">{figure.total_views || 0}</span>
                    <span className="text-gray-400 text-[8px] sm:text-[9px] uppercase font-black tracking-widest mt-1 text-center">T. Görüntüleme</span>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-green-700 font-bold text-[14px]">{figure.daily_views || 0}</span>
                    <span className="text-gray-400 text-[8px] sm:text-[9px] uppercase font-black tracking-widest mt-1 text-center">G. Görüntüleme</span>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-red-500 font-bold text-[14px]">{Math.max(1, Math.floor((figure.description?.length || 0) / 250))} Dk</span>
                    <span className="text-gray-400 text-[8px] sm:text-[9px] uppercase font-black tracking-widest mt-1 text-center">Okuma</span>
                </div>
                <div className="w-px h-6 bg-gray-200"></div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-gray-800 font-bold text-[14px]">0</span>
                    <span className="text-gray-400 text-[8px] sm:text-[9px] uppercase font-black tracking-widest mt-1 text-center">Yorum</span>
                </div>
            </div>

        </div>

      </div>

`;

fs.writeFileSync(FILE_PATH, beforeBlock + newBlock + afterBlock);
console.log("Done");
