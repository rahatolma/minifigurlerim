import fs from 'fs';
const path = 'src/app/[locale]/(public)/figurler/[seriesSlug]/[figureSlug]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove items-start from the grid
content = content.replace(
  'grid-cols-1 lg:grid-cols-12 gap-6 items-start relative', 
  'grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative'
);

// Add h-full to left column, and flex-1 to the image box
content = content.replace(
  'className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6 sticky pb-6 z-40" style={{ top: \'100px\' }}',
  'className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6 lg:sticky pb-6 z-40 h-full" style={{ top: \'100px\' }}'
);

content = content.replace(
  'className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center lg:min-h-[350px]"',
  'className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center flex-1"'
);

fs.writeFileSync(path, content);
console.log("Updated page.tsx for stretching");
