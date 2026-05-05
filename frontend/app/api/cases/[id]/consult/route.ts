import { NextRequest, NextResponse } from 'next/server'
import { createConsultation, advancePipeline } from '@/lib/store'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = await params
  const body = await req.json()

  const purpose = body.purpose === 'coe_referral' ? 'coe_referral' : 'consult'

  const c = createConsultation({
    caseId,
    requestingDoctorId: body.requestingDoctorId ?? 'u1',
    specialistId: body.specialistId,
    purpose,
    status: 'pending',
    requestNote: body.requestNote ?? '',
    pipelineStatus: purpose === 'coe_referral' ? 'sent' : null,
    pipelineHistory: [],
  })

  // For CoE referrals, immediately log the 'sent' pipeline event
  if (purpose === 'coe_referral') {
    advancePipeline(c.id, 'sent', body.requestingDoctorId ?? 'u1', {
      note: body.requestNote,
    })
  }

  return NextResponse.json(c, { status: 201 })
}
