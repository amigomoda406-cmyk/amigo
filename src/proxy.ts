import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_ROUTE = 'xk9m2p4t8r6w1qzjvn3f7';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
      return NextResponse.redirect(
        new URL(`/${ADMIN_ROUTE}/login`, request.url)
      );
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET
      );
      await jwtVerify(adminToken, secret);
    } catch {
      return NextResponse.redirect(
        new URL(`/${ADMIN_ROUTE}/login`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/xk9m2p4t8r6w1qzjvn3f7',
    '/xk9m2p4t8r6w1qzjvn3f7/:path*',
    '/admin',
    '/admin/:path*',
    '/studio',
    '/studio/:path*',
  ],
};
