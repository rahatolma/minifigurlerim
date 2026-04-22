import fetch from 'node-fetch';

const payload = {
  textsToTranslate: [
    "Bu figür gerçekten çok tatlı ve eğlenceli. Çocuklar buna bayılacak! Açıkçası almak istiyorsanız hemen alın derim. Setin içinde 5 parça oyuncağı var.",
    "Bence seri 2'nin en nadir parçalarından biri."
  ],
  seoData: {
    title: "Sevimli Uzaylı Minifigürü Geldi!"
  }
};

try {
  const res = await fetch('http://localhost:3004/api/admin/translate-draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
} catch (e) {
  console.error("Error:", e);
}
