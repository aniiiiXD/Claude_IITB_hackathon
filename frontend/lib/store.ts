/**
 * Server-side only. JSON file store for local development.
 * Import only from API routes (app/api/**), never from client components.
 */
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export { randomUUID }

const DB_PATH = path.join(process.cwd(), 'data', 'rarecouncil.json')

export type CaseStatus =
  | 'awaiting_doctor_review'
  | 'analyzing'
  | 'draft'
  | 'confirmed'
  | 'archived'

export interface StoredCase {
  id: string
  createdBy: string
  patientId: string | null
  submittedBy: 'doctor' | 'patient'
  patientSubmittedText: string | null
  doctorAddedText: string | null
  patientSummary: string
  caseText: string
  aiResult: unknown | null
  demoId?: string
  status: CaseStatus
  confirmedAt: string | null
  confirmedDiagnosisName: string | null
  confirmedOmimId: string | null
  confirmedOrphaCode: string | null
  confirmedGene: string | null
  confirmedVariant: string | null
  /** Doctor's reason for confirming a different diagnosis from the AI's top rank — calibration signal */
  overrideJustification: string | null
  symptomOnsetDate: string | null
  doctorState: string | null
  createdAt: string
  updatedAt: string
}

/** NPRD authorization pipeline — the "license" path from GP confirmation to MoHFW response. */
export type PipelineStatus =
  | 'sent'              // GP routed referral packet to CoE specialist
  | 'accepted'          // CoE specialist opened and accepted the referral
  | 'lab_confirmed'     // CoE confirmed diagnosis at their accredited lab
  | 'nprd_filed'        // CoE filed NPRD application with MoHFW
  | 'mohfw_approved'    // MoHFW approved funding
  | 'mohfw_rejected'    // MoHFW rejected — escalation pathway begins

export interface PipelineEvent {
  status: PipelineStatus
  at: string            // ISO timestamp
  byUserId: string
  note?: string
}

export interface StoredConsultation {
  id: string
  caseId: string
  requestingDoctorId: string
  specialistId: string
  /** 'consult' = legacy/generic specialist input; 'coe_referral' = full NPRD pipeline. */
  purpose: 'consult' | 'coe_referral'
  status: 'pending' | 'completed'
  requestNote: string
  specialistNotes?: string

  // Pipeline state (only used when purpose='coe_referral')
  pipelineStatus?: PipelineStatus | null
  pipelineHistory?: PipelineEvent[]
  labConfirmedAt?: string | null
  labResult?: string | null
  nprdFiledAt?: string | null
  nprdReferenceNumber?: string | null
  mohfwRespondedAt?: string | null
  mohfwDecision?: 'approved' | 'rejected' | null
  /** Approved amount in ₹ (when applicable). */
  mohfwAmount?: number | null

  createdAt: string
  updatedAt: string
}

export interface StoredConsent {
  id: string
  patientUserId: string
  caseId: string
  epidemiology: boolean
  researchCohort: boolean
  researchContact: boolean
  updatedAt: string
}

export interface StoredResearchRequest {
  id: string
  researcherId: string
  queryDiseaseName: string
  queryOmimId?: string
  queryGene?: string
  queryState?: string | null
  matchedCount: number
  purpose: string
  institution: string
  irbReference: string
  dataFieldsRequested: string
  status: 'pending' | 'approved' | 'rejected' | 'data_released'
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export interface StoredTimelineEvent {
  id: string
  caseId: string
  eventType: string
  actorUserId?: string
  metadata: Record<string, unknown>
  createdAt: string
}

interface DB {
  cases: StoredCase[]
  consultations: StoredConsultation[]
  consents: StoredConsent[]
  researchRequests: StoredResearchRequest[]
  timeline: StoredTimelineEvent[]
}

function read(): DB {
  const raw = fs.readFileSync(DB_PATH, 'utf-8')
  const db = JSON.parse(raw) as DB
  // Backwards-compatibility: apply defaults for fields added after initial seeding
  for (const c of db.cases) {
    if (c.submittedBy === undefined) c.submittedBy = 'doctor'
    if (c.patientSubmittedText === undefined) c.patientSubmittedText = null
    if (c.doctorAddedText === undefined) c.doctorAddedText = null
    if (c.overrideJustification === undefined) c.overrideJustification = null
  }
  for (const cl of db.consultations) {
    if (cl.purpose === undefined) cl.purpose = 'consult'
    if (cl.pipelineStatus === undefined) cl.pipelineStatus = null
    if (cl.pipelineHistory === undefined) cl.pipelineHistory = []
    if (cl.labConfirmedAt === undefined) cl.labConfirmedAt = null
    if (cl.labResult === undefined) cl.labResult = null
    if (cl.nprdFiledAt === undefined) cl.nprdFiledAt = null
    if (cl.nprdReferenceNumber === undefined) cl.nprdReferenceNumber = null
    if (cl.mohfwRespondedAt === undefined) cl.mohfwRespondedAt = null
    if (cl.mohfwDecision === undefined) cl.mohfwDecision = null
    if (cl.mohfwAmount === undefined) cl.mohfwAmount = null
  }
  return db
}

function write(db: DB): void {
  const tmp = DB_PATH + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf-8')
  fs.renameSync(tmp, DB_PATH)
}

// ── Cases ─────────────────────────────────────────────────────────────────────

export function getCases(filter?: { createdBy?: string; patientId?: string; status?: CaseStatus | CaseStatus[]; assignedDoctorId?: string }): StoredCase[] {
  const db = read()
  if (!filter) return db.cases
  const statusList = filter.status ? (Array.isArray(filter.status) ? filter.status : [filter.status]) : null
  return db.cases.filter(c => {
    if (filter.createdBy && c.createdBy !== filter.createdBy) return false
    if (filter.patientId && c.patientId !== filter.patientId) return false
    if (filter.assignedDoctorId && c.createdBy !== filter.assignedDoctorId) return false
    if (statusList && !statusList.includes(c.status)) return false
    return true
  })
}

export function getCaseById(id: string): StoredCase | null {
  return read().cases.find(c => c.id === id) ?? null
}

export function createCase(data: Omit<StoredCase, 'id' | 'createdAt' | 'updatedAt'>): StoredCase {
  const db = read()
  const now = new Date().toISOString()
  const newCase: StoredCase = { ...data, id: randomUUID(), createdAt: now, updatedAt: now }
  db.cases.push(newCase)
  addTimeline(db, { caseId: newCase.id, eventType: 'case_created', actorUserId: data.createdBy, metadata: {} })
  write(db)
  return newCase
}

export function updateCase(id: string, patch: Partial<StoredCase>): StoredCase | null {
  const db = read()
  const idx = db.cases.findIndex(c => c.id === id)
  if (idx === -1) return null
  const before = db.cases[idx]
  const after: StoredCase = { ...before, ...patch, updatedAt: new Date().toISOString() }
  db.cases[idx] = after

  // Timeline events for meaningful transitions
  if (patch.patientId && !before.patientId) {
    addTimeline(db, { caseId: id, eventType: 'patient_invited', actorUserId: before.createdBy, metadata: { patientId: patch.patientId } })
  }
  if (patch.status === 'analyzing' && before.status !== 'analyzing') {
    addTimeline(db, { caseId: id, eventType: 'analysis_started', actorUserId: before.createdBy, metadata: {} })
  }
  if (patch.aiResult && !before.aiResult) {
    addTimeline(db, { caseId: id, eventType: 'analysis_complete', actorUserId: before.createdBy, metadata: {} })
  }
  if (patch.status === 'confirmed' && before.status !== 'confirmed') {
    addTimeline(db, { caseId: id, eventType: 'diagnosis_confirmed', actorUserId: before.createdBy, metadata: { diagnosis: after.confirmedDiagnosisName } })
  }

  write(db)
  return after
}

// ── Consultations ─────────────────────────────────────────────────────────────

export function getConsultations(filter?: { caseId?: string; specialistId?: string; requestingDoctorId?: string }): StoredConsultation[] {
  const db = read()
  if (!filter) return db.consultations
  return db.consultations.filter(c => {
    if (filter.caseId && c.caseId !== filter.caseId) return false
    if (filter.specialistId && c.specialistId !== filter.specialistId) return false
    if (filter.requestingDoctorId && c.requestingDoctorId !== filter.requestingDoctorId) return false
    return true
  })
}

export function getConsultationById(id: string): StoredConsultation | null {
  return read().consultations.find(c => c.id === id) ?? null
}

export function createConsultation(data: Omit<StoredConsultation, 'id' | 'createdAt' | 'updatedAt'>): StoredConsultation {
  const db = read()
  const now = new Date().toISOString()
  const c: StoredConsultation = { ...data, id: randomUUID(), createdAt: now, updatedAt: now }
  db.consultations.push(c)
  addTimeline(db, { caseId: c.caseId, eventType: 'consult_requested', actorUserId: c.requestingDoctorId, metadata: { specialistId: c.specialistId } })
  write(db)
  return c
}

export function updateConsultation(id: string, patch: Partial<StoredConsultation>): StoredConsultation | null {
  const db = read()
  const idx = db.consultations.findIndex(c => c.id === id)
  if (idx === -1) return null
  db.consultations[idx] = { ...db.consultations[idx], ...patch, updatedAt: new Date().toISOString() }
  if (patch.status === 'completed') {
    addTimeline(db, { caseId: db.consultations[idx].caseId, eventType: 'consult_completed', actorUserId: db.consultations[idx].specialistId, metadata: {} })
  }
  write(db)
  return db.consultations[idx]
}

/**
 * Advance the NPRD pipeline status on a CoE referral. Records the event in
 * pipelineHistory and updates stage-specific fields atomically.
 */
export function advancePipeline(
  consultationId: string,
  status: PipelineStatus,
  byUserId: string,
  data?: {
    note?: string
    labResult?: string
    nprdReferenceNumber?: string
    mohfwDecision?: 'approved' | 'rejected'
    mohfwAmount?: number
  }
): StoredConsultation | null {
  const db = read()
  const idx = db.consultations.findIndex(c => c.id === consultationId)
  if (idx === -1) return null
  const c = db.consultations[idx]
  const now = new Date().toISOString()

  const event: PipelineEvent = { status, at: now, byUserId, note: data?.note }
  c.pipelineStatus = status
  c.pipelineHistory = [...(c.pipelineHistory ?? []), event]

  // Stage-specific fields
  if (status === 'lab_confirmed') {
    c.labConfirmedAt = now
    if (data?.labResult) c.labResult = data.labResult
  }
  if (status === 'nprd_filed') {
    c.nprdFiledAt = now
    if (data?.nprdReferenceNumber) c.nprdReferenceNumber = data.nprdReferenceNumber
  }
  if (status === 'mohfw_approved' || status === 'mohfw_rejected') {
    c.mohfwRespondedAt = now
    c.mohfwDecision = status === 'mohfw_approved' ? 'approved' : 'rejected'
    if (data?.mohfwAmount) c.mohfwAmount = data.mohfwAmount
  }

  c.updatedAt = now
  db.consultations[idx] = c

  // Record on the case timeline so patient + GP see it in their feed
  addTimeline(db, {
    caseId: c.caseId,
    eventType: `pipeline_${status}`,
    actorUserId: byUserId,
    metadata: { consultationId, ...data },
  })

  write(db)
  return c
}

// ── Research requests ─────────────────────────────────────────────────────────

export function getResearchRequests(filter?: { researcherId?: string }): StoredResearchRequest[] {
  const db = read()
  if (!filter?.researcherId) return db.researchRequests
  return db.researchRequests.filter(r => r.researcherId === filter.researcherId)
}

export function createResearchRequest(data: Omit<StoredResearchRequest, 'id' | 'createdAt' | 'updatedAt'>): StoredResearchRequest {
  const db = read()
  const now = new Date().toISOString()
  const r: StoredResearchRequest = { ...data, id: randomUUID(), createdAt: now, updatedAt: now }
  db.researchRequests.push(r)
  write(db)
  return r
}

export function updateResearchRequest(id: string, patch: Partial<StoredResearchRequest>): StoredResearchRequest | null {
  const db = read()
  const idx = db.researchRequests.findIndex(r => r.id === id)
  if (idx === -1) return null
  db.researchRequests[idx] = { ...db.researchRequests[idx], ...patch, updatedAt: new Date().toISOString() }
  write(db)
  return db.researchRequests[idx]
}

// ── Government stats ──────────────────────────────────────────────────────────

const GENE_CATEGORY: Record<string, 'Metabolic' | 'Neurogenetic' | 'Immunologic'> = {
  GBA: 'Metabolic', ATP7B: 'Metabolic', HEXA: 'Metabolic', HEXB: 'Metabolic',
  SMPD1: 'Metabolic', NPC1: 'Metabolic', ASAH1: 'Metabolic', GLA: 'Metabolic',
  GAA: 'Metabolic', IDUA: 'Metabolic', IDS: 'Metabolic',
  SMN1: 'Neurogenetic', DMD: 'Neurogenetic', HTT: 'Neurogenetic', FMR1: 'Neurogenetic',
  ATXN1: 'Neurogenetic', ATXN3: 'Neurogenetic', CACNA1A: 'Neurogenetic',
  WAS: 'Immunologic', LRBA: 'Immunologic', RAG1: 'Immunologic', RAG2: 'Immunologic',
  BTK: 'Immunologic', ADA: 'Immunologic', IL2RG: 'Immunologic',
}

const COE_STATES = new Set([
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Telangana',
  'Kerala', 'West Bengal', 'Uttar Pradesh', 'Gujarat',
])

export function getGovStats() {
  const db = read()
  const confirmed = db.cases.filter(c => c.status === 'confirmed')

  const byState: Record<string, number> = {}
  for (const c of confirmed) {
    if (c.doctorState) byState[c.doctorState] = (byState[c.doctorState] ?? 0) + 1
  }

  const byCategory = { Metabolic: 0, Neurogenetic: 0, Immunologic: 0 }
  for (const c of confirmed) {
    const cat = GENE_CATEGORY[c.confirmedGene?.toUpperCase() ?? ''] ?? 'Metabolic'
    byCategory[cat]++
  }

  // Per-disease diagnostic delay
  const delaysByDisease: Record<string, number[]> = {}
  const allDelays: number[] = []
  for (const c of confirmed) {
    if (c.symptomOnsetDate && c.confirmedAt) {
      const days = Math.round(
        (new Date(c.confirmedAt).getTime() - new Date(c.symptomOnsetDate).getTime()) / 86400000
      )
      if (days > 0) {
        allDelays.push(days)
        if (c.confirmedDiagnosisName) {
          const key = c.confirmedDiagnosisName
          delaysByDisease[key] = [...(delaysByDisease[key] ?? []), days]
        }
      }
    }
  }
  const median = (arr: number[]) =>
    arr.length === 0 ? 0 : arr.sort((a, b) => a - b)[Math.floor(arr.length / 2)]

  // Treatment access gap: confirmed patients in states without a CoE
  const noCoEMap: Record<string, { count: number; disease: string }> = {}
  for (const c of confirmed) {
    if (c.doctorState && !COE_STATES.has(c.doctorState)) {
      if (!noCoEMap[c.doctorState]) noCoEMap[c.doctorState] = { count: 0, disease: c.confirmedDiagnosisName ?? 'Unknown' }
      noCoEMap[c.doctorState].count++
    }
  }
  const noCoEStates = Object.entries(noCoEMap).map(([state, v]) => ({ state, count: v.count, disease: v.disease }))

  // Quarterly trend: group confirmed cases by quarter of confirmedAt
  const trendMap: Record<string, number> = {}
  for (const c of confirmed) {
    if (c.confirmedAt) {
      const d = new Date(c.confirmedAt)
      const q = `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`
      trendMap[q] = (trendMap[q] ?? 0) + 1
    }
  }
  const quarterlyTrend = Object.entries(trendMap)
    .map(([quarter, confirmedCount]) => ({ quarter, confirmed: confirmedCount }))
    .sort((a, b) => a.quarter.localeCompare(b.quarter))

  return {
    totalConfirmed: confirmed.length,
    totalCases: db.cases.length,
    byCategory,
    byState: Object.entries(byState)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count),
    byDisease: Object.entries(delaysByDisease)
      .map(([disease, _]) => ({ disease, count: confirmed.filter(c => c.confirmedDiagnosisName === disease).length }))
      .sort((a, b) => b.count - a.count),
    diagnosticDelay: {
      medianDays: median(allDelays),
      byDisease: Object.entries(delaysByDisease)
        .map(([disease, arr]) => ({ disease, days: median(arr) }))
        .sort((a, b) => b.days - a.days),
    },
    treatmentAccessGap: {
      noCoECount: noCoEStates.reduce((s, x) => s + x.count, 0),
      noCoEStates,
    },
    quarterlyTrend,
    activeConsultations: db.consultations.filter(c => c.status === 'pending').length,
    pendingResearchRequests: db.researchRequests.filter(r => r.status === 'pending').length,
  }
}

// ── Research cohort query ─────────────────────────────────────────────────────

export function queryCohort(filter: { diseaseName?: string; omimId?: string; gene?: string; state?: string }): number {
  const db = read()
  const consentingPatientIds = new Set(
    db.consents.filter(c => c.researchCohort).map(c => c.patientUserId)
  )
  return db.cases.filter(c => {
    if (c.status !== 'confirmed') return false
    // Only count cases whose patient has consented to research cohort
    if (!c.patientId || !consentingPatientIds.has(c.patientId)) return false
    if (filter.omimId && c.confirmedOmimId !== filter.omimId) return false
    if (filter.gene && c.confirmedGene?.toLowerCase() !== filter.gene.toLowerCase()) return false
    if (filter.diseaseName && !c.confirmedDiagnosisName?.toLowerCase().includes(filter.diseaseName.toLowerCase())) return false
    if (filter.state && filter.state !== 'All India' && c.doctorState !== filter.state) return false
    return true
  }).length
}

// ── Timeline ──────────────────────────────────────────────────────────────────

function addTimeline(db: DB, event: Omit<StoredTimelineEvent, 'id' | 'createdAt'>) {
  db.timeline.push({ ...event, id: randomUUID(), createdAt: new Date().toISOString() })
}

export function getCaseTimeline(caseId: string): StoredTimelineEvent[] {
  return read().timeline.filter(e => e.caseId === caseId).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function getCaseConsent(caseId: string): StoredConsent | null {
  return read().consents.find(c => c.caseId === caseId) ?? null
}

export function getConsentByPatient(patientUserId: string): StoredConsent | null {
  return read().consents.find(c => c.patientUserId === patientUserId) ?? null
}

export function upsertConsent(data: {
  patientUserId: string
  caseId: string
  epidemiology: boolean
  researchCohort: boolean
  researchContact: boolean
}): StoredConsent {
  const db = read()
  const idx = db.consents.findIndex(c => c.patientUserId === data.patientUserId)
  const now = new Date().toISOString()
  if (idx === -1) {
    const c: StoredConsent = { ...data, id: randomUUID(), updatedAt: now }
    db.consents.push(c)
    addTimeline(db, { caseId: data.caseId, eventType: 'consent_updated', actorUserId: data.patientUserId, metadata: {} })
    write(db)
    return c
  }
  db.consents[idx] = { ...db.consents[idx], ...data, updatedAt: now }
  addTimeline(db, { caseId: data.caseId, eventType: 'consent_updated', actorUserId: data.patientUserId, metadata: {} })
  write(db)
  return db.consents[idx]
}
