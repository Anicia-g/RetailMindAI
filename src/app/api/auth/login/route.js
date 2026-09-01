import { NextResponse } from 'next/server';
import { authenticateWithCredentials } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { token, user } = await authenticateWithCredentials(email, password);

    return NextResponse.json({
      success: true,
      token,
      user,
      message: 'Authentication successful. JWT issued.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 401 }
    );
  }
}
