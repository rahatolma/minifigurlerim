# Auth Email Branding & Customization Plan

## Amaç
Supabase Auth tarafından gönderilen Signup Confirmation ve Reset Password e-postalarının "Supabase Auth" görünümünden kurtarılarak, tamamen "Minifigürlerim" kurumsal kimliğine uygun hale getirilmesi.

## 1. Custom SMTP Ayarları
Mevcut Supabase ücretsiz katmanı e-postaları kendi paylaşımlı havuzundan gönderdiği için `noreply@mail.app.supabase.io` adresiyle ve "Supabase Auth" gönderici adıyla ulaşır.
**Yapılacaklar:**
- [ ] Uygun bir SMTP sağlayıcısı seçilecek (Önerilen: Resend, AWS SES veya SendGrid).
- [ ] Gönderici e-posta adresi (Sender Email) belirlenecek: `noreply@minifigurlerim.com`
- [ ] Gönderici adı (Sender Name) belirlenecek: `Minifigürlerim`

## 2. Supabase Dashboard Yapılandırması
1. **Authentication > Email Templates** menüsüne girilecek.
2. Custom SMTP Toggle'ı aktif edilecek.
3. Sağlayıcıdan alınan Host, Port, Username, Password bilgileri girilecek.
4. "Sender email" ve "Sender name" güncellenecek.

## 3. Email Şablonları (Templates)

### A. Confirm Signup (Kayıt Onayı) Şablonu
Kullanıcı kayıt olduğunda gönderilen hoşgeldin ve aktivasyon e-postası.

**Örnek HTML Yapısı (Plan):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #1D2136; padding: 20px; text-align: center;">
    <img src="https://www.minifigurlerim.com/images/site-logo.png" alt="Minifigürlerim Logo" style="height: 40px;" />
  </div>
  <div style="padding: 30px; background-color: #ffffff;">
    <h2 style="color: #111827;">Koleksiyona Hoş Geldin!</h2>
    <p style="color: #4b5563; line-height: 1.6;">Hesabını aktifleştirmek ve koleksiyonunu yönetmeye başlamak için aşağıdaki butona tıkla:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="background-color: #D22B2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Hesabımı Onayla</a>
    </div>
    <p style="color: #9ca3af; font-size: 12px;">Eğer buton çalışmıyorsa şu linki kopyalayıp tarayıcına yapıştırabilirsin: <br> {{ .ConfirmationURL }}</p>
  </div>
</div>
```

### B. Reset Password (Şifre Sıfırlama) Şablonu
Şifresini unutan kullanıcıya gönderilecek güvenli kurtarma e-postası.

**Örnek HTML Yapısı (Plan):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #1D2136; padding: 20px; text-align: center;">
    <img src="https://www.minifigurlerim.com/images/site-logo.png" alt="Minifigürlerim Logo" style="height: 40px;" />
  </div>
  <div style="padding: 30px; background-color: #ffffff;">
    <h2 style="color: #111827;">Şifre Sıfırlama Talebi</h2>
    <p style="color: #4b5563; line-height: 1.6;">Hesabın için yeni bir şifre belirleme talebi aldık. İşleme devam etmek için aşağıdaki butona tıkla:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="background-color: #1D2136; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Şifremi Yenile</a>
    </div>
    <p style="color: #9ca3af; font-size: 12px;">Bu talebi sen oluşturmadıysan bu e-postayı güvenle silebilirsin.</p>
  </div>
</div>
```

## 4. Vercel ve Çevre Değişkenleri (Env) Etkileri
- Bu yapılandırma ağırlıklı olarak Supabase Dashboard tarafında gerçekleşecektir.
- Herhangi bir `.env` değişikliği kod tarafında gerekmeyecektir. Sadece `NEXT_PUBLIC_SITE_URL` veya wildcard URL izinlerinin doğru ayarlı kalması önemlidir (Şablonlardaki `{{ .ConfirmationURL }}` bu site URL'lerini baz alır).

## 5. Test Checklist
- [ ] Yeni SMTP ayarları ile test e-postası gönderildi mi?
- [ ] Gönderen adı "Minifigürlerim" olarak görünüyor mu?
- [ ] E-posta Junk/Spam kutusuna düşmeden Inbox'a ulaşıyor mu?
- [ ] Kayıt onayı e-postasındaki tasarıma (HTML) logo doğru yükleniyor mu?
- [ ] Şifre sıfırlama linkine tıklandığında Preview/Canlı URL'e sorunsuz redirect oluyor mu?
