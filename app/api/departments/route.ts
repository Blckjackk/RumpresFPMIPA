import { NextResponse } from 'next/server';
import departmentsData from '@/data/departments.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(departmentsData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load departments data' }, { status: 500 });
  }
}
