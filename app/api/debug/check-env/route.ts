import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
    is_placeholder: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').includes('placeholder'),
    node_env: process.env.NODE_ENV,
    build_time: new Date().toISOString()
  });
}
