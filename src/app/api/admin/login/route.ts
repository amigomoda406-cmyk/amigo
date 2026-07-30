import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password === process.env.ADMIN_SECRET) {
      // Create response with redirect or just success
      const response = NextResponse.json({ success: true });
      
      // Set HTTP-only cookie with the token
      response.cookies.set({
        name: 'admin_token',
        value: password,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
