import fs from 'fs';
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  function split(row) {
    let res = [], cur = '', inQ = false;
    for(let i=0; i<row.length; i++){
      let c = row[i];
      if(inQ){
        if(c==='"' && row[i+1]==='"') { cur+='"'; i++; }
        else if(c==='"') inQ=false;
        else cur+=c;
      } else {
        if(c==='"') inQ=true;
        else if(c===',') { res.push(cur); cur=''; }
        else cur+=c;
      }
    }
    res.push(cur); return res;
  }
  const hdrs = split(lines[0]).map(h=>h.replace(/^\uFEFF/,'').trim());
  let rows = [];
  for(let i=1; i<lines.length; i++){
    let c = split(lines[i]);
    let o = {};
    hdrs.forEach((h,idx)=> o[h]=c[idx]||null);
    rows.push(o);
  }
  return rows;
}
const figs = parseCSV('./public/uploads/import/Minifigures.csv');
let codeSet = {};
figs.forEach(f => {
  let k = f.figure_slug_tr;
  if(k) codeSet[k] = (codeSet[k]||0)+1;
});
let dups = Object.entries(codeSet).filter(x => x[1]>1);
console.log(`There are ${dups.length} duplicate slugs.`);
dups.forEach(d => console.log(d[0], d[1]));
