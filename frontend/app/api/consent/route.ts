import { NextRequest, NextResponse } from 'next/server'
import { getConsentByPatient, upsertConsent, getCases } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const patientUserId = searchParams.get('patientUserId')
  if (!patientUserId) return NextResponse.json({ error: 'patientUserId required' }, { status: 400 })
  const consent = getConsentByPatient(patientUserId)
  return NextResponse.json(consent)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const patientUserId = body.patientUserId
  if (!patientUserId) return NextResponse.json({ error: 'patientUserId required' }, { status: 400 })

  // Resolve caseId — either provided or pick the patient's most recent case
  let caseId = body.caseId
  if (!caseId) {
    const cases = getCases({ patientId: patientUserId })
    caseId = cases.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.id
  }
  if (!caseId) return NextResponse.json({ error: 'No case found for patient' }, { status: 400 })

  const consent = upsertConsent({
    patientUserId,
    caseId,
    epidemiology: !!body.epidemiology,
    researchCohort: !!body.researchCohort,
    researchContact: !!body.researchContact,
  })
  return NextResponse.json(consent)
}
