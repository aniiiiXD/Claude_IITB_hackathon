import { NextRequest, NextResponse } from 'next/server'
import { getCaseById, updateCase, getCaseTimeline, getCaseConsent, getConsultations } from '@/lib/store'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const c = getCaseById(id)
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const timeline = getCaseTimeline(id)
  const consent = getCaseConsent(id)
  const consultations = getConsultations({ caseId: id })
  return NextResponse.json({ ...c, timeline, consent, consultations })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = updateCase(id, body)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}
