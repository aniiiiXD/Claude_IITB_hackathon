import { NextRequest, NextResponse } from 'next/server'
import { queryCohort } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const count = queryCohort({
    diseaseName: searchParams.get('disease') ?? undefined,
    omimId: searchParams.get('omim') ?? undefined,
    gene: searchParams.get('gene') ?? undefined,
    state: searchParams.get('state') ?? undefined,
  })
  return NextResponse.json({ count })
}
