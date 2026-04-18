# Platform Ranking Signals and Sort Logics

Bu belge Minifigürlerim platformundaki dinamik "listeleme ve sıralama" fonksiyonlarının nasıl kurgulandığını teknik olarak barındırır. Herhangi bir "En Çok İncelenen / Trend" listesi yapılırken, verilerin nasıl manipülasyondan ve eski dataların sonsuza uzanan hegemonyasından kodlandığını açıklar.

## Series List - Popular (En Çok Tıklananlar)
"En Çok Tıklananlar" listesi eski içeriklerin kilitlenmesini engellemek için **Rolling Window (views_30d)** bazlı çalışır.

**Ranking Hierarchy:**
1. `views_30d DESC` (Son 30 gün içinde agregasyon tablosundan beslenen güncel okunma metriği)
2. `total_views DESC` (Tüm zamanların tıklanma toplamı. 1. sıradaki eşitliği bozar)
3. `release_year DESC` (Yakın tarihli vizyon her zaman daha popüler varsayılır)
4. `series_no DESC` (Canonical / Asıl seri numarası)

## Spam ve Throttling Yaklaşımı
View Event'leri istemci tarafından REST api `POST /api/track-view` üzerine gönderildiğinde In-Memory Throttling mekanizması çalışır:
- **Scope:** 1 IP başına, 1 Entity (Tablo + ID).
- **Limit:** Her 30.000ms (30 Saniye) içinde sadece 1 view kabul edilir.
- **RPC Kapsamı:** Supabase veritabanındaki RPC fonksiyonu ile (`track_series_view_atomic`) doğrudan atomic sayım yapar ve *aynı anda çalışan Multi-thread view yazmalarındaki Race Condition engellenir.*
