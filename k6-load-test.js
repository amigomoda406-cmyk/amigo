import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ===== مقاييس مخصصة =====
const errorRate = new Rate('errors');
const homepageDuration = new Trend('homepage_duration');
const categoryDuration = new Trend('category_duration');

// ===== إعدادات الاختبار: من 100 إلى 10,000 مستخدم =====
export const options = {
  stages: [
    { duration: '30s', target: 100 },    // مرحلة 1: رفع تدريجي → 100 مستخدم
    { duration: '30s', target: 100 },    // مرحلة 2: ثبات على 100 مستخدم
    { duration: '30s', target: 500 },    // مرحلة 3: رفع → 500 مستخدم
    { duration: '30s', target: 500 },    // مرحلة 4: ثبات على 500 مستخدم
    { duration: '30s', target: 1000 },   // مرحلة 5: رفع → 1,000 مستخدم
    { duration: '30s', target: 1000 },   // مرحلة 6: ثبات على 1,000 مستخدم
    { duration: '30s', target: 2500 },   // مرحلة 7: رفع → 2,500 مستخدم
    { duration: '30s', target: 2500 },   // مرحلة 8: ثبات على 2,500 مستخدم
    { duration: '30s', target: 5000 },   // مرحلة 9: رفع → 5,000 مستخدم
    { duration: '30s', target: 5000 },   // مرحلة 10: ثبات على 5,000 مستخدم
    { duration: '30s', target: 10000 },  // مرحلة 11: رفع → 10,000 مستخدم
    { duration: '60s', target: 10000 },  // مرحلة 12: الاختبار الحقيقي عند الذروة
    { duration: '30s', target: 0 },      // مرحلة 13: نزول تدريجي للصفر
  ],
  thresholds: {
    // 95% من الطلبات يجب أن تكتمل في أقل من 3 ثوانٍ
    'http_req_duration': ['p(95)<3000'],
    // معدل الفشل يجب أن يكون أقل من 10%
    'errors': ['rate<0.10'],
  },
};

const BASE_URL = 'https://elafifariwao.vercel.app';

// قائمة صفحات حقيقية يزورها المستخدمون
const PAGES = [
  '/',
  '/category/clothes',
  '/category/shoes',
  '/category/accessories',
];

export default function () {
  const params = {
    redirects: 5, // اتبع إعادة التوجيه تلقائياً (حل مشكلة الـ 301)
    timeout: '15s',
  };

  // اختر صفحة عشوائية (محاكاة حقيقية لسلوك المستخدمين)
  const page = PAGES[Math.floor(Math.random() * PAGES.length)];
  
  const res = http.get(`${BASE_URL}${page}`, params);
  
  const isSuccess = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3s': (r) => r.timings.duration < 3000,
    'no server error': (r) => r.status < 500,
  });
  
  errorRate.add(!isSuccess);
  
  // تسجيل وقت الاستجابة لكل نوع صفحة
  if (page === '/') {
    homepageDuration.add(res.timings.duration);
  } else {
    categoryDuration.add(res.timings.duration);
  }
  
  // توقف قصير بين الطلبات لمحاكاة تصفح حقيقي
  sleep(Math.random() * 1.5 + 0.5); // بين 0.5 و 2 ثانية
}

// ===== تقرير مخصص عند الانتهاء =====
export function handleSummary(data) {
  const totalRequests = data.metrics.http_reqs.values.count;
  const failedRequests = data.metrics.http_req_failed.values.passes || 0;
  const avgDuration = data.metrics.http_req_duration.values.avg.toFixed(0);
  const p95Duration = data.metrics.http_req_duration.values['p(95)'].toFixed(0);
  const maxDuration = data.metrics.http_req_duration.values.max.toFixed(0);

  const report = `
================================================================================
🔥 تقرير اختبار الضغط — Amigo Moda
================================================================================
📅 التاريخ: ${new Date().toLocaleString('ar-DZ')}
🎯 الهدف: ${BASE_URL}
🚀 الذروة: 10,000 مستخدم متزامن

📊 النتائج:
-----------
• إجمالي الطلبات المُرسَلة : ${totalRequests.toLocaleString()}
• متوسط زمن الاستجابة     : ${avgDuration} ms
• أسرع 95% استجابوا في    : ${p95Duration} ms
• أبطأ استجابة            : ${maxDuration} ms

✅ الخلاصة:
-----------
${p95Duration < 3000
  ? '🏆 الموقع اجتاز الاختبار بتفوق! الكاش يعمل بكفاءة عالية.'
  : '⚠️  الموقع يحتاج إلى تحسينات في الأداء تحت الضغط الشديد.'}
================================================================================
`;

  return {
    'k6-stress-test-report.txt': report,
    stdout: report,
  };
}
