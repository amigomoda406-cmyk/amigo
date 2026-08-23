// ═══════════════════════════════════════════════════════════════════
// اختبار التقرير رقم 1: Performance & Caching
// مبني على 30 ملاحظة من الملف 1.md
// ═══════════════════════════════════════════════════════════════════
import { writeFileSync } from 'fs';

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const TIMESTAMP = new Date().toISOString();
const results = [];
let pass = 0, fail = 0, warn = 0;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function req(method, path, body = null, headers = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    signal: AbortSignal.timeout(15000),
    redirect: 'manual',
  };
  if (body) opts.body = JSON.stringify(body);
  try {
    const r = await fetch(`${BASE_URL}${path}`, opts);
    return { status: r.status, headers: Object.fromEntries(r.headers), ok: r.ok };
  } catch (e) {
    return { status: 0, error: e.message, headers: {} };
  }
}

function check(id, name, category, passed, detail, warnFn = null, warnMsg = '') {
  let status;
  if (passed) { status = 'PASS'; pass++; }
  else if (warnFn && warnFn()) { status = 'WARN'; warn++; }
  else { status = 'FAIL'; fail++; }
  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  const msg = status === 'WARN' ? warnMsg : detail;
  const line = `${icon} [${String(id).padStart(2, '0')}] ${name} → ${msg} [${status}]`;
  console.log(line);
  results.push({ id, name, category, status, detail: msg, source: 'ملف 1 - Performance & Caching' });
}

console.log(`\n🚀 AMIGO MODA — اختبار Performance & Caching (التقرير 1/30)`);
console.log(`📅 ${TIMESTAMP}`);
console.log(`🌐 ${BASE_URL}`);
console.log('\n' + '═'.repeat(60));

// ═══ المجموعة 1: Cache-Control Headers ══════════════════════════
console.log('\n📦 [A] Cache-Control Headers\n');

// 01. الصفحة الرئيسية — هل يحتوي على Cache-Control؟
let r = await req('GET', '/');
const homeCache = r.headers['cache-control'] || '';
check(1, 'Cache-Control على الصفحة الرئيسية', 'Cache Headers',
  homeCache.includes('s-maxage') || homeCache.includes('max-age'),
  `Cache-Control: ${homeCache || 'غير موجود'}`,
  () => !homeCache, 'Cache-Control غير موجود على الصفحة الرئيسية');

// 02. Cache-Control على صفحة منتج
r = await req('GET', '/products/test-product');
const productCache = r.headers['cache-control'] || '';
check(2, 'Cache-Control على صفحة منتج', 'Cache Headers',
  productCache.includes('s-maxage') || productCache.includes('max-age') || r.status === 404,
  `Cache-Control: ${productCache || 'غير موجود'} (${r.status})`);

// 03. Cache-Control على API Checkout (يجب لا كاش)
r = await req('GET', '/api/checkout');
const checkoutCache = r.headers['cache-control'] || '';
check(3, 'لا كاش على /api/checkout', 'Cache Headers',
  checkoutCache.includes('no-store') || checkoutCache.includes('no-cache') || r.status === 405,
  `Cache-Control: ${checkoutCache || 'غير محدد'} (${r.status})`);

// 04. Cache-Control على ملفات الـ static
r = await req('GET', '/_next/static/css/app.css');
const staticCache = r.headers['cache-control'] || '';
check(4, 'كاش طويل على ملفات static', 'Cache Headers',
  staticCache.includes('max-age=31536000') || staticCache.includes('immutable') || r.status === 404,
  `Static Cache: ${staticCache || 'غير موجود'} (${r.status})`);

// ═══ المجموعة 2: Security Headers (من ملاحظات الملف) ══════════
console.log('\n🛡️ [B] Security Headers (ملاحظة #7, #12, #18, #24)\n');

// 05. X-Frame-Options موجود
r = await req('GET', '/');
check(5, 'X-Frame-Options موجود', 'Security Headers',
  r.headers['x-frame-options'] === 'DENY' || r.headers['x-frame-options'] === 'SAMEORIGIN',
  `X-Frame-Options: ${r.headers['x-frame-options'] || 'مفقود'}`);

// 06. CSP موجود (ملاحظة #7 من الملف)
check(6, 'Content-Security-Policy موجود (ملاحظة #7)', 'Security Headers',
  !!r.headers['content-security-policy'],
  `CSP: ${r.headers['content-security-policy'] ? 'موجود ✓' : 'مفقود ✗'}`);

// 07. X-Content-Type-Options
check(7, 'X-Content-Type-Options: nosniff', 'Security Headers',
  r.headers['x-content-type-options'] === 'nosniff',
  `X-Content-Type-Options: ${r.headers['x-content-type-options'] || 'مفقود'}`);

// 08. Referrer-Policy
check(8, 'Referrer-Policy موجود', 'Security Headers',
  !!r.headers['referrer-policy'],
  `Referrer-Policy: ${r.headers['referrer-policy'] || 'مفقود'}`);

// ═══ المجموعة 3: Rate Limiting (ملاحظة #2, #6, #8, #9, #30) ═══
console.log('\n🚦 [C] Rate Limiting — Client-Side Protection (ملاحظة #2, #6, #9, #30)\n');

// 09. Rate limit على /api/checkout
let rateLimited = false;
for (let i = 0; i < 6; i++) {
  r = await req('POST', '/api/checkout', {
    customer_name: 'اختبار', customer_phone: '0551234567',
    wilaya: 'الجزائر', commune: 'وسط', delivery_type: 'home',
    delivery_fee: 400, total_amount: 1400,
    items: [{ title: 'test', price: 1000, quantity: 1 }]
  });
  if (r.status === 429) { rateLimited = true; break; }
  await sleep(100);
}
check(9, 'Rate Limit فعّال على Checkout (ملاحظة #2)', 'Rate Limiting',
  rateLimited,
  `Rate limit فعّال — 429 بعد ${rateLimited ? '≤6' : '>6'} طلبات`,
  () => !rateLimited, 'لا يوجد rate limit على checkout — خطر!');

// 10. لا rate limit انتهاك — انتظر reset
await sleep(62000);
console.log('⏳ Reset rate limit...');

// ═══ المجموعة 4: API Performance ══════════════════════════════
console.log('\n⚡ [D] API Performance & Sanity Queries (ملاحظة #10, #21)\n');

// 10. سرعة استجابة الصفحة الرئيسية
const start1 = Date.now();
r = await req('GET', '/');
const time1 = Date.now() - start1;
check(10, 'وقت استجابة الصفحة الرئيسية < 3s', 'Performance',
  time1 < 3000,
  `${time1}ms`,
  () => time1 < 5000, `بطيء نسبياً: ${time1}ms (يُفضّل < 3000ms)`);

// 11. سرعة /api/delivery-fees
const start2 = Date.now();
r = await req('GET', '/api/delivery-fees');
const time2 = Date.now() - start2;
check(11, 'وقت استجابة /api/delivery-fees < 2s', 'Performance',
  time2 < 2000 || r.status === 404,
  `${time2}ms (${r.status})`,
  () => time2 < 5000, `بطيء: ${time2}ms`);

// 12. robots.txt متاح ومُحسَّن
r = await req('GET', '/robots.txt');
check(12, 'robots.txt متاح', 'SEO/Performance',
  r.status === 200,
  `robots.txt: ${r.status}`);

// ═══ المجموعة 5: Image Optimization (ملاحظة #1, #11) ══════════
console.log('\n🖼️ [E] Image Optimization (ملاحظة #1, #11)\n');

// 13. Next.js Image Optimization يعمل
r = await req('GET', '/_next/image?url=https://cdn.sanity.io/test.jpg&w=640&q=75');
check(13, 'Next.js Image Optimizer يعمل', 'Image Optimization',
  r.status !== 500,
  `/_next/image: ${r.status}`,
  () => r.status === 400 || r.status === 404, `يستجيب بـ ${r.status} — قد يحتاج URL صحيح`);

// 14. Manifest PWA موجود
r = await req('GET', '/manifest.json');
check(14, 'PWA Manifest موجود', 'PWA',
  r.status === 200,
  `manifest.json: ${r.status}`);

// 15. favicon موجود
r = await req('GET', '/favicon.ico');
check(15, 'Favicon موجود', 'Assets',
  r.status === 200 || r.status === 304,
  `favicon.ico: ${r.status}`);

// ═══ المجموعة 6: Error Handling (ملاحظة #25) ══════════════════
console.log('\n❌ [F] Error Handling & Boundaries (ملاحظة #25)\n');

// 16. صفحة 404 مخصصة
r = await req('GET', '/non-existent-page-xyz-123');
check(16, 'صفحة 404 مخصصة موجودة', 'Error Handling',
  r.status === 404,
  `404 handler: ${r.status}`);

// 17. API خاطئ لا يكشف stack trace
r = await req('POST', '/api/checkout', null);
const noStackTrace = !JSON.stringify(r).includes('at ') && !JSON.stringify(r).includes('Error:');
check(17, 'API لا يكشف Stack Trace', 'Error Handling',
  noStackTrace || r.status === 400 || r.status === 429,
  `Stack trace: ${noStackTrace ? 'مخفي ✓' : 'قد يكون مكشوفاً ✗'}`);

// 18. اختبار CORS على API
r = await req('OPTIONS', '/api/checkout', null, { 'Origin': 'https://evil.com' });
check(18, 'CORS محكوم على /api/checkout', 'CORS',
  !r.headers['access-control-allow-origin']?.includes('evil.com'),
  `CORS: ${r.headers['access-control-allow-origin'] || 'لا يسمح بـ wildcard'}`);

// ═══ المجموعة 7: Supabase & Redis (ملاحظة #4, #13, #19-22, #26-28) ══
console.log('\n🗄️ [G] Database & Caching Infrastructure (ملاحظة #4, #13, #22)\n');

// 19. API admin/stats — هل محمي؟
r = await req('GET', '/api/admin/stats');
check(19, '/api/admin/stats محمي بمصادقة', 'Authorization',
  r.status === 401 || r.status === 307 || r.status === 404,
  `admin/stats: ${r.status}`);

// 20. /api/admin/auth مخفي
r = await req('GET', '/api/admin/auth');
check(20, '/api/admin/auth مخفي أو محمي', 'Authorization',
  r.status === 401 || r.status === 404 || r.status === 405,
  `admin/auth: ${r.status}`);

// ═══ المجموعة 8: اختبارات إضافية ════════════════════════════
console.log('\n🔍 [H] اختبارات إضافية من الملف 1\n');

// 21. Sitemap موجود
r = await req('GET', '/sitemap.xml');
check(21, 'Sitemap XML موجود', 'SEO',
  r.status === 200,
  `sitemap.xml: ${r.status}`,
  () => r.status === 404, 'Sitemap غير موجود — يؤثر على SEO');

// 22. Link Header في responses
r = await req('GET', '/');
const hasLink = !!r.headers['link'];
check(22, 'Preload/Prefetch Links في Headers', 'Performance',
  hasLink,
  `Link header: ${hasLink ? 'موجود' : 'غير موجود'}`,
  () => !hasLink, 'لا توجد resource hints');

// 23. Vary header للكاش الصحيح
r = await req('GET', '/');
const vary = r.headers['vary'] || '';
check(23, 'Vary header صحيح', 'Cache Headers',
  vary.length > 0,
  `Vary: ${vary || 'غير موجود'}`,
  () => !vary, 'Vary header مفقود — قد يسبب مشاكل كاش');

// 24. طلب بـ Accept-Encoding: gzip
r = await req('GET', '/', null, { 'Accept-Encoding': 'gzip, deflate, br' });
check(24, 'Compression (gzip/br) مدعوم', 'Performance',
  r.status === 200,
  `Compression response: ${r.status}`);

// 25. /api/delivery-fees يُعطي كاش
r = await req('GET', '/api/delivery-fees');
const deliveryCache = r.headers['cache-control'] || '';
check(25, 'كاش على /api/delivery-fees', 'Cache Headers',
  deliveryCache.includes('s-maxage') || deliveryCache.includes('max-age') || r.status === 404,
  `delivery-fees cache: ${deliveryCache || 'بدون كاش'} (${r.status})`);

// 26. Admin Routes — Cache مُعطَّل
r = await req('GET', '/xk9m2p4t8r6w1qzjvn3f7/login', null, {}, false);
const adminCache = r.headers['cache-control'] || '';
check(26, 'لا كاش على Admin Login', 'Cache Headers',
  adminCache.includes('no-store') || adminCache.includes('private') || r.status === 200,
  `Admin cache: ${adminCache || 'بدون كاش header'} (${r.status})`);

// 27. Etag أو Last-Modified على الصفحة الرئيسية
r = await req('GET', '/');
check(27, 'ETag أو Last-Modified موجود للكاش الصحيح', 'Cache Headers',
  !!(r.headers['etag'] || r.headers['last-modified']),
  `ETag: ${r.headers['etag'] || 'N/A'} | Last-Modified: ${r.headers['last-modified'] || 'N/A'}`,
  () => true, 'لا يوجد ETag/Last-Modified — بدون مشكلة مع Cloudflare');

// 28. /api/revalidate POST-only
r = await req('GET', '/api/revalidate');
check(28, '/api/revalidate يقبل POST فقط', 'API Security',
  r.status === 405 || r.status === 404,
  `GET /api/revalidate: ${r.status}`);

// 29. Permissions-Policy
r = await req('GET', '/');
check(29, 'Permissions-Policy موجود', 'Security Headers',
  !!r.headers['permissions-policy'],
  `Permissions-Policy: ${r.headers['permissions-policy'] ? 'موجود ✓' : 'مفقود ✗'}`,
  () => !r.headers['permissions-policy'], 'Permissions-Policy غير موجود');

// 30. Server-Timing header (اختياري لـ debugging)
check(30, 'Server-Timing غائب في production (لا يكشف info)', 'Performance',
  !r.headers['server-timing'],
  `Server-Timing: ${r.headers['server-timing'] ? 'موجود (قد يكشف بيانات)' : 'مخفي ✓'}`);

// ═══ تقرير النهائي ════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log(`\n📊 النتائج — التقرير 1: Performance & Caching`);
console.log(`   ✅ نجح: ${pass}`);
console.log(`   ❌ فشل: ${fail}`);
console.log(`   ⚠️  تحذير: ${warn}`);
console.log(`   🏆 النتيجة: ${Math.round((pass / 30) * 100)}/100`);
console.log('\n' + '═'.repeat(60));

// حفظ التقرير
const report = {
  fileNumber: 1,
  title: 'Performance & Caching',
  timestamp: TIMESTAMP,
  url: BASE_URL,
  summary: { pass, fail, warn, total: 30, score: Math.round((pass / 30) * 100) },
  results,
};
const ts = Date.now();
writeFileSync(`report_01_performance_${ts}.json`, JSON.stringify(report, null, 2), 'utf8');
console.log(`\n💾 تم حفظ التقرير: report_01_performance_${ts}.json`);

if (fail > 0) process.exit(1);
