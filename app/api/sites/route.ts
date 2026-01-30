import { NextResponse } from 'next/server';
import sitesData from '@/data/sites.json';

export async function GET() {
  return NextResponse.json(sitesData, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
