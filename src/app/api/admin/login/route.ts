import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// In-memory rate limit for login endpoint
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 دقيقة

function isLoginRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + LOGIN_WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_LOGIN_ATTEMPTS) return true;
  record.count += 1;
  return false;
}

export async function POST(req: Request) {
  try {
    // ─── Rate Limit ──────────────────────────────────────────────────────────
    const ip = req.headers.get('cf-connecting-ip')
             || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
             || 'unknown';

    if (isLoginRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Try again later.' },
        { status: 429 }
      );
    }

    // ─── Input Validation ────────────────────────────────────────────────────
    let body: unknown;
    try { body = await req.json(); } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const b = body as Record<string, unknown>;
    // Accept both 'email' and 'username' for compatibility
    const username = (typeof b.email === 'string' ? b.email : b.username) as string | undefined;
    const password = b.password as string | undefined;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;
    const validEmail = process.env.ADMIN_EMAIL || validUsername; // email fallback
    const jwtSecret = process.env.ADMIN_JWT_SECRET || validPassword || 'UNSET_SECRET';

    if (!validUsername || !validPassword) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const usernameMatch = username === validUsername || username === validEmail;
    if (usernameMatch && password === validPassword) {
      // ─── Sign JWT with HS256 (explicitly specified) ──────────────────────
      const secret = new TextEncoder().encode(jwtSecret);
      const token = await new SignJWT({ role: 'admin' }) // لا نضع username في payload
        .setProtectedHeader({ alg: 'HS256' })             // ← EXPLICIT: no alg:none
        .setIssuedAt()
        .setExpirationTime('8h')                          // ← 8h بدلاً من 7d (أقل خطراً)
        .sign(secret);

      const response = NextResponse.json({ success: true });

      response.cookies.set({
        name: 'admin_token',
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8, // 8 hours
      });

      return response;
    }

    // ─── Generic error (no user enumeration) ────────────────────────────────
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

