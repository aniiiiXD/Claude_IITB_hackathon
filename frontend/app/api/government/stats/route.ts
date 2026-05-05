import { NextResponse } from 'next/server'
import { getGovStats } from '@/lib/store'

export async function GET() {
  return NextResponse.json(getGovStats())
}
