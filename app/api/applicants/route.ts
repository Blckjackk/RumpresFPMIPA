import { NextResponse } from 'next/server';
import applicantsData from '@/data/applicants.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(applicantsData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load applicants data' }, { status: 500 });
  }
}
