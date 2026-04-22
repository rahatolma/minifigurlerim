import fs from 'fs';
const path = 'src/components/ui/FigureGallery.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add h-full to the root of FigureGallery
content = content.replace(
  '<div className="w-full flex flex-col items-center">',
  '<div className="w-full h-full flex flex-col items-center justify-center">'
);

// Make the image stage flexible
content = content.replace(
  '<div className="relative w-full h-[500px] flex items-center justify-center group overflow-hidden">',
  '<div className="relative w-full h-full min-h-[400px] flex-1 flex items-center justify-center group overflow-hidden">'
);

fs.writeFileSync(path, content);
console.log("Updated FigureGallery.tsx");
