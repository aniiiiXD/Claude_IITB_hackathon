import { NextRequest, NextResponse } from 'next/server'
import { getCases, createCase, getCaseById, type CaseStatus } from '@/lib/store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const createdBy = searchParams.get('createdBy') ?? undefined
  const patientId = searchParams.get('patientId') ?? undefined
  const statusParam = searchParams.get('status')
  const status = statusParam ? (statusParam.split(',') as CaseStatus[]) : undefined
  const cases = getCases({ createdBy, patientId, status })
  return NextResponse.json(cases)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Patient-submitted case (from /patient/submit)
  if (body.submittedBy === 'patient') {
    const newCase = createCase({
      createdBy: body.assignedDoctorId ?? 'u1',  // assigned to a doctor for review
      patientId: body.patientId ?? null,
      submittedBy: 'patient',
      patientSubmittedText: body.patientSubmittedText ?? '',
      doctorAddedText: null,
      patientSummary: body.patientSummary ?? body.patientSubmittedText?.slice(0, 120) ?? 'Patient submission',
      caseText: '',
      aiResult: null,
      demoId: undefined,
      status: 'awaiting_doctor_review',
      confirmedAt: null,
      confirmedDiagnosisName: null,
      confirmedOmimId: null,
      confirmedOrphaCode: null,
      confirmedGene: null,
      confirmedVariant: null,
      overrideJustification: null,
      symptomOnsetDate: body.symptomOnsetDate ?? null,
      doctorState: body.doctorState ?? null,
    })
    return NextResponse.json(newCase, { status: 201 })
  }

  // Doctor-initiated case (from /analyze) — same as before
  const newCase = createCase({
    createdBy: body.createdBy ?? 'u1',
    patientId: body.patientId ?? null,
    submittedBy: 'doctor',
    patientSubmittedText: null,
    doctorAddedText: null,
    patientSummary: body.patientSummary ?? body.caseText?.split('\n')[0]?.slice(0, 120) ?? '',
    caseText: body.caseText ?? '',
    aiResult: body.aiResult ?? null,
    demoId: body.demoId,
    status: body.aiResult ? 'draft' : 'analyzing',
    confirmedAt: null,
    confirmedDiagnosisName: null,
    confirmedOmimId: null,
    confirmedOrphaCode: null,
    confirmedGene: null,
    confirmedVariant: null,
    overrideJustification: null,
    symptomOnsetDate: null,
    doctorState: body.doctorState ?? null,
  })
  return NextResponse.json(newCase, { status: 201 })
}
