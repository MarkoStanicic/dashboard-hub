import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Only show this in development or with specific flag
    const isDev = process.env.NODE_ENV === 'development';
    const allowDebug = process.env.ALLOW_ENV_DEBUG === 'true';
    
    if (!isDev && !allowDebug) {
      return NextResponse.json({ error: 'Debug not allowed' }, { status: 403 });
    }

    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
      // Show partial values for verification
      SUPABASE_URL_PARTIAL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : 'MISSING',
      SUPABASE_KEY_PARTIAL: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ? 
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY.substring(0, 30) + '...' : 'MISSING'
    };

    return NextResponse.json(envCheck);
  } catch (error) {
    return NextResponse.json({ error: 'Debug check failed' }, { status: 500 });
  }
}
