// src/lib/cache/redis.ts
// ✅ نظام كاش Redis ذكي — يوزع الحمل على حسابين Upstash مجانيين
// كل حساب = 10,000 طلب/يوم → الحسابان معاً = 20,000 طلب/يوم
// يكفي لـ 40,000+ زائر/يوم مع Cloudflare Cache

import { Redis } from '@upstash/redis';

// ─── إنشاء الـ Clients ────────────────────────────────────────────────────────
let clients: Redis[] = [];

function getClients(): Redis[] {
  if (clients.length > 0) return clients;

  const instances: Redis[] = [];

  if (process.env.UPSTASH_REDIS_REST_URL_1 && process.env.UPSTASH_REDIS_REST_TOKEN_1) {
    instances.push(new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL_1,
      token: process.env.UPSTASH_REDIS_REST_TOKEN_1,
    }));
  }

  if (process.env.UPSTASH_REDIS_REST_URL_2 && process.env.UPSTASH_REDIS_REST_TOKEN_2) {
    instances.push(new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL_2,
      token: process.env.UPSTASH_REDIS_REST_TOKEN_2,
    }));
  }

  // Fallback: إذا لم تُضبط متغيرات البيئة، لا يتعطل الموقع
  clients = instances;
  return clients;
}

// ─── خوارزمية اختيار الحساب (Consistent Hashing) ───────────────────────────
// كل مفتاح يُوزَّع على حساب ثابت — لا عشوائية = consistency
function getClient(key: string): Redis | null {
  const pool = getClients();
  if (pool.length === 0) return null;
  const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

// ─── قراءة من الكاش ──────────────────────────────────────────────────────────
export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getClient(key);
  if (!redis) return null;

  try {
    const data = await redis.get<T>(key);
    return data ?? null;
  } catch {
    // فشل Redis لا يوقف الموقع — يُعيد null ويكمل
    return null;
  }
}

// ─── كتابة في الكاش ──────────────────────────────────────────────────────────
export async function setCache<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
  const redis = getClient(key);
  if (!redis) return;

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // فشل الكتابة لا يوقف الموقع
  }
}

// ─── مسح الكاش (عند تحديث المنتج في Sanity) ─────────────────────────────────
export async function deleteCache(...keys: string[]): Promise<void> {
  const pool = getClients();
  if (pool.length === 0) return;

  try {
    await Promise.allSettled(
      pool.flatMap(redis => keys.map(key => redis.del(key)))
    );
  } catch {
    // non-fatal
  }
}

// ─── الوظيفة الرئيسية: جلب البيانات مع كاش ─────────────────────────────────
// استخدامها: بدل client.fetch() مباشرة
// تفحص الكاش أولاً → إذا لم تجد → تجلب من Sanity → تحفظ في الكاش
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 3600,
): Promise<T> {
  // 1. فحص الكاش
  const cached = await getCache<T>(key);
  if (cached !== null) return cached;

  // 2. جلب البيانات من المصدر
  const data = await fetcher();

  // 3. حفظ في الكاش (فقط إذا كانت البيانات موجودة)
  if (data !== null && data !== undefined) {
    // لا تحفظ مصفوفة فارغة (مشكلة Stale Empty Cache من Maison D'Or!)
    const isEmpty = Array.isArray(data) && data.length === 0;
    if (!isEmpty) {
      await setCache(key, data, ttlSeconds);
    }
  }

  return data;
}

// ─── حالة الكاش (للـ Debug) ──────────────────────────────────────────────────
export function isCacheAvailable(): boolean {
  return getClients().length > 0;
}
