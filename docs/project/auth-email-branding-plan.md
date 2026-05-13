# Minifigürlerim Auth Email Branding Planı

## 1. Confirm Signup Email Template
Kullanıcı kayıt olduğunda gönderilecek e-posta tasarımı, platformun profesyonel hissini yansıtmalıdır.
- **Konu (Subject):** Minifigürlerim'e Hoş Geldin! Koleksiyonuna Başlamak İçin E-postanı Doğrula
- **Gövde (Body):**
  - **Logo:** En üstte ortalanmış Minifigürlerim logosu.
  - **Başlık:** Merhaba! Bize katıldığın için heyecanlıyız.
  - **Mesaj:** LEGO® figürlerini keşfetmek, portföy değerini takip etmek ve koleksiyonunu yönetmek için son bir adım kaldı.
  - **CTA (Buton):** E-postamı Doğrula (Kırmızı brand rengi `#D22B2B`).
  - **Footer:** Yasal bilgilendirmeler ve destek adresi (destek@minifigurlerim.com).

## 2. Reset Password Email Template
- **Konu (Subject):** Minifigürlerim Şifre Sıfırlama Talebi
- **Gövde (Body):**
  - **Logo:** En üstte ortalanmış Minifigürlerim logosu.
  - **Mesaj:** Şifreni sıfırlamak için bir talep aldık. Eğer bu işlemi sen yapmadıysan bu e-postayı görmezden gelebilirsin.
  - **CTA (Buton):** Şifremi Sıfırla
  - **Uyarı Texti:** Bu bağlantı 24 saat boyunca geçerlidir.

## 3. Sender Name / Sender Email Stratejisi
- **Sender Name (Gönderici Adı):** Minifigürlerim
- **Sender Email (Gönderici E-postası):** `noreply@minifigurlerim.com` veya `hello@minifigurlerim.com`
- **Reply-to:** `destek@minifigurlerim.com`
- Marka bütünlüğü için Supabase'in varsayılan `noreply@mail.app.supabase.io` adresinden acilen çıkılması gerekmektedir.

## 4. Custom SMTP Seçenekleri
| Sağlayıcı | Avantajlar | Dezavantajlar | Öneri Durumu |
| :--- | :--- | :--- | :--- |
| **Resend** | Çok modern, React Email uyumlu, developer friendly, hızlı setup. | Ücretsiz tier'da limitli (3,000/ay). | **Güçlü Öneri** (React Email desteği sayesinde template'leri kodlamak çok kolay) |
| **Postmark** | Teslimat oranı (deliverability) en yüksek, çok hızlı. | Sadece transactional email, ücretsiz tier yok. | Bütçe varsa 1. sıra. |
| **SendGrid** | Sektör standardı, çok kapsamlı. | Arayüz karmaşık, spam'e düşme riski shared IP'lerde yüksek. | Alternatif. |
| **Brevo** | Ücretsiz tier geniş (300/gün), pazarlama + transactional. | API biraz yavaş, developer deneyimi zayıf. | Bütçe odaklıysa önerilir. |
| **AWS SES** | Çok ucuz, yüksek limit. | Kurulum çok zor, sandboxtan çıkmak zaman alır. | Başlangıç için fazla hantal. |

**Önerilen SMTP Sağlayıcı:** **Resend** (Hem Vercel/Next.js ekosistemine çok yakın olması hem de ücretsiz planının başlangıç için yeterli olması sebebiyle).

## 5. TR/EN Email Dili Stratejisi
Supabase standart olarak dil tespiti yapıp e-posta atma konusunda kısıtlıdır. Olası çözümler:
- **Fallback Yaklaşımı (Şu anki):** E-posta şablonunda hem TR hem EN metni alt alta vermek. (Örn: "E-postanızı doğrulayın / Verify your email").
- **Gelişmiş Yaklaşım (Edge Functions):** Supabase Auth kancaları (Email Auth Hooks) kullanılarak, kullanıcının `raw_user_meta_data.locale` bilgisine göre SendGrid veya Resend API'sine payload gönderip dili dinamik seçmek. Plan aşamasında başlangıç olarak "Çift Dilli (TR/EN) Tek Şablon" mantığı ile ilerlenmesi güvenlidir.

## 6. Supabase Dashboard’da Değişecek Alanlar
- **Authentication -> Configuration -> Email:**
  - `Enable Custom SMTP` aktif edilecek.
  - SMTP Host, Port, User, Password ve Sender Email bilgileri girilecek.
- **Authentication -> Configuration -> Email Templates:**
  - *Confirm signup* ve *Reset Password* kutucuklarına yeni HTML/Inline CSS formatındaki tasarımlar yapıştırılacak.
  - `{{ .ConfirmationURL }}` tag'lerinin doğru butona yerleştirildiğinden emin olunacak.

## 7. Redirect URL / Callback Güvenliği
- Supabase Dashboard -> Authentication -> URL Configuration altında `Site URL` ve `Redirect URLs` kontrol edilecek:
  - `http://localhost:3004/**`
  - `https://www.minifigurlerim.com/**`
  - `https://*.vercel.app/**`
- E-postadaki buton linki tıklanıldığında Next.js tarafındaki `/api/auth/callback` veya PKCE akışına düşmesi için email template içindeki URL yapısı `{{ .SiteURL }}/api/auth/callback?code={{ .TokenHash }}...` şeklini almalıdır.

## 8. Test Checklist
- [ ] Yeni SMTP ayarları ile test e-postası gönderilmesi.
- [ ] Kayıt ol (Signup) akışının tetiklenip, gelen maildeki "Doğrula" butonunun doğru redirect atması.
- [ ] Şifre sıfırlama (Forgot Password) tetiklenip, gelen maildeki link ile şifre güncelleme yapılması.
- [ ] E-postaların Gmail, Outlook ve Apple Mail üzerinde görsel (HTML) bozulma yaşayıp yaşamadığının kontrolü.
- [ ] Farklı tarayıcılardan ve mobilden gelen maillerdeki linklerin test edilmesi.
- [ ] Linklerin tıklanma sonrasında auth middleware tarafından yakalanıp cookie'lerin oluşturulmasının teyidi.

## 9. Riskler ve Mitigasyonlar
- **Spam Folder Riski:** SPF, DKIM ve DMARC DNS kayıtlarının domain sağlayıcı (Cloudflare vb.) üzerinde kesinlikle doğrulanması gerekir. Doğrulanmazsa mailler Spam'e düşer.
- **Domain Verification:** Supabase ve SMTP sağlayıcı tarafında domainin onaylanma süreci (DNS propagation) 24 saate kadar sürebilir.
- **Rate Limit:** SMTP sağlayıcısının free-tier limitlerine (örn. günde 100) çarpma riski. (Signup ataklarında). Supabase'in email rate limiti ile SMTP limiti eşitlenmeli.
- **Yanlış Redirect:** E-postadaki linkin `Site URL` dışına atması veya `localhost` linkinin prod'da gitmesi. Next.js `origin` veya `emailRedirectTo` argümanının login action'da doğru setlenmesi kritik.
- **Bozuk Link / Template Hatası:** Çoğu modern CSS class'ı (örn Tailwind) e-postalarda çalışmaz. Inline CSS ve Table layout (veya React Email) kullanılmalıdır.
