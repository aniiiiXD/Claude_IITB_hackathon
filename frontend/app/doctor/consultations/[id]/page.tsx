'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ChevronLeft, CheckCircle2, Send, Loader2, Building2, FlaskConical, BadgeIndianRupee, ThumbsUp, ThumbsDown } from 'lucide-react';
import { DEMO_CASES } from '@/lib/demo-cases';
import type { StoredConsultation, StoredCase, PipelineStatus } from '@/lib/store';
import type { CaseResult } from '@/lib/demo-cases';
import { useMockSession } from '@/lib/mock-session';
import { PipelineTracker } from '@/components/case/pipeline-tracker';

const MOCK_USERS: Record<string, { name: string; institution: string }> = {
  u1: { name: 'Dr. Priya Nair', institution: 'Apollo Hospitals, Ahmedabad' },
  u2: { name: 'Dr. Rajesh Mehra', institution: 'AIIMS New Delhi' },
  sp2: { name: 'Dr. Sheela Nampoori', institution: 'CMC Vellore' },
  sp3: { name: 'Dr. Arun Bhatt', institution: 'KEM Mumbai' },
  sp4: { name: 'Dr. Pooja Dewan', institution: 'AIIMS Delhi' },
};

export default function ConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useMockSession();

  const [consult, setConsult] = useState<StoredConsultation | null>(null);
  const [caseData, setCaseData] = useState<StoredCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pipelineActionLoading, setPipelineActionLoading] = useState<PipelineStatus | null>(null);
  const [labResultInput, setLabResultInput] = useState('');
  const [nprdRefInput, setNprdRefInput] = useState('');
  const [mohfwAmountInput, setMohfwAmountInput] = useState('');

  useEffect(() => {
    fetch(`/api/consultations/${id}`)
      .then(r => r.json())
      .then(async (c: StoredConsultation) => {
        setConsult(c);
        setNotes(c.specialistNotes ?? '');
        setSubmitted(c.status === 'completed');
        // Load associated case
        const caseRes = await fetch(`/api/cases/${c.caseId}`);
        if (caseRes.ok) setCaseData(await caseRes.json());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', specialistNotes: notes }),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const advancePipelineStage = async (
    status: PipelineStatus,
    extras: { labResult?: string; nprdReferenceNumber?: string; mohfwAmount?: number; note?: string } = {}
  ) => {
    setPipelineActionLoading(status);
    try {
      const res = await fetch(`/api/consultations/${id}/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          byUserId: user?.id ?? 'u2',
          ...extras,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setConsult(updated);
      }
    } finally {
      setPipelineActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#F5EFE3' }}>
        <Loader2 className="size-6 animate-spin" style={{ color: '#1E2D4A' }} />
      </div>
    );
  }

  if (!consult) {
    return (
      <div className="px-[5%] py-8">
        <p style={{ color: '#A04A1F' }}>Consultation not found.</p>
      </div>
    );
  }

  const demo = DEMO_CASES.find(d => d.id === caseData?.demoId);
  const result = ((caseData?.aiResult ?? demo?.result ?? null) as CaseResult | null);
  const requestingDoctor = MOCK_USERS[consult.requestingDoctorId] ?? { name: 'Unknown', institution: '' };

  return (
    <div className="px-[5%] py-8">
      <Link
        href="/doctor/consultations"
        className="mb-6 flex items-center gap-2 text-sm transition-colors hover:text-orange-700"
        style={{ color: '#6B7D93' }}>
        <ChevronLeft className="size-4" />
        Back to consultations
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
            Consultation Request
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>
            From {requestingDoctor.name} · {requestingDoctor.institution}
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-sm font-medium"
          style={{
            background: submitted ? 'rgba(92,120,85,0.1)' : 'rgba(184,132,42,0.1)',
            color: submitted ? '#5C7855' : '#B8842A',
          }}>
          {submitted ? 'Completed' : 'Pending your review'}
        </span>
      </div>

      {/* Request note */}
      {consult.requestNote && (
        <div
          className="mb-6 rounded-xl p-5"
          style={{ background: 'rgba(139,108,156,0.06)', border: '1px solid rgba(139,108,156,0.15)' }}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B6C9C' }}>
            GP's question
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#1E2D4A' }}>{consult.requestNote}</p>
        </div>
      )}

      {/* Case summary */}
      {caseData && (
        <div
          className="mb-6 rounded-xl p-5"
          style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7D93' }}>Case summary</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-xs" style={{ color: '#8B96A8' }}>Patient</p>
              <p className="font-medium" style={{ color: '#0F1828' }}>{caseData.patientSummary}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#8B96A8' }}>Confirmed diagnosis</p>
              <p className="font-medium" style={{ color: '#5C7855' }}>{caseData.confirmedDiagnosisName ?? '—'}</p>
            </div>
            {caseData.confirmedOmimId && (
              <div>
                <p className="text-xs" style={{ color: '#8B96A8' }}>OMIM</p>
                <p className="font-mono font-medium" style={{ color: '#0F1828' }}>{caseData.confirmedOmimId}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI differential summary */}
      {result && (
        <div
          className="mb-6 rounded-xl p-5"
          style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7D93' }}>AI differential (top 3)</p>
          <div className="space-y-2">
            {result.unified_differential.slice(0, 3).map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-4 text-xs font-bold" style={{ color: '#A0AAB8' }}>{i + 1}</span>
                <span className="flex-1 text-sm" style={{ color: '#1E2D4A' }}>{d.disease_name}</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: d.confidence_pct >= 75 ? '#5C7855' : d.confidence_pct >= 50 ? '#B8842A' : '#8B96A8' }}>
                  {d.confidence_pct}%
                </span>
              </div>
            ))}
          </div>
          {result.disagreements.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(15,24,40,0.06)' }}>
              <p className="mb-2 text-xs font-medium" style={{ color: '#B8842A' }}>Agent disagreement</p>
              {result.disagreements.map((dis, i) => (
                <p key={i} className="text-xs" style={{ color: '#6B7D93' }}>
                  <span style={{ color: '#1E2D4A' }}>{dis.disease}</span> — flagged by {dis.flagged_by.join(', ')} only.{' '}
                  Resolved by: {dis.resolving_test}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Case text */}
      {caseData?.caseText && (
        <div
          className="mb-6 rounded-xl p-5"
          style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7D93' }}>Original case text</p>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: '#6B7D93', fontFamily: 'JetBrains Mono, monospace' }}>
            {caseData.caseText}
          </pre>
        </div>
      )}

      {/* CoE referral — pipeline tracker + advance buttons */}
      {consult.purpose === 'coe_referral' && (
        <>
          <div className="mb-6">
            <PipelineTracker consultation={consult} />
          </div>

          <div className="mb-6 rounded-xl p-5"
            style={{ background: 'rgba(160,74,31,0.04)', border: '1px solid rgba(160,74,31,0.2)' }}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#A04A1F' }}>
              Advance the pipeline · your actions
            </p>
            <p className="mb-5 text-xs leading-relaxed" style={{ color: '#1E2D4A' }}>
              You hold the next steps in this patient&apos;s NPRD authorization. Each action below
              advances the pipeline visibly to the GP and the patient.
            </p>

            <div className="space-y-4">
              {/* Stage: Accept */}
              {consult.pipelineStatus === 'sent' && (
                <PipelineActionCard
                  icon={ThumbsUp}
                  title="Accept this referral"
                  description="Confirms you've reviewed the Nidaan packet and are taking the case. The GP and patient see this immediately."
                  onAction={() => advancePipelineStage('accepted', { note: 'Referral accepted; case under review.' })}
                  loading={pipelineActionLoading === 'accepted'}
                  accent="#5C7855"
                />
              )}

              {/* Stage: Lab confirmation */}
              {consult.pipelineStatus === 'accepted' && (
                <div className="rounded-md p-4"
                  style={{ background: 'rgba(30,45,74,0.04)', border: '1px solid rgba(30,45,74,0.2)' }}>
                  <div className="mb-2 flex items-center gap-2">
                    <FlaskConical className="size-4" style={{ color: '#1E2D4A' }} />
                    <p className="text-sm font-semibold" style={{ color: '#0F1828' }}>Log lab confirmation</p>
                  </div>
                  <p className="mb-3 text-xs" style={{ color: '#6B7D93' }}>
                    Once your accredited lab has confirmed the diagnosis (enzyme assay or genetic sequencing), record the result here.
                  </p>
                  <input
                    value={labResultInput}
                    onChange={e => setLabResultInput(e.target.value)}
                    placeholder="e.g. β-glucocerebrosidase activity 1.2 nmol/h/mg (ref: 8–18) — DEFICIENT"
                    className="mb-3 w-full rounded-lg px-3 py-2 text-xs outline-none placeholder:opacity-40"
                    style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(30,45,74,0.2)', color: '#0F1828' }}
                  />
                  <button
                    onClick={() => advancePipelineStage('lab_confirmed', { labResult: labResultInput })}
                    disabled={!labResultInput.trim() || pipelineActionLoading === 'lab_confirmed'}
                    className="flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ background: '#1E2D4A', color: '#F5EFE3' }}>
                    {pipelineActionLoading === 'lab_confirmed' ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                    Lab confirmation logged
                  </button>
                </div>
              )}

              {/* Stage: NPRD application filed */}
              {consult.pipelineStatus === 'lab_confirmed' && (
                <div className="rounded-md p-4"
                  style={{ background: 'rgba(184,132,42,0.05)', border: '1px solid rgba(184,132,42,0.2)' }}>
                  <div className="mb-2 flex items-center gap-2">
                    <BadgeIndianRupee className="size-4" style={{ color: '#B8842A' }} />
                    <p className="text-sm font-semibold" style={{ color: '#0F1828' }}>Log NPRD application filing</p>
                  </div>
                  <p className="mb-3 text-xs" style={{ color: '#6B7D93' }}>
                    Once you&apos;ve submitted the NPRD funding application to MoHFW, record the reference number for tracking.
                  </p>
                  <input
                    value={nprdRefInput}
                    onChange={e => setNprdRefInput(e.target.value)}
                    placeholder="NPRD reference number (e.g. NPRD/2026/04/0214)"
                    className="mb-3 w-full rounded-lg px-3 py-2 font-mono text-xs outline-none placeholder:opacity-40"
                    style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(184,132,42,0.25)', color: '#0F1828' }}
                  />
                  <button
                    onClick={() => advancePipelineStage('nprd_filed', { nprdReferenceNumber: nprdRefInput })}
                    disabled={!nprdRefInput.trim() || pipelineActionLoading === 'nprd_filed'}
                    className="flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ background: '#B8842A', color: '#F5EFE3' }}>
                    {pipelineActionLoading === 'nprd_filed' ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                    NPRD filed
                  </button>
                </div>
              )}

              {/* Stage: MoHFW response */}
              {consult.pipelineStatus === 'nprd_filed' && (
                <div className="rounded-md p-4"
                  style={{ background: 'rgba(15,24,40,0.03)', border: '1px solid rgba(15,24,40,0.1)' }}>
                  <p className="mb-3 text-sm font-semibold" style={{ color: '#0F1828' }}>Log MoHFW response</p>
                  <p className="mb-3 text-xs" style={{ color: '#6B7D93' }}>
                    Once MoHFW responds (4–24 weeks typically), log the outcome here.
                  </p>
                  <input
                    type="number"
                    value={mohfwAmountInput}
                    onChange={e => setMohfwAmountInput(e.target.value)}
                    placeholder="If approved, amount in ₹ (e.g. 5000000)"
                    className="mb-3 w-full rounded-lg px-3 py-2 text-xs outline-none placeholder:opacity-40"
                    style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(15,24,40,0.15)', color: '#0F1828' }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => advancePipelineStage('mohfw_approved', { mohfwAmount: parseInt(mohfwAmountInput) || undefined })}
                      disabled={pipelineActionLoading === 'mohfw_approved'}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                      style={{ background: 'rgba(92,120,85,0.15)', border: '1px solid rgba(92,120,85,0.4)', color: '#5C7855' }}>
                      {pipelineActionLoading === 'mohfw_approved' ? <Loader2 className="size-3 animate-spin" /> : <ThumbsUp className="size-3" />}
                      Approved
                    </button>
                    <button
                      onClick={() => advancePipelineStage('mohfw_rejected', { note: 'MoHFW rejected — escalation pathway begins.' })}
                      disabled={pipelineActionLoading === 'mohfw_rejected'}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                      style={{ background: 'rgba(160,74,31,0.1)', border: '1px solid rgba(160,74,31,0.3)', color: '#A04A1F' }}>
                      {pipelineActionLoading === 'mohfw_rejected' ? <Loader2 className="size-3 animate-spin" /> : <ThumbsDown className="size-3" />}
                      Rejected
                    </button>
                  </div>
                </div>
              )}

              {/* Done */}
              {(consult.pipelineStatus === 'mohfw_approved' || consult.pipelineStatus === 'mohfw_rejected') && (
                <div className="rounded-md p-4 text-center"
                  style={{ background: 'rgba(92,120,85,0.05)', border: '1px dashed rgba(92,120,85,0.3)' }}>
                  <p className="text-sm font-semibold" style={{ color: '#0F1828' }}>
                    Pipeline complete · status visible to GP and patient
                  </p>
                  <p className="mt-1 text-xs" style={{ color: '#6B7D93' }}>
                    {consult.pipelineStatus === 'mohfw_approved'
                      ? 'NPRD funding approved. Treatment can be initiated at this CoE.'
                      : 'MoHFW rejected. Escalation pathway is active in the case detail Support Network panel.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Notes form / display */}
      {submitted ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl p-5"
          style={{ background: 'rgba(92,120,85,0.05)', border: '1px solid rgba(92,120,85,0.2)' }}>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-4" style={{ color: '#5C7855' }} />
            <p className="text-sm font-semibold" style={{ color: '#5C7855' }}>Consultation notes submitted</p>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: '#1E2D4A' }}>{notes}</p>
        </motion.div>
      ) : (
        <div
          className="rounded-xl p-5"
          style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
          <p className="mb-3 text-sm font-semibold" style={{ color: '#0F1828' }}>Add consultation notes</p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={7}
            placeholder="Clinical assessment, treatment recommendations, guidance on investigations, comments on agent disagreements…"
            className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none placeholder:opacity-30"
            style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(139,108,156,0.2)', color: '#0F1828' }}
          />
          <button
            onClick={handleSubmit}
            disabled={!notes.trim() || submitting}
            className="mt-4 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: 'rgba(139,108,156,0.15)', border: '1px solid rgba(139,108,156,0.3)', color: '#8B6C9C' }}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Submit consultation notes
          </button>
        </div>
      )}
    </div>
  );
}


function PipelineActionCard({ icon: Icon, title, description, onAction, loading, accent }: {
  icon: React.ElementType;
  title: string;
  description: string;
  onAction: () => void;
  loading: boolean;
  accent: string;
}) {
  return (
    <div className="rounded-md p-4"
      style={{ background: `${accent}08`, border: `1px solid ${accent}30` }}>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-4" style={{ color: accent }} />
        <p className="text-sm font-semibold" style={{ color: '#0F1828' }}>{title}</p>
      </div>
      <p className="mb-3 text-xs" style={{ color: '#6B7D93' }}>{description}</p>
      <button
        onClick={onAction}
        disabled={loading}
        className="flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: accent, color: '#F5EFE3' }}>
        {loading ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
        {title}
      </button>
    </div>
  );
}
