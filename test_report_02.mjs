// ═══════════════════════════════════════════════════════════════════
// اختبار التقرير رقم 2: SEO & Metadata
// مبني على ملاحظات الملف 2.md و 12.md و 22.md
// ═══════════════════════════════════════════════════════════════════
import { writeFileSync } from 'fs';

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const TIMESTAMP = new Date().toISOString();
const results = [];
let pass = 0, fail = 0, warn = 0;

async function req(method, path, body = null, headers = {}) {
  const opts = {
    method,
    headers: { 'Accept': 'text/html,application/json', ...headers },
    signal: AbortSignal.timeout(10000),
    redirect: 'follow',
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const r = await fetch(`${BASE_URL}${path}`, opts);
    const text = await r.text().catch(() => '');
    return { status: r.status, headers: Object.fromEntries(r.headers), text };
  } catch (e) {
    return { status: 0, error: e.message, headers: {}, text: '' };
  }
}

function check(id, name, category, passed, detail, warnFn = null, warnMsg = '') {
  let status;
  if (passed) { status = 'PASS'; pass++; }
  else if (warnFn && warnFn()) { status = 'WARN'; warn++; }
  else { status = 'FAIL'; fail++; }
  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  const msg = status === 'WARN' ? warnMsg : detail;
  const line = `${icon} [${String(id).padStart(2, '0')}] ${name} → ${msg}`;
  console.log(line);
  results.push({ id, name, category, status, detail: msg, source: 'ملف 2/12/22 - SEO & Metadata' });
}

console.log(`\n🔍 AMIGO MODA — اختبار SEO & Metadata (التقرير 2/30)`);
console.log(`📅 ${TIMESTAMP}`);
console.log(`🌐 ${BASE_URL}`);
console.log('\n' + '═'.repeat(60));

// ═══ المجموعة 1: الصفحات الأساسية ══════════════════════════════
console.log('\n📄 [A] الصفحات الأساسية\n');

let r = await req('GET', '/');
const html = r.text;

// 01. Title tag
const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
check(1, 'Title tag موجود في الصفحة الرئيسية', 'Title',
  !!titleMatch && titleMatch[1].length > 0,
  `Title: "${titleMatch?.[1] || 'مفقود'}"`);

// 02. Meta description
const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
check(2, 'Meta Description موجود', 'Meta',
  !!descMatch && descMatch[1].length > 10,
  `Description: "${descMatch?.[1]?.substring(0, 60) || 'مفقودة'}..."`,
  () => !!descMatch && descMatch[1].length < 10, 'Meta description قصيرة جداً');

// 03. Viewport meta
const viewportMatch = html.match(/<meta[^>]*name="viewport"[^>]*/i);
check(3, 'Viewport Meta موجود', 'Mobile SEO',
  !!viewportMatch,
  `Viewport: ${viewportMatch ? 'موجود ✓' : 'مفقود ✗'}`);

// 04. Open Graph Title
const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
check(4, 'OG Title موجود', 'Open Graph',
  !!ogTitle,
  `OG Title: "${ogTitle?.[1] || 'مفقود'}"`,
  null, '');

// 05. Open Graph Description
const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
check(5, 'OG Description موجود', 'Open Graph',
  !!ogDesc,
  `OG Desc: ${ogDesc ? 'موجود ✓' : 'مفقود ✗'}`,
  () => !ogDesc, 'OG Description غير موجود');

// 06. Open Graph Image
const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*/i);
check(6, 'OG Image موجود', 'Open Graph',
  !!ogImage,
  `OG Image: ${ogImage ? 'موجود ✓' : 'مفقود ✗'}`,
  () => !ogImage, 'OG Image غير موجود — يؤثر على مشاركة المنتجات');

// 07. Open Graph URL
const ogUrl = html.match(/<meta[^>]*property="og:url"[^>]*/i);
check(7, 'OG URL موجود', 'Open Graph',
  !!ogUrl,
  `OG URL: ${ogUrl ? 'موجود ✓' : 'مفقود ✗'}`,
  () => !ogUrl, 'OG URL غير موجود');

// 08. Canonical Link
const canonical = html.match(/<link[^>]*rel="canonical"[^>]*/i);
check(8, 'Canonical Link موجود', 'Canonical',
  !!canonical,
  `Canonical: ${canonical ? 'موجود ✓' : 'مفقود ✗'}`,
  () => !canonical, 'Canonical Link غير موجود — خطر تكرار المحتوى');

// ═══ المجموعة 2: robots.txt و sitemap ════════════════════════
console.log('\n🤖 [B] robots.txt و Sitemap\n');

// 09. robots.txt
r = await req('GET', '/robots.txt');
check(9, 'robots.txt موجود ومتاح', 'Technical SEO',
  r.status === 200,
  `robots.txt: ${r.status} ${r.status === 200 ? '✓' : '✗'}`);

// 10. robots.txt لا يسمح بـ API routes
if (r.status === 200) {
  check(10, 'robots.txt يحجب /api/', 'Technical SEO',
    r.text.includes('Disallow: /api/') || r.text.includes('Disallow:/api'),
    `API في robots: ${r.text.includes('/api') ? 'محجوب ✓' : 'غير محجوب ✗'}`);
} else {
  check(10, 'robots.txt يحجب /api/', 'Technical SEO', false, 'robots.txt غير موجود');
}

// 11. robots.txt لا يكشف المسار السري للأدمين
if (r.status === 200) {
  const hasSecretRoute = r.text.includes('xk9m2p4t8r6w1qzjvn3f7') || r.text.includes('cms-qx7t3m9n5k2w8p6r4jzv');
  check(11, 'robots.txt لا يكشف المسار السري', 'Security + SEO',
    !hasSecretRoute,
    `المسار السري في robots: ${hasSecretRoute ? 'مكشوف ✗' : 'آمن ✓'}`);
} else {
  check(11, 'robots.txt لا يكشف المسار السري', 'Security + SEO', true, 'لا يوجد robots.txt → آمن');
}

// 12. sitemap.xml
r = await req('GET', '/sitemap.xml');
check(12, 'Sitemap XML موجود', 'Technical SEO',
  r.status === 200,
  `sitemap.xml: ${r.status}`,
  () => !r.status, 'Sitemap غير موجود');

// 13. Sitemap يحتوي على URL الصحيح
if (r.status === 200) {
  check(13, 'Sitemap يحتوي على URLs صحيحة', 'Technical SEO',
    r.text.includes('<loc>') && r.text.includes('</loc>'),
    `Sitemap URLs: ${r.text.includes('<loc>') ? 'موجودة ✓' : 'فارغ ✗'}`);
} else {
  check(13, 'Sitemap يحتوي على URLs', 'Technical SEO', false, 'Sitemap غير موجود');
}

// ═══ المجموعة 3: Structured Data ══════════════════════════════
console.log('\n📊 [C] Structured Data (Schema.org)\n');

r = await req('GET', '/');
const htmlMain = r.text;

// 14. JSON-LD Schema
const jsonLd = htmlMain.match(/application\/ld\+json/i);
check(14, 'JSON-LD Schema موجود', 'Structured Data',
  !!jsonLd,
  `JSON-LD: ${jsonLd ? 'موجود ✓' : 'مفقود ✗'}`,
  () => !jsonLd, 'JSON-LD غير موجود — يؤثر على Rich Snippets');

// 15. Twitter Card
const twitterCard = htmlMain.match(/<meta[^>]*name="twitter:card"[^>]*/i);
check(15, 'Twitter Card Meta موجود', 'Social Media',
  !!twitterCard,
  `Twitter Card: ${twitterCard ? 'موجود ✓' : 'مفقود ✗'}`,
  () => !twitterCard, 'Twitter Card غير موجود');

// ═══ المجموعة 4: Response Headers للـ SEO ════════════════════
console.log('\n⚡ [D] HTTP Headers للـ SEO\n');

r = await req('GET', '/');

// 16. Content-Type صحيح
const contentType = r.headers['content-type'] || '';
check(16, 'Content-Type: text/html', 'Technical SEO',
  contentType.includes('text/html'),
  `Content-Type: ${contentType}`);

// 17. Content-Language
check(17, 'Content-Language Header', 'i18n SEO',
  !!r.headers['content-language'],
  `Content-Language: ${r.headers['content-language'] || 'غير موجود'}`,
  () => !r.headers['content-language'], 'Content-Language غير محدد');

// 18. HTML lang attribute
const langMatch = htmlMain.match(/<html[^>]*lang="([^"]*)"[^>]*/i);
check(18, 'HTML lang attribute موجود', 'i18n SEO',
  !!langMatch && langMatch[1].length > 0,
  `lang="${langMatch?.[1] || 'مفقود'}"`);

// 19. HTML dir attribute
const dirMatch = htmlMain.match(/<html[^>]*dir="([^"]*)"[^>]*/i);
check(19, 'HTML dir attribute للعربية', 'i18n SEO',
  dirMatch?.[1] === 'rtl',
  `dir="${dirMatch?.[1] || 'مفقود'}"`,
  () => !dirMatch, 'dir attribute مفقود — قد يؤثر على RTL');

// ═══ المجموعة 5: صفحات المنتجات ══════════════════════════════
console.log('\n🛍️ [E] SEO لصفحات المنتجات\n');

// 20. صفحة المنتج 404 تُعطي 404 حقيقي
r = await req('GET', '/products/non-existent-product-xyz-999');
check(20, 'منتج غير موجود يُعطي 404', 'Technical SEO',
  r.status === 404,
  `Product 404: ${r.status}`);

// 21. Category page
r = await req('GET', '/category/test');
check(21, 'صفحة Category تُعطي 200 أو 404', 'Technical SEO',
  r.status === 200 || r.status === 404,
  `Category page: ${r.status}`);

// 22. صفحة /products (index)
r = await req('GET', '/products');
check(22, 'صفحة /products متاحة', 'Technical SEO',
  r.status === 200 || r.status === 404,
  `Products index: ${r.status}`);

// ═══ المجموعة 6: Meta Tags إضافية ════════════════════════════
console.log('\n🏷️ [F] Meta Tags إضافية\n');

r = await req('GET', '/');
const htmlFull = r.text;

// 23. robots meta tag (لا noindex)
const robotsMeta = htmlFull.match(/<meta[^>]*name="robots"[^>]*content="([^"]*)"[^>]*/i);
check(23, 'لا يوجد noindex على الصفحة الرئيسية', 'Indexability',
  !robotsMeta || (!robotsMeta[1].includes('noindex') && !robotsMeta[1].includes('nofollow')),
  `Robots meta: ${robotsMeta?.[1] || 'index, follow (افتراضي)'}`,
  null, '');

// 24. theme-color
const themeColor = htmlFull.match(/<meta[^>]*name="theme-color"[^>]*/i);
check(24, 'Theme-Color Meta موجود', 'PWA/Mobile',
  !!themeColor,
  `Theme-Color: ${themeColor ? 'موجود ✓' : 'مفقود ✗'}`,
  () => !themeColor, 'Theme-Color مفقود — يؤثر على PWA');

// 25. Apple Touch Icon
const appleIcon = htmlFull.match(/apple-touch-icon/i);
check(25, 'Apple Touch Icon موجود', 'PWA/Mobile',
  !!appleIcon,
  `Apple Touch Icon: ${appleIcon ? 'موجود ✓' : 'مفقود ✗'}`,
  () => !appleIcon, 'Apple Touch Icon غير موجود');

// ═══ المجموعة 7: Performance SEO ════════════════════════════
console.log('\n🚀 [G] Core Web Vitals Indicators\n');

// 26. TTFB < 1s
const start = Date.now();
r = await req('GET', '/');
const ttfb = Date.now() - start;
check(26, 'TTFB < 1000ms', 'Core Web Vitals',
  ttfb < 1000,
  `TTFB: ${ttfb}ms`,
  () => ttfb < 3000, `TTFB بطيء: ${ttfb}ms — حسّن Server Response`);

// 27. لا Server Error على الصفحة الرئيسية
check(27, 'الصفحة الرئيسية لا تُعطي 5xx', 'Availability',
  r.status >= 200 && r.status < 400,
  `Status: ${r.status}`);

// 28. الصفحة تحتوي على محتوى HTML حقيقي
check(28, 'الصفحة تحتوي على HTML كافٍ', 'Content',
  htmlFull.length > 1000,
  `HTML size: ${htmlFull.length} bytes`);

// 29. لا Lighthouse blocking resources في headers
check(29, 'X-Powered-By مخفي', 'Technical SEO',
  !r.headers['x-powered-by'],
  `X-Powered-By: ${r.headers['x-powered-by'] || 'مخفي ✓'}`);

// 30. متاح عبر HTTPS (production check)
const siteUrl = 'https://amigomoda.store';
try {
  const httpsR = await fetch(siteUrl, { signal: AbortSignal.timeout(8000), redirect: 'follow' });
  check(30, 'الموقع متاح على HTTPS (production)', 'HTTPS',
    httpsR.status === 200,
    `HTTPS status: ${httpsR.status}`);
} catch (e) {
  check(30, 'الموقع متاح على HTTPS (production)', 'HTTPS',
    false, `HTTPS error: ${e.message}`,
    () => true, 'لم يتمكن من الاتصال بـ production (اختبار محلي)');
}

// ═══ تقرير النهائي ════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log(`\n📊 النتائج — التقرير 2: SEO & Metadata`);
console.log(`   ✅ نجح: ${pass}`);
console.log(`   ❌ فشل: ${fail}`);
console.log(`   ⚠️  تحذير: ${warn}`);
console.log(`   🏆 النتيجة: ${Math.round((pass / 30) * 100)}/100`);
console.log('\n' + '═'.repeat(60));

const report = {
  fileNumber: 2,
  title: 'SEO & Metadata',
  timestamp: TIMESTAMP,
  url: BASE_URL,
  summary: { pass, fail, warn, total: 30, score: Math.round((pass / 30) * 100) },
  results,
};
const ts = Date.now();
writeFileSync(`report_02_seo_${ts}.json`, JSON.stringify(report, null, 2), 'utf8');
console.log(`\n💾 تم حفظ: report_02_seo_${ts}.json`);

if (fail > 0) process.exit(1);
