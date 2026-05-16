# ☁️ Cloudflare Pre-Launch Safe Rollout Checklist

Bu doküman, Minifigurlerim platformunun Cloudflare (Proxy/Orange Cloud) geçişini güvenli bir şekilde gerçekleştirmek için hazırlanmış nihai operasyon planıdır.

---

## 1. Initial Rollout Kararları
- **DNS Proxy:** ON (Turuncu Bulut)
- **SSL Modu:** Full Strict
- **Cache Everything:** OFF
- **Custom Aggressive Cache Rules:** OFF
- **WAF Minimum Rules:** ON
- **WordPress/Scanner Bot Block:** ON
- **Kritik Dinamik Rotalar:** Güvenlik katmanı olarak *Explicit Bypass Cache Rule* ile korunacak. Vercel cache sistemi ana cache katmanı olarak kalacaktır.

---

## 2. Ön Hazırlık: Explicit Bypass Cache Kuralları
Cloudflare Standard mod varsayılan olarak dinamik rotaları cache'lemese de (Safe default), production güvenliği için aşağıdaki path'ler Cloudflare Cache Rules içerisinde **kesinlikle** "Bypass Cache" olarak tanımlanmalıdır:
- `/admin/*`
- `/cto/*`
- `/api/*`
- `/auth/*`
- `/login*`
- `/koleksiyonum/*`
- *URI Query String contains* `code=`
- *URI Query String contains* `token=`

---

## 3. Ön Hazırlık: WAF Block Kuralları
Vercel faturasını şişiren standart tarayıcı ve bot saldırılarını engellemek için Cloudflare WAF Custom Rules alanına aşağıdaki URI path'ler için **Block / Managed Challenge** kuralı girilmelidir:
- `/wp-admin*`
- `/wp-login.php*`
- `/wp-content*`
- `/xmlrpc.php*`
- `/.env*`
- `/.git*`

---

## 4. DNS Rollout Aşamaları (Kör Açma Yok)
1. Cloudflare üzerinden SSL Mode'un **Full Strict** olduğunu doğrula.
2. Vercel domain verification TXT kayıtlarının Cloudflare'de DNS Only (Gri Bulut) durduğundan emin ol.
3. Önce sadece `www` CNAME kaydını Proxied (Turuncu Bulut) yap.
4. QA (Bkz. Aşama 5).
5. QA başarılıysa apex (`@`) A kaydını Proxied yap.
6. Tekrar QA.
7. WAF ve Cache Bypass kurallarını Enable yap.
8. Final QA.

---

## 5. Header QA & Verification Checklist
Proxy açıldıktan sonra Gizli Sekme üzerinden Network tabından doğrulanması gerekenler:
- [ ] `/cto/login` -> `cf-cache-status: DYNAMIC` (veya `BYPASS`) olmalı. KESİNLİKLE `HIT` olmamalı.
- [ ] `/koleksiyonum` -> `cf-cache-status: HIT` OLMAMALI.
- [ ] `/api/*` -> `cf-cache-status: HIT` OLMAMALI.
- [ ] `/tr` ve public figür sayfaları -> `cf-cache-status` CF tarafında HIT beklenmiyor (DYNAMIC/MISS olmalı), ancak Vercel tarafında `x-vercel-cache: HIT` veya `STALE` olabilir.

---

## 6. Rollback Plan
Operasyon sırasında SSL Loop veya Auth Crash gibi bir felaket yaşanırsa:
1. `www` ve apex (`@`) kayıtlarını anında **DNS Only** (Gri Bulut) yap.
2. Cloudflare üzerinden **Purge Everything** komutunu çalıştır.
3. Browser hard refresh (Cmd+Shift+R) yap ve 1-5 dakika içinde sistemin eski haline döndüğünü test et.
