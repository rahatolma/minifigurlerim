# Minifigürlerim - Proje Notları & Görevler (Tasks)

## 📌 Proje Vizyonu
- Türkiye'de niş bir hobi olan LEGO minifigür koleksiyonerleri için 1000'den fazla figürün en ince detayına kadar sergileneceği platform.
- Şimdilik sergi, forum ve blog tarzı; ileride ise doğrudan **satış yapılabilen bir pazar yerine** ve affiliate marketing makinesine dönüşecek mimari.
- Altyapı olarak hantal WordPress'ten arınıp, ışık hızında çalışan **Next.js + Supabase** ikilisi kullanılacak. 

---

## 🏗️ 1. Altyapı & Veritabanı (Supabase)
- [ ] **`series` Tablosu:** Serinin adı, yılı, görselleri, açıklaması, figür adedi, marka.
- [ ] **`minifigures` Tablosu:** Figür adı, özellikleri (Marka, Seri Adı, Seri No, Seri Kategori, Figür Sıra No, Figür Rolü, Figür Tipi, Figür Kodu, Parça Sayısı, Değer (USD), Nadirlik Derecesi, Çıkış Tarihi), ait olduğu seri (ID bağlantılı - Relation).
- [ ] **`affiliate_links` Tablosu:** Her figürün altındaki Amazon, BrickLink vb. satın alma linkleri (gelir modeli için kritik).
- [ ] **`blog_posts` & `news`:** Makaleler, "En Nadir 10 Figür" tarzı içeriklerin tutulması.
- [ ] **`user_reviews`:** Üyelerin figürler ve platform hakkındaki değerlendirmeleri.
- [ ] ****Tipografi & Ayarlar (`settings`) Tablosu:** Admin panelinden site logolarını, başlık boyutlarını veya renkleri yönetebilme fikri için bir ayar tablosu.
- [ ] **Metrik Takibi:** Tıklama, günlük/toplam görüntülenme ve okunma (min read) sürelerinin veritabanında loglanıp UI'da gerçek zamanlı gösterilmesi.

## 🎨 2. Temel Arayüz (UI/UX) / Next.js
- [ ] Projenin Next.js (App Router), TailwindCSS ve Framer Motion ile kurulması.
- [ ] **Standart Tipografi Sistemi:** (Kullanıcının kesin talebi doğrultusunda CSS/Tailwind ayarlanacak). 
  - `h1`: 36px
  - `h2`: 30px
  - `h3`: 28px
  - `h4`, `h5`, `h6` vs. orantılı şekilde kurgulanacak.
- [ ] Marka renklerinin (`Red`, `Black`, `White`, `Gold/Yellow` detaylar) konfigürasyonu.
- [ ] Yüksek çözünürlüklü figür görsellerinin `next/image` ile optimize edilmiş (WebP/Lazy Load) şekilde render edilmesi.
- [ ] Mobilde (Responsive) tüm liste ve grid dizilimlerinin swipe (kaydırma) özelliğiyle kusursuz çalışması.

## 🧩 3. Bileşenler (Components)
- [ ] **Global Header ve Footer:** Dinamik menü, sosyal bağlantılar.
- [ ] **Hızlı Arama (Search):** Ekranı hafif karartıp sonuca anında giden gelişmiş modal arama.
- [ ] **Kartlar (Figür / Seri):** Mouse ile hover durumunda modern efektler.
- [ ] **Kategori/Filtre Menüsü:** Seriler ve Figürler sayfaları için sekme (tab) veya açılır liste şeklinde filtre paneli ("Karakter Paketleri", "Koleksiyon Serileri" vb.).
- [ ] **E-Bülten Formu:** "Abone Ol" yapısının veritabanına bağlanması.

## 📄 4. Sayfalar (Pages)
- [ ] **Ana Sayfa:** Slayt alanı, Seriler/Figürler grid kartları, Haberler bölümü, Dinamik Sayaç.
- [ ] **Seriler (Liste) Sayfası:** Filtrelenebilir yapıda, tüm serileri grid şeklinde sunan sayfa.
- [ ] **Seri Detay Sayfası:** Seri kapağı, özellikleri (Figür adet, Marka, Seri No), seri hikayesi açıklaması ve en altta "Seriye ait figürler" listesi.
- [ ] **Figürler (Liste) Sayfası:** Filtrelenebilir yapıda tüm figürler.
- [ ] **Figür Detay Sayfası:** Özellikler tablosu (Marka, Parça Sayısı, Değer vb.), Figür görseli, Yorumlar alanı ve İlgili Figürler sekmesi.
- [ ] **Dashboard / Admin Panel (Gelecek):** H1-H6 ayarları, logo değişimi, ürün girişlerinin yapıldığı bir panel.

---
> *Not: Proje geliştirildikçe maddeler güncellenecektir.*
