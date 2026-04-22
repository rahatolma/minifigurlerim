const fs = require('fs');

let f = fs.readFileSync('src/app/[locale]/(public)/figurler/page.tsx', 'utf8');
f = f.replace(/allSeries\.map\(\(series: any\) =>/g, 'allSeries.map((series) =>');
f = f.replace(/allFigures = allFigures\.sort\(\(a: any, b: any\)/g, 'allFigures = allFigures.sort((a, b)');
f = f.replace(/\.map\(\(row: any\) =>/g, '.map(row =>');
f = f.replace(/\.filter\(\(fig: any\): fig is NonNullable<typeof fig> =>/g, '.filter((fig): fig is NonNullable<typeof fig> =>');
f = f.replace(/\(b as any\)\.total_views/g, 'b.total_views');
f = f.replace(/\(a as any\)\.total_views/g, 'a.total_views');
fs.writeFileSync('src/app/[locale]/(public)/figurler/page.tsx', f);

let s = fs.readFileSync('src/app/[locale]/(public)/seriler/page.tsx', 'utf8');
s = s.replace(/allFigs\.forEach\(\(f: any\) =>/g, 'allFigs.forEach(f =>');
s = s.replace(/\.map\(\(series: any\) =>/g, '.map(series =>');
fs.writeFileSync('src/app/[locale]/(public)/seriler/page.tsx', s);
