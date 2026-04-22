This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## ⚠️ Post-Launch Critical Tasks

- **P1: Series Trend Metric (views_30d)** → *Referans: Issue #XX veya docs/operations/tech-debt-backlog.md*

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Documentation & Architecture Rules

Projenin tüm mimari kararları, test senaryoları ve yazılım standartları `/docs` klasörü altında yönetilir:
- **[Architecture](/docs/architecture)**: Rota envanterleri, SSR stratejileri.
- **[Standards](/docs/standards)**: Naming conventions, marka ve dil bütünlüğü kopyaları.
- **[Testing](/docs/testing)**: Smoke test ve QA checklistleri. (E2E Testler otonom koşar. Bkz: `npm run test:e2e`)
- **[Operations](/docs/operations)**: Technical debt (teknik borç) ve build uyarıları backlog'u.

**⚠️ ZORUNLU MİMARİ KURAL:**
- Yeni mimari karar → `/docs` klasörüne yazılmadan geçerli sayılmaz.
- Yeni kural → Lint veya Test ağlarıyla enforce edilmeden tamamlanmış sayılmaz.
- `docs` dışında kalan ve ağızdan ağza dolaşan bilgi → "bilinmeyen bilgi" kabul edilir ve PR süreçlerinde referans alınamaz.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
