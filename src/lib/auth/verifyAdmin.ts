import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

/**
 * Verifies the admin_token cookie using HS256 + ADMIN_PASSWORD secret.
 * Returns { valid: true } if the token is valid, or a NextResponse 401 if not.
 */
export async function verifyAdminAuth(request: Request): Promise<
  { valid: true } | NextResponse
> {
  // Extract cookie from request headers
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/admin_token=([^;]+)/);
  const token = match?.[1];

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized - no token' },
      { status: 401 }
    );
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSWORD || 'UNSET_SECRET'
    );
    await jwtVerify(token, secret, {
      algorithms: ['HS256'], // ← رفض alg:none و alg:RS256 etc
    });
    return { valid: true };
  } catch {
    return NextResponse.json(
      { error: 'Unauthorized - invalid or expired token' },
      { status: 401 }
    );
  }
}
