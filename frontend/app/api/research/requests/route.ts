import { NextRequest, NextResponse } from 'next/server'
import { getResearchRequests, createResearchRequest, queryCohort } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const researcherId = searchParams.get('researcherId') ?? undefined
  return NextResponse.json(getResearchRequests({ researcherId }))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const matchedCount = queryCohort({
    diseaseName: body.queryDiseaseName,
    omimId: body.queryOmimId,
    gene: body.queryGene,
    state: body.queryState,
  })
  const r = createResearchRequest({
    researcherId: body.researcherId ?? 'u5',
    queryDiseaseName: body.queryDiseaseName,
    queryOmimId: body.queryOmimId,
    queryGene: body.queryGene,
    queryState: body.queryState ?? null,
    matchedCount,
    purpose: body.purpose,
    institution: body.institution,
    irbReference: body.irbReference,
    dataFieldsRequested: body.dataFieldsRequested,
    status: 'pending',
  })
  return NextResponse.json(r, { status: 201 })
}
