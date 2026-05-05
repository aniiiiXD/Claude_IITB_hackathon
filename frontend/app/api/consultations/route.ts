import { NextRequest, NextResponse } from 'next/server'
import { getConsultations, getCaseById } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const specialistId = searchParams.get('specialistId') ?? undefined
  const requestingDoctorId = searchParams.get('requestingDoctorId') ?? undefined
  const caseId = searchParams.get('caseId') ?? undefined

  const consults = getConsultations({ specialistId, requestingDoctorId, caseId })
  const withCase = consults.map(c => {
    const caseData = getCaseById(c.caseId)
    return { ...c, case: caseData ? { id: caseData.id, patientSummary: caseData.patientSummary, confirmedDiagnosisName: caseData.confirmedDiagnosisName } : null }
  })
  return NextResponse.json(withCase)
}
