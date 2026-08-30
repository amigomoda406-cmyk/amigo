import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_ROUTE = 'dfghokdfgkkvdfkkfdkovkodfvkko05-dgfb226bd-bdbdb';

// ─── قائمة أدوات الهجوم المحجوبة ────────────────────────────────────────────
const BLOCKED_UAS = [
  'sqlmap', 'nikto', 'nessus', 'metasploit', 'dirbuster', 'dirb',
  'owasp zap', 'acunetix', 'wfuzz', 'gobuster', 'hydra', 'masscan',
  'zgrab', 'scrapy', 'httrack', 'w3af', 'arachni', 'openvas',
  'burpsuite', 'burp suite', 'dirbuster-ng', 'nmap',
  'python-httpx', 'go-http-client/1', 'curl/7',
];

// ─── ملفات حساسة يجب حجبها ──────────────────────────────────────────────────
const BLOCKED_PATHS = [
  '/.env', '/.git', '/.npmrc', '/.htaccess', '/.htpasswd', '/web.config',
  '/backup', '/dump', '/database', '/credentials', '/secrets', '/private',
  '/id_rsa', '/id_dsa', '/ssh', '/shadow', '/passwd',
  '/shell.php', '/phpinfo.php', '/admin.php', '/upload.php', '/db.php',
  '/eval.php', '/cmd.php', '/test.php', '/config.php', '/info.php',
  '/adminer', '/phpmyadmin', '/pma', '/mysqladmin', '/wp-admin', '/wp-login',
  '/wp-config', '/xmlrpc.php', '/cgi-bin',
  '/proc/self', '/etc/passwd', '/var/log',
  '/node_modules', '/src/app', '/src/lib', '/src/components',
  '/vercel.json', '/package.json', '/tsconfig.json',
  '/setup-supabase.sql', '/schema.sql', '/dump.sql',
  '/grafana', '/kibana', '/prometheus', '/jenkins', '/actuator',
  '/graphql', '/swagger',
];

// ─── مسارات admin محجوبة لغير المعتمدين ─────────────────────────────────────
const PROTECTED_ADMIN_API_PATHS = [
  '/api/admin/env', '/api/admin/shell', '/api/admin/exec', '/api/admin/sql',
  '/api/admin/dump', '/api/admin/backup', '/api/admin/keys', '/api/admin/token',
  '/api/admin/password', '/api/admin/reset', '/api/admin/delete-all', '/api/admin/secrets',
  '/api/admin/db', '/api/admin/redis', '/api/admin/supabase',
  '/api/seed', '/api/migrate', '/api/eval', '/api/proxy', '/api/debug',
  '/api/test', '/api/internal', '/api/dev',
];

const globalRateMap = new Map<string, { count: number; reset: number }>();
const GLOBAL_MAX = 200, GLOBAL_WIN = 60_000;

function isGlobalRateLimited(ip: string): boolean {
  const now = Date.now();
  const r = globalRateMap.get(ip);
  if (!r || now > r.reset) { globalRateMap.set(ip, { count: 1, reset: now + GLOBAL_WIN }); return false; }
  if (r.count >= GLOBAL_MAX) return true;
  r.count++;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathLower = pathname.toLowerCase();
  const ua = (request.headers.get('user-agent') || '').toLowerCase();

  // 1. Block dangerous UA
  if (BLOCKED_UAS.some(b => ua.includes(b))) return new NextResponse('Forbidden', { status: 403 });

  // 2. Block sensitive files
  if (BLOCKED_PATHS.some(p => pathLower.startsWith(p))) return new NextResponse(null, { status: 404 });

  // 3. Block null byte
  if (pathname.includes('\x00') || pathname.includes('%00')) return new NextResponse('Bad Request', { status: 400 });

  // 4. Block path traversal
  let decodedPath = pathname;
  try {
    let prev = '';
    while (prev !== decodedPath) {
      prev = decodedPath;
      decodedPath = decodeURIComponent(decodedPath.replace(/\+/g, '%20'));
    }
  } catch (e) {}

  if (
    pathname.includes('../') || pathname.includes('..\\') ||
    pathname.includes('%2e%2e') || pathname.includes('%252e') ||
    decodedPath.includes('../') || decodedPath.includes('..\\')
  ) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // 5. Block dangerous admin API
  if (PROTECTED_ADMIN_API_PATHS.some(p => pathLower.startsWith(p))) return new NextResponse(null, { status: 404 });

  // 6. Global Rate Limiting
  // Only trust cloudflare IP or fallback to unknown. Do not trust X-Real-IP blindly to prevent bypass
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';

  if (ip !== 'unknown' && isGlobalRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429, headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' } });
  }

  // Block Open Redirects
  if (pathname.startsWith('//') || pathname.startsWith('\\\\')) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // 7. Block TRACE
  if (request.method === 'TRACE') return new NextResponse('Method Not Allowed', { status: 405 });

  // ── Block old /admin and /studio routes → 404 ──────────────────────────────
  if (pathname === '/admin' || pathname.startsWith('/admin/') ||
      pathname === '/studio' || pathname.startsWith('/studio/')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // ── Protect new secret admin routes (except login/logout) ─────────────────
  const isAdminRoot = pathname === `/${ADMIN_ROUTE}`;
  const isAdminSubRoute = pathname.startsWith(`/${ADMIN_ROUTE}/`) &&
    !pathname.startsWith(`/${ADMIN_ROUTE}/login`) &&
    !pathname.startsWith(`/${ADMIN_ROUTE}/logout`);

  if (isAdminRoot || isAdminSubRoute) {
    const adminToken = request.cookies.get('admin_token')?.value;

    if (!adminToken) {
      return NextResponse.redirect(new URL(`/${ADMIN_ROUTE}/login`, request.url));
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSWORD || 'UNSET_SECRET'
      );
      await jwtVerify(adminToken, secret, { algorithms: ['HS256'] });
    } catch {
      return NextResponse.redirect(new URL(`/${ADMIN_ROUTE}/login`, request.url));
    }
  }

  // ── 8. إضافة Security Headers على كل الـ responses ────────────────────────
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.sanity.io",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https://cdn.sanity.io https://lh3.googleusercontent.com blob:",
    "connect-src 'self' https://*.sanity.io https://*.supabase.co https://api.telegram.org https://*.upstash.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?|ttf|eot)$).*)',
  ],
};
