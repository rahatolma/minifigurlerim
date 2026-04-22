const payload = {
  textsToTranslate: [
    "Bu figür gerçekten çok tatlı ve eğlenceli. Çocuklar buna bayılacak! Açıkçası almak istiyorsanız hemen alın derim. Setin içinde 5 parça oyuncağı var.",
    "Bence seri 2'nin en nadir parçalarından biri."
  ],
  seoData: {
    title: "Sevimli Uzaylı Minifigürü Geldi!"
  }
};

fetch('http://localhost:3004/api/admin/translate-draft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
