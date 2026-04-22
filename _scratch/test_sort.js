const items = [{ y: 2024, no: "6" }, { y: 2024, no: "25" }, { y: 2024, no: "2" }];
items.sort((a,b) => {
  const yDiff = b.y - a.y;
  if(yDiff !== 0) return yDiff;
  const noA = parseInt(a.no) || 0;
  const noB = parseInt(b.no) || 0;
  return noB - noA; // DESC
});
console.log(items);
