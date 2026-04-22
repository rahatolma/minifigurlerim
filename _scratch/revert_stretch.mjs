import fs from 'fs';

const pagePath = 'src/app/[locale]/(public)/figurler/[seriesSlug]/[figureSlug]/page.tsx';
let pageContent = fs.readFileSync(pagePath, 'utf8');

pageContent = pageContent.replace(
  'grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative', 
  'grid-cols-1 lg:grid-cols-12 gap-6 items-start relative'
);

pageContent = pageContent.replace(
  'className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6 lg:sticky pb-6 z-40 h-full" style={{ top: \'100px\' }}',
  'className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6 sticky pb-6 z-40" style={{ top: \'100px\' }}'
);

pageContent = pageContent.replace(
  'className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center flex-1"',
  'className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center lg:min-h-[360px]"'
);

fs.writeFileSync(pagePath, pageContent);

const fgPath = 'src/components/ui/FigureGallery.tsx';
let fgContent = fs.readFileSync(fgPath, 'utf8');

fgContent = fgContent.replace(
  '<div className="w-full h-full flex flex-col items-center justify-center">',
  '<div className="w-full flex flex-col items-center">'
);

fgContent = fgContent.replace(
  '<div className="relative w-full h-full min-h-[400px] flex-1 flex items-center justify-center group overflow-hidden">',
  '<div className="relative w-full h-[500px] flex items-center justify-center group overflow-hidden">'
);

fs.writeFileSync(fgPath, fgContent);

console.log("Reverted layout changes");
