# 🛡️ Cloudflare Rollout Rehearsal Checklist

*Bu belge, Minifigurlerim platformunun Cloudflare proxy geçişini sıfır hatayla gerçekleştirmek için kullanılacak "Go-Live" komuta listesidir. Operatör, her bir `[ ]` kutusunu tamamlamadan bir sonraki aşamaya geçemez.*

---

## 1. Pre-Flight Checklist (Kalkış Öncesi Hazırlık)

### Açık Tutulacak Ekranlar (Dual Monitör Tavsiye Edilir)
- [ ] Ekran 1: Vercel Dashboard -> Settings -> Domains (TXT verify statüleri için).
- [ ] Ekran 2: Cloudflare Dashboard -> DNS sekmesi.
- [ ] Ekran 3: Cloudflare Dashboard -> Cache Rules ve WAF (Hazır yazılmış, "Disabled" bekleyen kurallar).
- [ ] Ekran 4: Tarayıcı Console & Network Tab.

### Browser & User State Hazırlığı
- [ ] Tarayıcı 1: Chrome **Gizli Sekme** (Network Tab -> "Disable Cache" işaretli). Giriş yapılmamış anonim kullanıcı.
- [ ] Tarayıcı 2: Safari veya Firefox Normal Pencere. Önceden Admin/CTO yetkisiyle **Login olunmuş** test hesabı.
- [ ] **Extension İzolasyonu:** Adblock, Privacy eklentileri, Password Manager (auto-fill) ve VPN KESİNLİKLE kapalı olmalıdır. (Auth false-positive engellemek için).
- [ ] **CF Development Mode:** Cloudflare "Development Mode" KESİNLİKLE KAPALI (OFF) olmalıdır. (Gerçek cache davranışını görebilmek için).
- [ ] **Operasyon Disiplini (Tek Komuta Kuralı):** Aynı anda iki kişi DNS değiştiremez. Bir kişi Vercel rollback yaparken diğeri WAF kuralı açamaz. Geçiş işlemi tek bir operatörün komutasında sırayla yürütülür.

---

## 2. DNS Rollout Sequence (Kademeli Geçiş)

### Adım 1: Verification Check
- [ ] Vercel domain doğrulama (TXT) kayıtlarının Cloudflare DNS'inde "DNS Only" (Gri Bulut) olduğunu teyit et.
- [ ] CF SSL Modunun "Full (Strict)" olduğunu teyit et.

### Adım 2: Phase 1 (Sadece `www` Proxy)
- [ ] Cloudflare DNS'de `www` kaydını Proxied (Turuncu Bulut) yap.
- [ ] CF DNS sayfasını yenile, Proxy statüsünün değiştiğini gör.
- [ ] Chrome Gizli Sekmeden `https://www.minifigurlerim.com/tr` adresine gir. (Açılıyorsa Success).

### Adım 3: Phase 2 (Apex `@` Proxy)
- [ ] `www` başarılıysa, Cloudflare DNS'de apex (`@`) A kaydını Proxied (Turuncu Bulut) yap.
- [ ] Chrome Gizli Sekmeden `https://minifigurlerim.com/tr` adresine gir. 
- [ ] URL'in yönlendirmeler dahil düzgün açıldığını gör (Success).

### Adım 4: Güvenlik Kurallarını Ateşleme
- [ ] Cloudflare Cache Rules altındaki "Explicit Bypass" kuralını Enable yap.
- [ ] Cloudflare WAF altındaki "Block Bots" kuralını Enable yap.

---

## 3. Header QA Sequence (Kritik Doğrulama)
*Chrome Network sekmesinden URL'lere istek atıp Response Header'ları kontrol et.*

- [ ] **URL:** `/cto/login`
  - `cf-cache-status`: `DYNAMIC` veya `BYPASS` olmalı. (**`HIT` İSE ANINDA ROLLBACK!**)
  - `x-vercel-cache`: `MISS` veya `BYPASS` olmalı.
- [ ] **URL:** `/koleksiyonum` (Login olunmuş Safari üzerinden)
  - `cf-cache-status`: `DYNAMIC` veya `BYPASS` olmalı.
  - `cache-control`: `private, no-cache, no-store` içermeli.
- [ ] **URL:** `/api/auth/callback` (Auth akışı sırasında)
  - `cf-cache-status`: `DYNAMIC` veya `BYPASS` olmalı.
- [ ] **URL:** `/tr/figurler/marvel/spider-man` (Public Sayfa)
  - `cf-cache-status`: `DYNAMIC` olmalı (CF cache'lememeli).
  - `x-vercel-cache`: `HIT` veya `STALE` olmalı.

---

## 4. Auth & Cross-Device QA (Kimlik Doğrulama ve Mobil Testleri)
*Header testleri geçildiyse gerçek login denemelerine geçilir.*

- [ ] **Google Login:** Giriş sayfasına git, Google ile giriş yap. Origin/CORS hatası almadan `koleksiyonum` sayfasına yönlendiğini gör.
- [ ] **Email/Password:** Normal e-posta ile giriş yap.
- [ ] **Session Persistence:** Sayfayı F5 ile yenile. Oturumun düşmediğini teyit et.
- [ ] **Koleksiyon Testi:** Bir figür ekle/çıkar. İşlemin başarılı olduğunu gör.
- [ ] **Logout:** Çıkış yap. Geri tuşuna basınca yetkisiz şekilde `/koleksiyonum` sayfasındaki eski kilitli datayı GÖRMEDİĞİNİ doğrula.
- [ ] **Mobile Network Smoke Test:** Masaüstü başarılıysa; Wi-Fi KAPANARAK hücresel veri (4G/5G) üzerinden iPhone Safari veya Android Chrome ile siteye girilir ve login akışı (redirect/cookie problemi olup olmadığı) test edilir.

---

## 5. WAF QA (Bot ve Atak Testleri)
*Uygulamanın dışarıdan korunup korunmadığını test et.*

- [ ] Terminalden curl at: `curl -I https://minifigurlerim.com/wp-admin`
  - Beklenen Sonuç: `403 Forbidden` (Veya CF block sayfası). Vercel'e ulaşmamalı.
- [ ] Terminalden curl at: `curl -I https://minifigurlerim.com/.env`
  - Beklenen Sonuç: `403 Forbidden`.
- [ ] CTO sayfasına erişim: `/cto` sayfasına girildiğinde gereksiz yere Cloudflare Challenge (Turnstile captcha) döngüsüne DÜŞMEDİĞİNİ doğrula. (False positive testi).

---

## 6. Rollback Rehearsal (Acil Geri Dönüş Tatbikatı)
*Herhangi bir adım başarısız olursa DÜŞÜNMEDEN uygulanacak akış:*

1. [ ] Cloudflare Dashboard -> DNS sekmesine gir.
2. [ ] `www` CNAME kaydını **DNS Only** (Gri Bulut) yap.
3. [ ] `@` A kaydını **DNS Only** (Gri Bulut) yap.
4. [ ] Cloudflare Caching -> Configuration sayfasına gir ve **"Purge Everything"** butonuna bas.
5. [ ] Vercel loglarında Redirect Loop hatalarının kesildiğini (1-2 dk içinde) izle.
6. [ ] **DNS Propagation Doğrulaması:** Sadece tarayıcı üzerinden değil; terminalde `dig minifigurlerim.com` ve `nslookup minifigurlerim.com` komutlarıyla veya `whatsmydns.net` üzerinden IP'nin CF'den çıkıp Vercel'e (`76.76.21.21`) döndüğünü teyit et.
7. [ ] Browser'dan hard refresh (Cmd+Shift+R) yaparak sistemin eski, stabil haline döndüğünü teyit et.

---

## 7. “Go / No-Go” Criteria ve Final Freeze (Geçiş Kararı)

### 🟢 GO (Rollout Başarılı, Devam!)
- Header QA aşamasında hiçbir dinamik yolda (login, koleksiyonum, api) `cf-cache-status: HIT` **görülmediyse**.
- Google Login dahil tüm auth callback'ler mobil ağlar dahil sorunsuz yönleniyorsa.
- Public sayfalar (figür detay vb.) 200 HTTP koduyla ve hızlı (x-vercel-cache: HIT) açılıyorsa.

### 🔴 NO-GO (Anında Rollback Yap!)
- Ziyaretçiler siteye girdiğinde `ERR_TOO_MANY_REDIRECTS` alıyorsa (SSL uyuşmazlığı).
- Ziyaretçiler `/koleksiyonum` sayfasına girdiğinde başkasının figürlerini görüyorsa (Cache Leakage).
- `supabase.auth` işlemleri CF tarafından 403 Forbidden veya 522 Timeout yiyorsa.

### 🛑 FINAL FREEZE RULE (Post-Rollout)
Geçiş başarılı (GO) olduktan sonra **minimum 24 SAAT BOYUNCA:**
- Yeni WAF rule eklemek/değiştirmek YASAKTIR.
- Yeni Cache rule eklemek YASAKTIR.
- Yeni Redirect rule eklemek YASAKTIR.
- DNS tarafında yeni kayıt eklemek YASAKTIR.
- *Amaç: Geçişin stabilite gözlemini (monitoring) "değişkenleri izole ederek" yapabilmektir.*
