# Minifigürlerim - Manual Smoke Test Checklist

Production veya Preview ortamlarına çıkmadan önce uygulamanın temel işlevlerinin (Critical Path) sağlıklı çalıştığını doğrulamak için kullanılacak manuel test adımlarıdır.

---

### 1. Preview Deploy Doğrulama
* **Ortam**: Preview
* **Adımlar**: Vercel paneli üzerinden oluşturulan benzersiz Preview URL'sine gidin. Sitenin ilk yüklemesinin başarılı olup olmadığını kontrol edin.
* **Beklenen Sonuç**: Ana sayfa hatasız açılmalı, CSS/Fontlar yüklenmiş olmalı.
* **Fail Olursa Bakılacak Yer**: Vercel Build Logs, `middleware.ts` yönlendirmeleri, `layout.tsx` hataları.

### 2. Production Deploy Doğrulama
* **Ortam**: Production
* **Adımlar**: www.minifigurlerim.com adresine gidin. Hard refresh (Cmd+Shift+R) yapın.
* **Beklenen Sonuç**: Cache'siz olarak sayfa hatasız ve hızlı bir şekilde (TTFB < 500ms) açılmalı.
* **Fail Olursa Bakılacak Yer**: Vercel Production Logs, Supabase Bağlantısı (ENV değişkenleri).

### 3. Maintenance Mode Kontrolü
* **Ortam**: Production / Preview
* **Adımlar**: Vercel üzerinden `MAINTENANCE_MODE=true` yapıp sayfayı yenileyin.
* **Beklenen Sonuç**: Public kullanıcılar `/maintenance` sayfasına düşmeli. `/cto` veya `/admin` yetkilileri siteyi normal görmeye devam edebilmeli.
* **Fail Olursa Bakılacak Yer**: `src/utils/supabase/middleware.ts` bypass lojiği.

### 4. Login / Logout
* **Ortam**: Preview / Production
* **Adımlar**: E-posta ve şifre ile giriş yapın, Header'daki isim/menü güncellensin. Sonra "Çıkış Yap"a basın.
* **Beklenen Sonuç**: Başarılı şekilde hesaba girilmeli ve çıkış yapıldığında oturum çerezleri tamamen temizlenip login sayfasına veya anasayfaya dönülmeli.
* **Fail Olursa Bakılacak Yer**: `src/app/actions/auth.ts`, `middleware.ts` cookie temizleme lojiği.

### 5. Google OAuth
* **Ortam**: Preview / Production
* **Adımlar**: Login sayfasında "Google ile Giriş Yap" butonuna basın.
* **Beklenen Sonuç**: Google popup'ı açılmalı ve başarılı girişten sonra doğru URL'ye dönmeli.
* **Fail Olursa Bakılacak Yer**: Supabase Auth Ayarları (Redirect URLs), `signInWithGoogle` fonksiyonu.

### 6. Auth Redirect Domain Kontrolü
* **Ortam**: Preview
* **Adımlar**: Google ile giriş yaptıktan sonra dönülen URL'i kontrol edin.
* **Beklenen Sonuç**: Preview ortamındayken `localhost:3004` adresine DEĞİL, Vercel Preview domainine dönmeli. Production'da ise `minifigurlerim.com` adresine dönmeli.
* **Fail Olursa Bakılacak Yer**: `src/utils/helpers.ts` (`getURL`), `actions.ts`.

### 7. Rating Modal Aç/Kapat
* **Ortam**: Preview / Production
* **Adımlar**: Figür detay sayfasında "Minifigüre Puan Ver" butonuna basın. Modaldaki (X) butonuna basarak kapatın.
* **Beklenen Sonuç**: Modal anında açılmalı ve (X) ile kapatıldığında state loop'a girmeden, URL kirliliği bırakmadan kapanmalı.
* **Fail Olursa Bakılacak Yer**: `src/components/ui/CollectionActions.tsx` (`closeRatingModal`).

### 8. Rating Save
* **Ortam**: Preview / Production
* **Adımlar**: Rating modalını açın, 3 yıldıza tıklayıp "Puanı Kaydet" deyin.
* **Beklenen Sonuç**: Modal kapanmalı ve puan UI'da başarıyla güncellenmeli (sayfa yenilemeye gerek kalmadan).
* **Fail Olursa Bakılacak Yer**: `src/app/actions/collection.ts` (`saveRating`), `action_dal.ts`.

### 9. Rerating (Tekrar Puan Verme)
* **Ortam**: Preview / Production
* **Adımlar**: Az önce 3 yıldız verdiğiniz figüre tekrar puan verin ve 5 yıldıza çekin.
* **Beklenen Sonuç**: Puan başarıyla güncellenmeli. Sistem "Kritik Bir Hata Meydana Geldi" uyarısına (React Error Boundary) DÜŞMEMELİ.
* **Fail Olursa Bakılacak Yer**: `src/app/actions/collection.ts`, UPSERT SQL lojiği.

### 10. Collection Add/Remove
* **Ortam**: Preview / Production
* **Adımlar**: Figürü "Koleksiyonumda" olarak işaretleyin, sonra butona tekrar basıp çıkarın.
* **Beklenen Sonuç**: Hızlıca güncellenmeli ve loading state doğru çalışmalı.
* **Fail Olursa Bakılacak Yer**: `src/app/actions/collection.ts` (`toggleCollectionStatus`).

### 11. Follow / Unfollow
* **Ortam**: Preview / Production
* **Adımlar**: Bir koleksiyonerin veya figürün "Takip Et" butonuna tıklayıp geri çekin.
* **Beklenen Sonuç**: İşlem başarıyla kaydedilmeli, buton state'i senkronize olmalı.
* **Fail Olursa Bakılacak Yer**: Takip action/dal lojiği.

### 12. Rate Limit Smoke Test
* **Ortam**: Preview / Production
* **Adımlar**: Koleksiyona ekle butonuna aralıksız, saniyede 3-4 kez olmak üzere toplam 15-20 kez art arda tıklayın.
* **Beklenen Sonuç**: Çok hızlı işlem yapıldığında sistem Upstash Rate Limit'e (veya DB kısıtlamalarına) takılıp hata mesajı göstermeli ancak site ÇÖKMEMELİ.
* **Fail Olursa Bakılacak Yer**: `src/lib/rate-limit.ts`, Upstash limit parametreleri.

### 13. Blog Render
* **Ortam**: Preview / Production
* **Adımlar**: Herhangi bir habere/blog yazısına gidin.
* **Beklenen Sonuç**: İçerikteki başlıklar, metodoloji kutuları, uyarılar ve metinler düzgün HTML/UI olarak render edilmeli. Ekranda köşeli parantezli `[{"type":"intro"}]` şeklinde ham JSON ASLA görünmemeli.
* **Fail Olursa Bakılacak Yer**: `src/components/ui/BlogBlockRenderer.tsx`.

### 14. TR / EN Locale Switch
* **Ortam**: Preview / Production
* **Adımlar**: Sağ üstten dili "English" veya "Türkçe" olarak değiştirin.
* **Beklenen Sonuç**: URL yapısı güncellenmeli, UI metinleri (header, footer, butonlar) ve veritabanından gelen içerikler (varsa) hedef dile anında dönmeli. Fallback içerik varsa "Translation Fallback" badge'i çıkmalı.
* **Fail Olursa Bakılacak Yer**: `next-intl` routing, `middleware.ts`.

### 15. Mobile Navbar
* **Ortam**: Preview / Production
* **Adımlar**: Tarayıcıyı mobil görünüme daraltın (veya telefondan girin). Hamburger menüyü açın, bir linke tıklayın.
* **Beklenen Sonuç**: Menü açılmalı, yönlendirme sonrası mobil menü kendiliğinden kapanmalı ve z-index sorunu yaşanmamalı.
* **Fail Olursa Bakılacak Yer**: `src/components/layout/MobileTabBar.tsx` veya `Header.tsx`.

### 16. Figür Detay Sayfası
* **Ortam**: Preview / Production
* **Adımlar**: `/figurler/[series]/[slug]` formatındaki bir sayfayı açın.
* **Beklenen Sonuç**: Veriler (fiyat, rarity, yıl, aksesuarlar) tam olarak yüklenmeli. Next/Prev butonları çalışmalı.
* **Fail Olursa Bakılacak Yer**: `src/app/[locale]/(public)/figurler/[seriesSlug]/[figureSlug]/page.tsx`, `getMinifigureBySlug`.

### 17. Seri Detay Sayfası
* **Ortam**: Preview / Production
* **Adımlar**: `/seriler/[slug]` sayfasına gidin.
* **Beklenen Sonuç**: Seri puanları, içeriğindeki tüm figürler grid/liste halinde yüklenmeli. "Tümünü Koleksiyona Ekle" vs varsa düzgün çalışmalı.
* **Fail Olursa Bakılacak Yer**: `src/app/[locale]/(public)/seriler/[slug]/page.tsx`.

### 18. Broken Image / Fallback Görsel
* **Ortam**: Preview / Production
* **Adımlar**: Resmi silinmiş veya eklenmemiş bir figürü / haberi açın.
* **Beklenen Sonuç**: Sayfa kırılmamalı, gri kutu içinde "Görsel Yok" veya varsayılan Minifigürlerim logolu placeholder görseli çıkmalı.
* **Fail Olursa Bakılacak Yer**: Resim render komponentleri (`next/image` onError eventleri).

### 19. Error Boundary Kontrolü
* **Ortam**: Preview / Production
* **Adımlar**: Bilerek olmayan bir figür URL'sine gidin (örn: `/figurler/olmayan-seri/sahte-figur`).
* **Beklenen Sonuç**: Site patlamak (500 Error) yerine kullanıcı dostu `notFound()` (404 Sayfası) veya Error Boundary (`error.tsx`) sayfasına düşmeli.
* **Fail Olursa Bakılacak Yer**: `not-found.tsx`, `error.tsx` bileşenleri.

### 20. Vercel Logs Kontrolü
* **Ortam**: Production
* **Adımlar**: Vercel paneline girip Logs sekmesini açın. Sitede birkaç gezinme işlemi yapın.
* **Beklenen Sonuç**: Sürekli kendini tekrar eden Warning'ler, SSR Hydration Mismatch hataları veya DB Connection Timeout logları OLMAMALI. Temiz bir log akışı görülmeli.
* **Fail Olursa Bakılacak Yer**: Next.js Server Components warning çözümleri, DB bağlantı havuzu (connection pooling).
