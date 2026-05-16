# 🔍 Cloudflare Cache Rule Priority & Risk Audit

Önceliğimizin "önce güvenlik/stabilite, sonra cache optimizasyonu" olduğu senaryoya göre Cloudflare önbellek davranışlarının analizidir.

---

## 1. Safe Defaults vs Explicit Rules
Cloudflare'in "Standard" caching seviyesi, uzantısız dinamik sayfalarda (`/koleksiyonum`, `/cto`) genel olarak HTML cache'lemesi yapmaz (Safe default). Ancak production güvenliğinde "genellikle yapmaz" veya "güvenli default" varsayımlarına bel bağlanmaz; tüm kritik path'ler açık kurallarla (explicit rules) korunmalı ve response header'lar ile doğrulanmalıdır.

Bu nedenle lansman öncesi **"HİÇBİR RİSK ALMAMAK"** adına, Cloudflare Cache Rules kullanılarak yetki gerektiren sayfalara ve API endpoint'lerine **Explicit Bypass Cache** kuralları atanacaktır. (Bkz: `cloudflare_rollout_plan.md`).

## 2. "Cache Everything" ve Optimizasyon
- **Lansman Öncesi Karar:** KESİNLİKLE KULLANILMAYACAK.
- Vercel'in kendi ISR / Route Caching altyapısı ana cache katmanımızdır. Cloudflare'in tüm sistemi agresif olarak cache'lemesi (Cache Everything) şu aşamada sadece auth leakage ve admin panelin dışarı sızması risklerini doğurur.
- Cache optimizasyonu ancak lansman sonrası stabilite kanıtlandıktan sonra, "sadece statik sayfalara" (örn: `/tr/figurler/*`) uygulanmak üzere ikinci faza bırakılmıştır.

## 3. Verification Method (Doğrulama Yöntemi)
Tüm explicit bypass kuralları girildikten ve proxy açıldıktan sonra mutlak doğrulama metodu response header'lardır. F12 -> Network sekmesinden yapılacak kontroller:

| İstek Hedefi | `cf-cache-status` Beklentisi | `x-vercel-cache` Beklentisi |
| :--- | :--- | :--- |
| **Bypass Rules İçindeki Sayfalar** (`/cto`, `/api`, `/koleksiyonum`, `?code=...`) | KESİNLİKLE `DYNAMIC` veya `BYPASS` olmalı. (`HIT` görürsen DNS Only'e dön!) | `MISS` veya `BYPASS` (Vercel dinamik render etti) |
| **Public Figür / SEO Sayfaları** (`/tr/figurler/...`) | CF tarafında özel rule olmadığı için `DYNAMIC` olmalı. | `HIT` veya `STALE` (Vercel Edge/ISR önbelleğinden geldi) |

Eğer `/cto/login` sayfasına girdiğinizde response header'da `cf-cache-status: HIT` görüyorsanız, anında proxy'yi kapatın. Bu, CF tarafında yanlışlıkla tüm HTML'in cache'lendiği anlamına gelir.
