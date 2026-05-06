import fs from 'fs';
import path from 'path';

console.log('🔍 Running Phase 4 SEO QA Automation...');

let hasError = false;

function fail(msg) {
  console.error(`❌ FAIL: ${msg}`);
  hasError = true;
}

function pass(msg) {
  console.log(`✅ PASS: ${msg}`);
}

// 1. Check metadata helper purity (no cookies/headers/auth)
const seoHelperPath = path.resolve('./src/lib/seo.ts');
if (fs.existsSync(seoHelperPath)) {
  const seoHelperCode = fs.readFileSync(seoHelperPath, 'utf-8');
  if (seoHelperCode.includes('cookies(') || seoHelperCode.includes('headers(')) {
    fail('src/lib/seo.ts contains cookies() or headers(). This breaks Static ISR caching!');
  } else if (seoHelperCode.includes('auth') || seoHelperCode.includes('createClient')) {
    fail('src/lib/seo.ts contains auth client or request-bound logic. This breaks Static ISR caching!');
  } else {
    pass('Metadata helper is pure and cacheable.');
  }
} else {
  fail('src/lib/seo.ts not found!');
}

// 2. Check JSON-LD isolation
const jsonLdPath = path.resolve('./src/lib/jsonLd.ts');
if (fs.existsSync(jsonLdPath)) {
  const jsonLdCode = fs.readFileSync(jsonLdPath, 'utf-8');
  const bannedKeywords = ['Product', 'Offer', 'priceCurrency', 'availability'];
  // We allow "price" word inside some variable names or natural text, but explicitly check for exact schema keys
  const bannedPatterns = [
    /"@type"\s*:\s*["']Product["']/i,
    /"@type"\s*:\s*["']Offer["']/i,
    /"@type"\s*:\s*["']AggregateOffer["']/i,
    /"price"\s*:/i,
    /"priceCurrency"\s*:/i,
    /"availability"\s*:/i,
    /"seller"\s*:/i
  ];
  
  let jsonLdSafe = true;
  for (const pattern of bannedPatterns) {
    if (pattern.test(jsonLdCode)) {
      fail(`src/lib/jsonLd.ts contains eCommerce schema footprint: ${pattern.toString()}`);
      jsonLdSafe = false;
    }
  }
  if (jsonLdSafe) pass('JSON-LD schema is purely non-commercial (Archive-safe).');
} else {
  fail('src/lib/jsonLd.ts not found!');
}

// 3. Check OG Endpoint existence
const endpoints = [
  'src/app/api/og/figure/route.tsx',
  'src/app/api/og/series/route.tsx',
  'src/app/api/og/news/route.tsx'
];
let endpointsExist = true;
endpoints.forEach(ep => {
  if (!fs.existsSync(path.resolve(ep))) {
    fail(`OG Endpoint missing: ${ep}`);
    endpointsExist = false;
  }
});
if (endpointsExist) pass('All OG generation endpoints exist.');

// 4. Check robots.ts / robots.txt
const robotsPath = path.resolve('./src/app/robots.ts');
let robotsTxtExists = false;
if (fs.existsSync(robotsPath)) {
    robotsTxtExists = true;
    const robotsCode = fs.readFileSync(robotsPath, 'utf-8');
    if (!robotsCode.includes('/api/') || !robotsCode.includes('/cto/') || (!robotsCode.includes('/admin/') && !robotsCode.includes('/admin')) || !robotsCode.includes('/maintenance')) {
        fail('robots.ts is missing Disallow rules for /api/, /admin, /cto/ or /maintenance');
    } else {
        pass('robots.ts correctly blocks /api/, /admin, /cto/, and /maintenance paths.');
    }
} else if (fs.existsSync(path.resolve('./public/robots.txt'))) {
    robotsTxtExists = true;
    const robotsCode = fs.readFileSync(path.resolve('./public/robots.txt'), 'utf-8');
    if (!robotsCode.includes('/api/') || !robotsCode.includes('/cto/') || (!robotsCode.includes('/admin/') && !robotsCode.includes('/admin')) || !robotsCode.includes('/maintenance')) {
        fail('public/robots.txt is missing Disallow rules for /api/, /admin, /cto/ or /maintenance');
    } else {
        pass('public/robots.txt correctly blocks private paths.');
    }
} else {
    fail('No robots.txt or robots.ts found.');
}

// 5. Check Sitemaps (We will scan .next/server/app for generated XML files since build is complete)
const nextAppPath = path.resolve('./.next/server/app');
if (fs.existsSync(nextAppPath)) {
  const files = fs.readdirSync(nextAppPath);
  const sitemaps = files.filter(f => f.startsWith('sitemap') && (f.endsWith('.xml') || f.endsWith('.body')));
  
  if (sitemaps.length === 0) {
    fail('No generated sitemaps found in .next/server/app. Did build fail?');
  } else {
    let sitemapSafe = true;
    for (const sm of sitemaps) {
      const fullPath = path.join(nextAppPath, sm);
      if (fs.statSync(fullPath).isDirectory()) continue;
      
      const xml = fs.readFileSync(fullPath, 'utf-8');
      
      // Index check
      if (sm === 'sitemap.xml') {
        if (!xml.includes('sitemap-series-tr.xml') || !xml.includes('sitemap-figures-tr.xml')) {
           fail('sitemap.xml (index) does not list expected localized sub-sitemaps.');
           sitemapSafe = false;
        }
      }
      
      const locRegex = /<loc>(.*?)<\/loc>/g;
      let match;
      while ((match = locRegex.exec(xml)) !== null) {
        const url = match[1];
        
        // Exclude sitemap index URLs from slash checks if they naturally end with .xml
        if (url.endsWith('.xml')) continue;
        
        if (url.includes('/maintenance')) {
          fail(`Sitemap ${sm} contains /maintenance path: ${url}`);
          sitemapSafe = false;
        }
        if (url.includes('?')) {
          fail(`Sitemap ${sm} contains query parameters: ${url}`);
          sitemapSafe = false;
        }
        if (url !== url.toLowerCase() && !url.includes('api/og')) {
          fail(`Sitemap ${sm} contains uppercase characters in URL: ${url}`);
          sitemapSafe = false;
        }
        // trailing slash check (ignore root url with single slash)
        const urlObj = new URL(url);
        if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
          fail(`Sitemap ${sm} contains trailing slash: ${url}`);
          sitemapSafe = false;
        }
      }
    }
    
    if (sitemapSafe) pass(`All ${sitemaps.length} sitemaps passed formatting and isolation rules.`);
  }
} else {
  console.log('⚠️ Skipping sitemap checks because .next/server/app does not exist (Build not run yet).');
}

console.log('----------------------------------------------------');
if (hasError) {
  console.error('❌ SEO QA FAILED! Check the errors above.');
  process.exit(1);
} else {
  console.log('🚀 SEO QA PASSED!');
  process.exit(0);
}
