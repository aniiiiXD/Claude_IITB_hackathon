import { NextRequest, NextResponse } from 'next/server'
import { advancePipeline, type PipelineStatus } from '@/lib/store'

const VALID_STATUSES: PipelineStatus[] = [
  'sent', 'accepted', 'lab_confirmed', 'nprd_filed', 'mohfw_approved', 'mohfw_rejected',
]

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: `Invalid status: ${body.status}` }, { status: 400 })
  }

  const updated = advancePipeline(
    id,
    body.status as PipelineStatus,
    body.byUserId ?? 'unknown',
    {
      note: body.note,
      labResult: body.labResult,
      nprdReferenceNumber: body.nprdReferenceNumber,
      mohfwDecision: body.mohfwDecision,
      mohfwAmount: body.mohfwAmount,
    }
  )

  if (!updated) {
    return NextResponse.json({ error: 'Consultation not found' }, { status: 404 })
  }
  return NextResponse.json(updated)
}
