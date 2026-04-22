import fs from 'fs';

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return [];

  // Robust CSV parser inside Javascript
  function splitCSVRow(row) {
    let result = [];
    let curVal = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
        let char = row[i];
        if (inQuotes) {
            if (char === '"') {
                if (i < row.length - 1 && row[i+1] === '"') {
                    curVal += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                curVal += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                result.push(curVal);
                curVal = '';
            } else {
                curVal += char;
            }
        }
    }
    result.push(curVal);
    return result;
  }

  const headers = splitCSVRow(lines[0]).map(h => h.replace(/^\uFEFF/, '').trim()); // remove BOM
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
     const cols = splitCSVRow(lines[i]);
     let obj = {};
     headers.forEach((h, idx) => {
         obj[h] = cols[idx] || null;
         if (obj[h] === '') obj[h] = null;
         if (obj[h] === 'TRUE') obj[h] = true;
         if (obj[h] === 'FALSE') obj[h] = false;
     });
     rows.push(obj);
  }
  return rows;
}

const series = parseCSV('./public/uploads/import/Series.csv');
console.log('Series count:', series.length);
console.log('First series key check:', Object.keys(series[0]));

const figs = parseCSV('./public/uploads/import/Minifigures.csv');
console.log('Figs count:', figs.length);
console.log('First fig:', figs[0]);
