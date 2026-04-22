## Açıklama
Bu Pull Request neyi değiştiriyor veya çözüyor? Lütfen kısaca özetleyin.

---

## 🏗 Mimari & Dokümantasyon Denetimi (Docs Enforcement)
Projenin "Source of Truth" kuralı gereği, kodu değiştiren her işin dokümantasyonu etkilemesi muhtemeldir. Lütfen aşağıdaki kontrol listesini tamamlayın:

- [ ] Yapılan değişiklik yeni bir mimari karar, kural veya tasarım barındırıyorsa `/docs` klasörü altındaki ilgili (.md) dosya güncellendi mi?
- [ ] Bu değişiklik bir Singleton, DB İstemcisi veya Provider ise `eslint.config.mjs` kilitlerine bağımlı olduğu test edildi mi?
- [ ] **[KRİTİK]** Herhangi bir sayfanın rendering/cache davranışı (örneğin `dynamic = 'force-dynamic'` veya `revalidate = 0`) değiştirildiyse, bu durum `/docs/architecture/route-inventory.md` tablosunda gerekçesiyle güncellendi mi? Sinsi cache hatalarının (Route Drift) önüne geçildi mi?
- [ ] Yeni bir isimlendirme (Slug veya Kategori) eklendiyse, `/docs/standards/naming-conventions.md` kurallarına veya `naming-standards.ts` helper sınıflarına uyuyor mu?

---

## 🧪 Smoke Test Doğrulaması
Eğer E2E testleri lokalde çalıştırıldıysa sonucu belirtiniz. 
- [ ] `npm run test:e2e` veya manuel Smoke Checklist senaryoları hatasız tamamlandı.

## Ekstra Notlar
(Varsa Issue ID, dependency değişiklikleri vb.)
