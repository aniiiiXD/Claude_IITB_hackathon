'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, Clock, ChevronLeft, UserPlus, MessageSquare,
  ChevronDown, AlertCircle, Send, X, MapPin, Navigation, Loader2, ExternalLink, BadgeIndianRupee,
  Inbox, Brain, Stethoscope, Dna, FlaskConical, HeartPulse, Microscope, Sparkles,
  FileText, Building2, Download
} from 'lucide-react';
type Specialist = { id: string; name: string; specialty: string };
import { DEMO_CASES } from '@/lib/demo-cases';
import { SupportNetworkPanel } from '@/components/case/support-network-panel';
import { PipelineTracker } from '@/components/case/pipeline-tracker';
import { findSpecialists } from '@/lib/connections';
import { getCentersForDisease, TreatmentCenter } from '@/lib/centers';
import {
  getUserLocation, sortCentersByDistance, googleMapsDirectionsUrl,
  formatDistance, WithDistance
} from '@/lib/geolocation';
import { SCHEMES } from '@/lib/schemes';
import { useMockSession } from '@/lib/mock-session';
import type { StoredCase, StoredConsultation } from '@/lib/store';

const TIER_COLORS = { 1: '#5C7855', 2: '#1E2D4A', 3: '#8B6C9C' };
const AGENT_COLORS: Record<string, string> = {
  Metabolic: '#1E2D4A', Neurogenetic: '#8B6C9C', Immunologic: '#5C7855',
};

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useMockSession();

  const [caseData, setCaseData] = useState<StoredCase & { consultations?: StoredConsultation[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then(r => r.json())
      .then(data => { setCaseData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const [confirmed, setConfirmed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showCoeModal, setShowCoeModal] = useState(false);
  const [coeReferralNote, setCoeReferralNote] = useState('');
  const [expandedDiff, setExpandedDiff] = useState<number | null>(0);
  const [confirmForm, setConfirmForm] = useState({ disease: '', omim: '', gene: '', test: '', overrideJustification: '' });
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [consultNote, setConsultNote] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [consultSent, setConsultSent] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [stepStates, setStepStates] = useState<Record<string, 'pending' | 'running' | 'done'>>({});
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);

  useEffect(() => {
    fetch('/api/specialists')
      .then(r => r.json())
      .then(setSpecialists)
      .catch(() => {});
  }, []);

  // Sync state once data loads
  useEffect(() => {
    if (!caseData) return;
    setConfirmed(caseData.status === 'confirmed');
    setInviteSent(!!caseData.patientId && caseData.submittedBy !== 'patient');
    setConsultSent((caseData.consultations?.length ?? 0) > 0);
    setDoctorNotes(caseData.doctorAddedText ?? '');
    // Pre-fill confirm form from AI result top diagnosis
    const aiResult = caseData.aiResult as { unified_differential?: { disease_name?: string; omim_id?: string }[] } | null;
    const topDx = aiResult?.unified_differential?.[0];
    setConfirmForm({
      disease: caseData.confirmedDiagnosisName ?? topDx?.disease_name ?? '',
      omim: caseData.confirmedOmimId ?? topDx?.omim_id ?? '',
      gene: caseData.confirmedGene ?? '',
      test: '',
      overrideJustification: '',
    });
  }, [caseData]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

  const runAnalysis = async () => {
    if (!caseData) return;
    const combined = [
      caseData.patientSubmittedText ? `--- Patient's own description ---\n${caseData.patientSubmittedText}` : '',
      doctorNotes ? `\n--- Doctor's clinical observations ---\n${doctorNotes}` : '',
    ].filter(Boolean).join('\n');

    setAnalyzeError(null);
    setStepStates({});

    // Mark case as analyzing first
    await fetch(`/api/cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'analyzing',
        doctorAddedText: doctorNotes,
        caseText: combined,
      }),
    });
    setCaseData(prev => prev ? { ...prev, status: 'analyzing', doctorAddedText: doctorNotes, caseText: combined } : prev);

    try {
      const res = await fetch(`${API_URL}/analyze/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_text: combined }),
      });
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));

          if (data.event === 'agent_start') {
            setStepStates(s => ({ ...s, [data.agent]: 'running' }));
          } else if (data.event === 'agent_done') {
            setStepStates(s => ({ ...s, [data.agent]: 'done' }));
          } else if (data.event === 'complete') {
            const finalStatus = data.result.stopped_at_screener ? 'draft' : 'draft';
            const patchRes = await fetch(`/api/cases/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: finalStatus, aiResult: data.result }),
            });
            if (patchRes.ok) {
              const updated = await patchRes.json();
              // Re-fetch with timeline + consultations
              const full = await fetch(`/api/cases/${id}`).then(r => r.json());
              setCaseData(full);
              void updated;
            }
          } else if (data.event === 'error') {
            throw new Error(data.message);
          }
        }
      }
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : 'Analysis failed — is the backend running?');
      // Roll back to awaiting_doctor_review so doctor can retry
      await fetch(`/api/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'awaiting_doctor_review' }),
      });
      setCaseData(prev => prev ? { ...prev, status: 'awaiting_doctor_review' } : prev);
    }
  };

  // Detect whether the doctor's confirmed disease overrides the AI's #1 differential
  const aiTopDx = (caseData?.aiResult as { unified_differential?: { disease_name?: string; omim_id?: string }[] } | null)
    ?.unified_differential?.[0];
  const isOverridingAi = !!(aiTopDx && confirmForm.omim && aiTopDx.omim_id !== confirmForm.omim);

  const handleConfirm = async () => {
    const patch = {
      status: 'confirmed' as const,
      confirmedAt: new Date().toISOString(),
      confirmedDiagnosisName: confirmForm.disease,
      confirmedOmimId: confirmForm.omim,
      confirmedGene: confirmForm.gene || null,
      // Persist the override justification when the doctor disagrees with AI #1
      overrideJustification: isOverridingAi ? confirmForm.overrideJustification : null,
    };
    const res = await fetch(`/api/cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated = await res.json();
      setCaseData(prev => prev ? { ...prev, ...updated } : prev);
      setConfirmed(true);
    }
    setShowConfirmModal(false);
  };

  const handleInvite = async () => {
    // Hardcoded mapping: in a real system the phone would resolve to a user account
    const patientId = 'u3';
    const res = await fetch(`/api/cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCaseData(prev => prev ? { ...prev, ...updated } : prev);
      setInviteSent(true);
    }
    setShowInviteModal(false);
  };

  const handleConsult = async () => {
    if (!selectedSpecialist) return;
    await fetch(`/api/cases/${id}/consult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestingDoctorId: user?.id ?? 'u1',
        specialistId: selectedSpecialist,
        requestNote: consultNote,
      }),
    });
    setConsultSent(true);
    setShowConsultModal(false);
  };

  const handleCoeReferral = async (specialistId: string) => {
    const res = await fetch(`/api/cases/${id}/consult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purpose: 'coe_referral',
        requestingDoctorId: user?.id ?? 'u1',
        specialistId,
        requestNote: coeReferralNote || `CoE referral for ${caseData?.confirmedDiagnosisName}. Full Nidaan packet attached. Requesting lab confirmation and NPRD application.`,
      }),
    });
    if (res.ok) {
      // Refresh full case to pick up the new consultation
      const full = await fetch(`/api/cases/${id}`).then(r => r.json());
      setCaseData(full);
    }
    setShowCoeModal(false);
    setCoeReferralNote('');
  };

  if (loading || !caseData) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#F5EFE3' }}>
        <Loader2 className="size-6 animate-spin" style={{ color: '#1E2D4A' }} />
      </div>
    );
  }

  // Resolve AI result: prefer real aiResult, fall back to demo static data
  const demo = DEMO_CASES.find(d => d.id === caseData.demoId);
  const result = (caseData.aiResult ?? demo?.result ?? null) as import('@/lib/demo-cases').CaseResult | null;
  const existingConsult = caseData.consultations?.find(c => c.purpose === 'consult') ?? null;
  const coeReferral = caseData.consultations?.find(c => c.purpose === 'coe_referral') ?? null;

  // Auto-route: pick the first specialist whose expertise covers this disease
  const recommendedCoeContacts = findSpecialists(caseData.confirmedOmimId);
  const recommendedCoe = recommendedCoeContacts[0];

  return (
    <div className="px-[5%] py-8">
      {/* Back */}
      <Link
        href="/doctor/cases"
        className="mb-6 flex items-center gap-2 text-sm transition-colors hover:text-orange-700"
        style={{ color: '#6B7D93' }}>
        <ChevronLeft className="size-4" />
        Back to cases
      </Link>

      {/* Case header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
              Case #{caseData.id.split('-')[1].toUpperCase()}
            </h1>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                background:
                  caseData.status === 'awaiting_doctor_review' ? 'rgba(160,74,31,0.1)' :
                  caseData.status === 'analyzing' ? 'rgba(139,108,156,0.1)' :
                  caseData.status === 'confirmed' ? 'rgba(92,120,85,0.1)' :
                  'rgba(184,132,42,0.1)',
                color:
                  caseData.status === 'awaiting_doctor_review' ? '#A04A1F' :
                  caseData.status === 'analyzing' ? '#8B6C9C' :
                  caseData.status === 'confirmed' ? '#5C7855' :
                  '#B8842A',
              }}>
              {caseData.status === 'awaiting_doctor_review' ? 'Patient submission' :
               caseData.status === 'analyzing' ? 'AI analyzing' :
               caseData.status === 'confirmed' ? 'Confirmed' :
               'Awaiting confirmation'}
            </span>
          </div>
          <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>{caseData.patientSummary}</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {caseData.status === 'draft' && result && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #5C7855, #1E2D4A)', color: '#F5EFE3' }}>
              <CheckCircle2 className="size-4" />
              Confirm Diagnosis
            </button>
          )}
          {confirmed && !coeReferral && recommendedCoe && (
            <button
              onClick={() => setShowCoeModal(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #A04A1F, #5C7855)', color: '#F5EFE3', boxShadow: '2px 2px 0 rgba(160,74,31,0.3)' }}>
              <Building2 className="size-4" />
              Route to CoE
            </button>
          )}
          {confirmed && coeReferral && (
            <span className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm" style={{ color: '#5C7855', background: 'rgba(92,120,85,0.07)', border: '1px solid rgba(92,120,85,0.25)' }}>
              <Building2 className="size-4" />
              CoE referral active
            </span>
          )}
          {confirmed && !inviteSent && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(92,120,85,0.12)', border: '1px solid rgba(92,120,85,0.3)', color: '#5C7855' }}>
              <UserPlus className="size-4" />
              Invite Patient
            </button>
          )}
          {confirmed && inviteSent && (
            <span className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm" style={{ color: '#5C7855', background: 'rgba(92,120,85,0.07)', border: '1px solid rgba(92,120,85,0.15)' }}>
              <CheckCircle2 className="size-4" />
              Patient invited
            </span>
          )}
          {confirmed && !consultSent && (
            <button
              onClick={() => setShowConsultModal(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'rgba(139,108,156,0.12)', border: '1px solid rgba(139,108,156,0.3)', color: '#8B6C9C' }}>
              <MessageSquare className="size-4" />
              Request Consult
            </button>
          )}
          {confirmed && consultSent && (
            <span className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm" style={{ color: '#8B6C9C', background: 'rgba(139,108,156,0.07)', border: '1px solid rgba(139,108,156,0.15)' }}>
              <MessageSquare className="size-4" />
              Consult sent
            </span>
          )}
        </div>
      </div>

      {/* Confirmation banner */}
      {confirmed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl p-4"
          style={{ background: 'rgba(92,120,85,0.06)', border: '1px solid rgba(92,120,85,0.2)' }}>
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider" style={{ color: '#5C7855' }}>Confirmed diagnosis</p>
              <p className="mt-0.5 font-semibold" style={{ color: '#0F1828' }}>{caseData.confirmedDiagnosisName}</p>
            </div>
            {caseData.confirmedOmimId && (
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: '#5C7855' }}>OMIM</p>
                <p className="mt-0.5 font-mono font-semibold" style={{ color: '#0F1828' }}>{caseData.confirmedOmimId}</p>
              </div>
            )}
            {caseData.confirmedGene && (
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: '#5C7855' }}>Gene</p>
                <p className="mt-0.5 font-mono font-semibold" style={{ color: '#0F1828' }}>{caseData.confirmedGene}</p>
              </div>
            )}
            {caseData.confirmedAt && (
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: '#5C7855' }}>Confirmed</p>
                <p className="mt-0.5" style={{ color: '#0F1828' }}>
                  {new Date(caseData.confirmedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Patient submission review — when awaiting doctor review */}
      {caseData.status === 'awaiting_doctor_review' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl p-6"
          style={{ background: 'rgba(160,74,31,0.04)', border: '1px solid rgba(160,74,31,0.2)' }}>
          <div className="mb-4 flex items-center gap-2">
            <Inbox className="size-5" style={{ color: '#A04A1F' }} />
            <h2 className="text-base font-semibold" style={{ color: '#0F1828' }}>
              Patient submission · review and add your clinical observations
            </h2>
          </div>

          {caseData.patientSubmittedText && (
            <div className="mb-5 rounded-xl p-4"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(15,24,40,0.06)' }}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7D93' }}>
                Patient's own words
              </p>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: '#1E2D4A', fontFamily: 'inherit' }}>
                {caseData.patientSubmittedText}
              </pre>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7D93' }}>
              Your clinical observations
            </label>
            <textarea
              value={doctorNotes}
              onChange={e => setDoctorNotes(e.target.value)}
              rows={7}
              placeholder="Examination findings, vitals, lab results, anything not in the patient's description. The AI agents will see both the patient's words and your notes."
              className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none placeholder:opacity-30"
              style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(160,74,31,0.2)', color: '#0F1828' }}
            />
          </div>

          {analyzeError && (
            <div className="mt-3 rounded-xl p-3 text-sm"
              style={{ background: 'rgba(160,74,31,0.08)', border: '1px solid rgba(160,74,31,0.25)', color: '#A04A1F' }}>
              {analyzeError}
            </div>
          )}

          <button
            onClick={runAnalysis}
            className="mt-4 flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #A04A1F, #8B6C9C)', color: 'white' }}>
            <Sparkles className="size-4" />
            Send for AI analysis
          </button>
        </motion.div>
      )}

      {/* Analysis in progress — streaming agent states */}
      {caseData.status === 'analyzing' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl p-6"
          style={{ background: 'rgba(139,108,156,0.04)', border: '1px solid rgba(139,108,156,0.25)' }}>
          <div className="mb-4 flex items-center gap-2">
            <Brain className="size-5" style={{ color: '#8B6C9C' }} />
            <h2 className="text-base font-semibold" style={{ color: '#0F1828' }}>
              AI analysis in progress
            </h2>
            <span className="ml-auto text-xs" style={{ color: '#6B7D93' }}>~5–7 minutes</span>
          </div>
          <p className="mb-5 text-sm" style={{ color: '#6B7D93' }}>
            Six specialized agents are reviewing this case in parallel. You can leave this page —
            the analysis continues on the server, and the case will be ready when you return.
          </p>

          <div className="space-y-2">
            {[
              { id: 'screener', label: 'Common-disease screener', icon: Stethoscope, model: 'Haiku 4.5' },
              { id: 'extractor', label: 'Phenotype extraction (HPO)', icon: Dna, model: 'Haiku 4.5' },
              { id: 'metabolic', label: 'Metabolic specialist', icon: FlaskConical, model: 'Sonnet 4.6' },
              { id: 'neurogenetic', label: 'Neurogenetic specialist', icon: Brain, model: 'Sonnet 4.6' },
              { id: 'immunologic', label: 'Immunologic specialist', icon: HeartPulse, model: 'Sonnet 4.6' },
              { id: 'synthesizer', label: 'Case synthesizer', icon: Microscope, model: 'Opus 4.7' },
            ].map(agent => {
              const state = stepStates[agent.id] ?? 'pending';
              const Icon = agent.icon;
              return (
                <div key={agent.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: state === 'running' ? 'rgba(139,108,156,0.08)' : state === 'done' ? 'rgba(92,120,85,0.05)' : 'rgba(15,24,40,0.02)',
                    border: `1px solid ${state === 'running' ? 'rgba(139,108,156,0.3)' : state === 'done' ? 'rgba(92,120,85,0.2)' : 'rgba(15,24,40,0.06)'}`,
                  }}>
                  <div className="flex size-8 items-center justify-center rounded-lg"
                    style={{
                      background: state === 'done' ? 'rgba(92,120,85,0.12)' : 'rgba(139,108,156,0.08)',
                      color: state === 'done' ? '#5C7855' : '#8B6C9C',
                    }}>
                    {state === 'running' ? <Loader2 className="size-4 animate-spin" /> :
                     state === 'done' ? <CheckCircle2 className="size-4" /> :
                     <Icon className="size-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#1E2D4A' }}>{agent.label}</p>
                    <p className="text-xs" style={{ color: '#A0AAB8' }}>{agent.model}</p>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider"
                    style={{
                      color: state === 'running' ? '#8B6C9C' : state === 'done' ? '#5C7855' : '#A0AAB8',
                    }}>
                    {state === 'running' ? 'Running' : state === 'done' ? 'Done' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Action Package — what fires the moment a diagnosis is confirmed */}
      {confirmed && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <ActionPackagePanel
            caseData={caseData}
            inviteSent={inviteSent}
            consultSent={consultSent}
            onInvite={() => setShowInviteModal(true)}
            onConsult={() => setShowConsultModal(true)}
          />
        </motion.div>
      )}

      {/* Pipeline Tracker — only when a CoE referral has been initiated */}
      {confirmed && coeReferral && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} className="mb-6">
          <PipelineTracker consultation={coeReferral} />
        </motion.div>
      )}

      {/* Care Pathway — nearest CoE + government funding */}
      {confirmed && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <CarePathwaySection omimId={caseData.confirmedOmimId ?? result?.unified_differential[0]?.omim_id ?? '230800'} />
        </motion.div>
      )}

      {/* Support Network — all schemes, tips, advocacy contacts, legal pathway */}
      {confirmed && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
          <SupportNetworkPanel
            omimId={caseData.confirmedOmimId}
            state={caseData.doctorState}
          />
        </motion.div>
      )}

      {/* Specialist notes banner */}
      {existingConsult?.specialistNotes && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl p-5"
          style={{ background: 'rgba(139,108,156,0.06)', border: '1px solid rgba(139,108,156,0.2)' }}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B6C9C' }}>
            Specialist consultation — Dr. Rajesh Mehra, AIIMS New Delhi
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#1E2D4A' }}>
            {existingConsult.specialistNotes}
          </p>
        </motion.div>
      )}

      {/* Escalation-signal disclaimer — always visible above AI output */}
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-start gap-3 rounded-md p-4"
          style={{
            background: 'rgba(184,132,42,0.06)',
            border: '1px solid rgba(184,132,42,0.3)',
            borderLeft: '4px solid #B8842A',
          }}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" style={{ color: '#B8842A' }} />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#B8842A' }}>
              Escalation signal — not a diagnosis
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: '#1E2D4A' }}>
              The differential below is generated by AI agents citing real medical databases, but is
              <span className="font-semibold"> not a confirmed diagnosis. </span>
              Confirmation requires laboratory testing (enzyme assay or genetic sequencing) at an accredited centre.
              No clinical action — patient invite, NPRD application, treatment initiation — is automatic.
              Each requires your explicit sign-off. You remain the treating physician of record.
            </p>
          </div>
        </motion.div>
      )}

      {/* AI Report sections */}
      {result && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Differential */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: '#6B7D93' }}>
              AI Differential
            </h2>
            <div className="space-y-2">
              {result.unified_differential.map((d, i) => (
                <div key={i}>
                  <button
                    onClick={() => setExpandedDiff(expandedDiff === i ? null : i)}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-black/[0.04]">
                    <span className="w-5 text-center text-xs font-bold" style={{ color: '#A0AAB8' }}>{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: '#1E2D4A' }}>{d.disease_name}</p>
                      <p className="text-xs" style={{ color: '#A0AAB8' }}>OMIM {d.omim_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-bold"
                        style={{ color: d.confidence_pct >= 75 ? '#5C7855' : d.confidence_pct >= 50 ? '#B8842A' : '#8B96A8' }}>
                        {d.confidence_pct}%
                      </span>
                      <ChevronDown
                        className="size-4 transition-transform"
                        style={{ color: '#A0AAB8', transform: expandedDiff === i ? 'rotate(180deg)' : 'none' }}
                      />
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedDiff === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="px-3 pb-3">
                          <p className="mb-1 text-xs font-medium" style={{ color: '#5C7855' }}>Supporting</p>
                          <ul className="space-y-0.5">
                            {d.supporting_features.slice(0, 3).map((f, j) => (
                              <li key={j} className="text-xs" style={{ color: '#6B7D93' }}>+ {f}</li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended tests */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: '#6B7D93' }}>
              Recommended Tests
            </h2>
            <div className="space-y-3">
              {result.recommended_tests.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <span
                    className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-bold"
                    style={{
                      background: `${TIER_COLORS[t.tier as 1|2|3]}18`,
                      color: TIER_COLORS[t.tier as 1|2|3],
                    }}>
                    T{t.tier}
                  </span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#1E2D4A' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: '#8B96A8' }}>{t.rationale}</p>
                    {t.cost_inr && (
                      <p className="mt-0.5 font-mono text-xs" style={{ color: '#1E2D4A' }}>₹{t.cost_inr}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Case text */}
      <div
        className="mt-6 rounded-xl p-5"
        style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: '#6B7D93' }}>
          Original Case Text
        </h2>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: '#4A5D7A', fontFamily: 'JetBrains Mono, monospace' }}>
          {caseData.caseText}
        </pre>
      </div>

      {/* === MODALS === */}

      {/* Confirm diagnosis modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <Modal onClose={() => setShowConfirmModal(false)} title="Confirm Diagnosis">
            <p className="mb-5 text-sm" style={{ color: '#6B7D93' }}>
              Confirming a diagnosis records it permanently and enables patient invite and specialist consult.
            </p>
            <div className="space-y-4">
              {[
                { label: 'Confirmed disease name', key: 'disease', placeholder: 'Gaucher disease type 1' },
                { label: 'OMIM ID', key: 'omim', placeholder: '230800' },
                { label: 'Gene (optional)', key: 'gene', placeholder: 'GBA' },
                { label: 'Confirming test', key: 'test', placeholder: 'β-glucocerebrosidase enzyme activity, DBS' },
              ].map(f => (
                <div key={f.key}>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: '#6B7D93' }}>{f.label}</label>
                  <input
                    value={confirmForm[f.key as keyof typeof confirmForm]}
                    onChange={e => setConfirmForm(v => ({ ...v, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                    style={{ background: 'rgba(15,24,40,0.05)', border: '1px solid rgba(30,45,74,0.15)', color: '#0F1828' }}
                  />
                </div>
              ))}

              {/* Override-with-justification — only when doctor's confirmed dx differs from AI #1 */}
              {isOverridingAi && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-md p-3"
                  style={{ background: 'rgba(160,74,31,0.06)', border: '1px solid rgba(160,74,31,0.3)' }}>
                  <div className="mb-2 flex items-start gap-2">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" style={{ color: '#A04A1F' }} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#A04A1F' }}>
                        You&apos;re overriding the AI&apos;s top differential
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed" style={{ color: '#1E2D4A' }}>
                        AI ranked <span className="font-semibold">{aiTopDx?.disease_name}</span> (OMIM {aiTopDx?.omim_id}) as #1.
                        You&apos;re confirming <span className="font-semibold">{confirmForm.disease || 'a different diagnosis'}</span>.
                        Briefly note why — this calibrates the agents and protects you in case of audit.
                      </p>
                    </div>
                  </div>
                  <textarea
                    value={confirmForm.overrideJustification}
                    onChange={e => setConfirmForm(v => ({ ...v, overrideJustification: e.target.value }))}
                    rows={3}
                    placeholder={`e.g. "BM biopsy showed sea-blue histiocytes, not Gaucher cells. NPC-C confirmed by filipin staining."`}
                    className="w-full resize-none rounded px-3 py-2 text-xs outline-none placeholder:opacity-40"
                    style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(160,74,31,0.25)', color: '#0F1828' }}
                  />
                </motion.div>
              )}
            </div>
            <button
              onClick={handleConfirm}
              disabled={isOverridingAi && !confirmForm.overrideJustification.trim()}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #5C7855, #1E2D4A)', color: '#F5EFE3' }}>
              <CheckCircle2 className="size-4" />
              {isOverridingAi ? 'Confirm with justification' : 'Confirm diagnosis'}
            </button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Invite patient modal */}
      <AnimatePresence>
        {showInviteModal && (
          <Modal onClose={() => setShowInviteModal(false)} title="Invite Patient">
            <p className="mb-5 text-sm" style={{ color: '#6B7D93' }}>
              The patient will receive an SMS with a link to claim their account and view their diagnosis record.
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#6B7D93' }}>Patient mobile number</label>
              <input
                type="tel"
                value={invitePhone}
                onChange={e => setInvitePhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                style={{ background: 'rgba(15,24,40,0.05)', border: '1px solid rgba(92,120,85,0.15)', color: '#0F1828' }}
              />
            </div>
            <div
              className="mt-4 rounded-xl p-3 text-xs"
              style={{ background: 'rgba(92,120,85,0.05)', border: '1px solid rgba(92,120,85,0.1)', color: '#6B7D93' }}>
              <AlertCircle className="mr-1.5 inline size-3.5" style={{ color: '#5C7855' }} />
              The patient will only see plain-language information. Clinical confidence scores and agent reasoning are not shown.
            </div>
            <button
              onClick={handleInvite}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'rgba(92,120,85,0.15)', border: '1px solid rgba(92,120,85,0.3)', color: '#5C7855' }}>
              <Send className="size-4" />
              Send invite SMS
            </button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Request consult modal */}
      <AnimatePresence>
        {showConsultModal && (
          <Modal onClose={() => setShowConsultModal(false)} title="Request Specialist Consultation">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-medium" style={{ color: '#6B7D93' }}>Select specialist</label>
                <div className="space-y-2">
                  {specialists.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSpecialist(s.id)}
                      className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all"
                      style={{
                        background: selectedSpecialist === s.id ? 'rgba(139,108,156,0.1)' : 'rgba(15,24,40,0.03)',
                        border: `1px solid ${selectedSpecialist === s.id ? 'rgba(139,108,156,0.35)' : 'rgba(15,24,40,0.07)'}`,
                      }}>
                      <div
                        className="mt-1 size-2 shrink-0 rounded-full"
                        style={{ background: selectedSpecialist === s.id ? '#8B6C9C' : '#A0AAB8' }}
                      />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1E2D4A' }}>{s.name}</p>
                        <p className="text-xs" style={{ color: '#8B96A8' }}>{s.specialty}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: '#6B7D93' }}>Note for specialist (optional)</label>
                <textarea
                  value={consultNote}
                  onChange={e => setConsultNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. Patient is 39, starting ERT. Guidance on dosing and family screening?"
                  className="w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                  style={{ background: 'rgba(15,24,40,0.05)', border: '1px solid rgba(139,108,156,0.15)', color: '#0F1828' }}
                />
              </div>
            </div>
            <button
              onClick={handleConsult}
              disabled={!selectedSpecialist}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: 'rgba(139,108,156,0.15)', border: '1px solid rgba(139,108,156,0.3)', color: '#8B6C9C' }}>
              <MessageSquare className="size-4" />
              Send consultation request
            </button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Route-to-CoE modal — auto-routes to disease-appropriate CoE specialist */}
      <AnimatePresence>
        {showCoeModal && recommendedCoe && (
          <Modal onClose={() => setShowCoeModal(false)} title="Route to Centre of Excellence">
            <p className="mb-5 text-sm leading-relaxed" style={{ color: '#6B7D93' }}>
              The CoE specialist files NPRD applications and confirms diagnoses at their accredited lab —
              the work you cannot do from a district hospital. Routing now starts the authorization pipeline.
            </p>

            {/* Auto-recommended CoE */}
            <div className="mb-5 rounded-xl p-4"
              style={{ background: 'rgba(92,120,85,0.07)', border: '1px solid rgba(92,120,85,0.25)' }}>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#5C7855' }}>
                Recommended for this disease
              </p>
              <p className="text-sm font-semibold" style={{ color: '#0F1828' }}>{recommendedCoe.name}</p>
              <p className="mt-0.5 text-xs" style={{ color: '#6B7D93' }}>
                {recommendedCoe.city}, {recommendedCoe.state}
              </p>
              <p className="mt-2 text-[11px]" style={{ color: '#1E2D4A' }}>
                <strong>Receives:</strong> {recommendedCoe.receives[0]}
              </p>
            </div>

            {/* Packet preview */}
            <div className="mb-5 rounded-xl p-3 text-[11px]"
              style={{ background: 'rgba(15,24,40,0.03)', border: '1px solid rgba(15,24,40,0.07)', color: '#1E2D4A' }}>
              <p className="mb-1 font-bold" style={{ color: '#6B7D93' }}>Nidaan packet — what gets routed:</p>
              <ul className="space-y-0.5">
                <li>· Patient&apos;s submitted symptoms (their own words)</li>
                <li>· Your clinical observations</li>
                <li>· Full AI differential (top {result?.unified_differential?.length ?? 0} ranked)</li>
                <li>· Specialist disagreement analysis &amp; resolving tests</li>
                <li>· HPO terms, recommended tier-1 tests with ₹ costs</li>
                <li>· Suggested NPRD group classification &amp; pre-fill data</li>
              </ul>
            </div>

            {/* Optional note */}
            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-medium" style={{ color: '#6B7D93' }}>
                Note for the CoE specialist (optional)
              </label>
              <textarea
                value={coeReferralNote}
                onChange={e => setCoeReferralNote(e.target.value)}
                rows={3}
                placeholder="e.g. Patient has consanguinity; family history suggests autosomal recessive. Family income below NPRD threshold — Group 3a expected."
                className="w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                style={{ background: 'rgba(15,24,40,0.05)', border: '1px solid rgba(92,120,85,0.2)', color: '#0F1828' }}
              />
            </div>

            <button
              onClick={() => handleCoeReferral(recommendedCoe.id)}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #A04A1F, #5C7855)', color: '#F5EFE3' }}>
              <Building2 className="size-4" />
              Route to {recommendedCoe.name.split(' · ')[0]}
            </button>
            <p className="mt-3 text-[10px] italic text-center" style={{ color: '#8B96A8' }}>
              The specialist receives the packet immediately. Pipeline tracker on the case page will reflect their actions live.
            </p>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Action Package Panel ─────────────────────────────────────────────────────
// Fires the moment a diagnosis is confirmed. The four immediate next moves:
// NPRD application, lab requisition, treatment-centre referral, patient invite.

function ActionPackagePanel({ caseData, inviteSent, consultSent, onInvite, onConsult }: {
  caseData: StoredCase;
  inviteSent: boolean;
  consultSent: boolean;
  onInvite: () => void;
  onConsult: () => void;
}) {
  const omimId = caseData.confirmedOmimId ?? '230800';
  const nearestCoE = getCentersForDisease(omimId)[0];
  const dx = caseData.confirmedDiagnosisName ?? '';

  // Map disease → tier-1 confirmatory test name + cost (extendable)
  const testFor: Record<string, { name: string; cost: string }> = {
    '230800': { name: 'β-glucocerebrosidase enzyme assay (DBS)', cost: '₹2,500' },
    '253550': { name: 'SMN1 deletion / dosage analysis', cost: '₹4,500' },
    '310200': { name: 'DMD MLPA + sequencing', cost: '₹6,000' },
    '277900': { name: 'Serum ceruloplasmin + 24-hr urinary copper', cost: '₹2,200' },
    '301000': { name: 'WAS gene sequencing', cost: '₹8,000' },
  };
  const tier1 = testFor[omimId] ?? { name: 'Confirmatory genetic test', cost: '₹2,000–6,000' };

  const handleNprdDownload = () => {
    // Pre-filled NPRD application stub — in production would generate a real PDF
    const content = `NATIONAL POLICY FOR RARE DISEASES — APPLICATION FOR FINANCIAL ASSISTANCE\n\n` +
      `Patient: ${caseData.patientSummary}\n` +
      `Confirmed diagnosis: ${dx}\n` +
      `OMIM: ${caseData.confirmedOmimId ?? '—'} · Gene: ${caseData.confirmedGene ?? '—'}\n` +
      `Confirmed by: Dr. Priya Sharma (Treating Physician)\n` +
      `Confirming Centre of Excellence: ${nearestCoE?.shortName ?? '—'}\n` +
      `Confirmation date: ${caseData.confirmedAt ?? '—'}\n` +
      `Case ID: ${caseData.id}\n\n` +
      `Funding requested under NPRD 2021, Group 3 — chronic, lifelong, high-cost therapy.\n` +
      `Maximum support: ₹50 lakh per patient per fiscal year.\n\n` +
      `[Section A — Patient demographics, address, BPL status — to be completed]\n` +
      `[Section B — Treating physician declaration — auto-signed]\n` +
      `[Section C — CoE specialist endorsement — pending]\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NPRD_${caseData.id.slice(0, 8)}_application_draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden rounded-xl"
      style={{ border: '1px solid rgba(160,74,31,0.25)' }}>
      {/* Header */}
      <div className="px-5 py-3"
        style={{ background: 'rgba(160,74,31,0.06)', borderBottom: '1px solid rgba(160,74,31,0.12)' }}>
        <div className="flex items-center gap-2">
          <Sparkles className="size-4" style={{ color: '#A04A1F' }} />
          <span className="text-sm font-semibold" style={{ color: '#0F1828' }}>
            Action package
          </span>
          <span className="text-xs" style={{ color: '#6B7D93' }}>
            — the four moves that close the chain
          </span>
        </div>
      </div>

      {/* 4 action tiles */}
      <div className="grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0"
        style={{ background: '#FBF8F0' }}>
        <ActionTile
          n="01"
          icon={FileText}
          accent="#A04A1F"
          title="NPRD application"
          status="Drafted · ready to review"
          body={`Pre-filled with diagnosis, OMIM ID, gene, and CoE certification. ₹50 lakh ceiling under NPRD 2021. The form most CoE specialists currently fill by hand — already done.`}
          actionLabel="Download draft"
          actionIcon={Download}
          onAction={handleNprdDownload}
        />

        <ActionTile
          n="02"
          icon={FlaskConical}
          accent="#1E2D4A"
          title="Tier-1 confirmatory test"
          status={`${tier1.name} · ${tier1.cost}`}
          body={`Sample collection and shipping protocol routed to the nearest accredited lab. Pre-filled requisition with patient details and clinical indication.`}
          actionLabel="View requisition"
          actionIcon={ExternalLink}
        />

        <ActionTile
          n="03"
          icon={Building2}
          accent="#5C7855"
          title="Centre of Excellence"
          status={nearestCoE ? `${nearestCoE.shortName} · ${nearestCoE.city}, ${nearestCoE.state}` : 'No nearby CoE found'}
          body={
            nearestCoE
              ? `Telemedicine referral pathway active · 48-hour response window. The specialist receives the full Nidaan case packet — diagnosis, AI report, disagreement analysis.`
              : `Twenty Indian states have no NPRD-approved CoE. We surface the next-nearest specialist centre and alternative referral pathway.`
          }
          actionLabel="Open referral"
          actionIcon={ExternalLink}
          actionHref={nearestCoE ? googleMapsDirectionsUrl(nearestCoE) : undefined}
        />

        <ActionTile
          n="04"
          icon={UserPlus}
          accent={inviteSent ? '#5C7855' : '#A04A1F'}
          title="Patient invite"
          status={inviteSent ? 'Invited · plain-language record now visible to patient' : 'Pending'}
          body={
            inviteSent
              ? `The patient sees their diagnosis in plain language, treatment pathway, nearest CoE on a map, NPRD eligibility status, and a real-time thread of their case.`
              : `The patient cannot navigate the system from a hospital portal they don't have access to. The invite gives them an owned record that travels across providers.`
          }
          actionLabel={inviteSent ? 'View patient record' : 'Send invite'}
          actionIcon={inviteSent ? CheckCircle2 : UserPlus}
          onAction={inviteSent ? undefined : onInvite}
          done={inviteSent}
        />
      </div>

      {/* Optional 5th — specialist consult */}
      {!consultSent && (
        <div className="border-t px-5 py-3 flex items-center justify-between"
          style={{ borderColor: 'rgba(160,74,31,0.12)', background: 'rgba(139,108,156,0.04)' }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7D93' }}>
            <MessageSquare className="size-3.5" style={{ color: '#8B6C9C' }} />
            <span>Need specialist input on this case? Route the AI packet to a CoE specialist for asynchronous review.</span>
          </div>
          <button
            onClick={onConsult}
            className="rounded-md px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'rgba(139,108,156,0.12)', color: '#8B6C9C', border: '1px solid rgba(139,108,156,0.3)' }}>
            Request consult
          </button>
        </div>
      )}
    </div>
  );
}

function ActionTile({ n, icon: Icon, accent, title, status, body, actionLabel, actionIcon: ActionIcon, onAction, actionHref, done }: {
  n: string;
  icon: React.ElementType;
  accent: string;
  title: string;
  status: string;
  body: string;
  actionLabel?: string;
  actionIcon?: React.ElementType;
  onAction?: () => void;
  actionHref?: string;
  done?: boolean;
}) {
  const ActionWrapper = actionHref ? 'a' : 'button';
  const actionProps = actionHref
    ? { href: actionHref, target: '_blank', rel: 'noopener noreferrer' }
    : { onClick: onAction };

  return (
    <div className="p-5"
      style={{ borderColor: 'rgba(160,74,31,0.1)' }}>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: accent }}>
          {n}
        </span>
        <Icon className="size-3.5" style={{ color: accent }} />
        <p className="text-sm font-semibold" style={{ color: '#0F1828' }}>{title}</p>
        {done && <CheckCircle2 className="ml-auto size-4" style={{ color: accent }} />}
      </div>
      <p className="text-xs font-medium" style={{ color: accent }}>
        {status}
      </p>
      <p className="mt-2 text-xs leading-relaxed" style={{ color: '#6B7D93' }}>
        {body}
      </p>
      {actionLabel && (onAction || actionHref) && (
        <ActionWrapper
          {...actionProps}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: accent }}>
          {ActionIcon && <ActionIcon className="size-3.5" />}
          {actionLabel}
        </ActionWrapper>
      )}
    </div>
  );
}


// ── Care Pathway Section ─────────────────────────────────────────────────────

function CarePathwaySection({ omimId }: { omimId: string }) {
  const centers = getCentersForDisease(omimId).slice(0, 4);
  const [locating, setLocating] = useState(false);
  const [sorted, setSorted] = useState<WithDistance<TreatmentCenter>[] | null>(null);

  async function locate() {
    setLocating(true);
    try {
      const loc = await getUserLocation();
      setSorted(sortCentersByDistance(centers, loc.lat, loc.lon));
    } catch {
      // geolocation denied — keep static order
    } finally {
      setLocating(false);
    }
  }

  const display = sorted?.map(s => s.item) ?? centers;
  const nearest = display[0];
  const nearestDist = sorted?.[0]?.distanceKm;

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: '1px solid rgba(92,120,85,0.2)' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ background: 'rgba(92,120,85,0.05)', borderBottom: '1px solid rgba(92,120,85,0.1)' }}>
        <div className="flex items-center gap-2">
          <MapPin className="size-4" style={{ color: '#5C7855' }} />
          <span className="text-sm font-semibold" style={{ color: '#0F1828' }}>Care pathway</span>
          <span className="text-xs" style={{ color: '#A0AAB8' }}>— next steps for this patient</span>
        </div>
        <button
          onClick={locate}
          disabled={locating}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ background: 'rgba(92,120,85,0.08)', color: '#5C7855', border: '1px solid rgba(92,120,85,0.2)' }}>
          {locating ? <Loader2 className="size-3 animate-spin" /> : <Navigation className="size-3" />}
          Sort by distance
        </button>
      </div>

      <div className="grid gap-0 lg:grid-cols-2" style={{ borderTop: 'none' }}>
        {/* Left — treatment centres */}
        <div className="p-5" style={{ borderRight: '1px solid rgba(15,24,40,0.06)' }}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B96A8' }}>
            Treatment centres
          </p>

          {nearest && (
            <div className="mb-3 rounded-xl p-4"
              style={{ background: 'rgba(92,120,85,0.05)', border: '1px solid rgba(92,120,85,0.15)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold" style={{ color: '#0F1828' }}>{nearest.shortName}</p>
                  <p className="mt-0.5 text-xs" style={{ color: '#8B96A8' }}>{nearest.city}, {nearest.state}</p>
                  <p className="mt-1.5 text-xs" style={{ color: '#A0AAB8' }}>{nearest.capabilities.slice(0, 2).join(' · ')}</p>
                  {nearest.phone && (
                    <a href={`tel:${nearest.phone}`} className="mt-1 inline-block text-xs" style={{ color: '#A04A1F' }}>
                      {nearest.phone}
                    </a>
                  )}
                </div>
                {nearestDist !== undefined && (
                  <span className="shrink-0 text-sm font-bold" style={{ color: '#5C7855' }}>{formatDistance(nearestDist)}</span>
                )}
              </div>
              <a
                href={googleMapsDirectionsUrl(nearest)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: '#5C7855', color: '#F5EFE3' }}>
                <MapPin className="size-4" />
                Get directions →
              </a>
            </div>
          )}

          <div className="space-y-1.5">
            {display.slice(1, 3).map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.05)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1E2D4A' }}>{c.shortName}</p>
                  <p className="text-xs" style={{ color: '#A0AAB8' }}>{c.city}, {c.state}</p>
                </div>
                <a href={googleMapsDirectionsUrl(c)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(30,45,74,0.1)', color: '#A04A1F', border: '1px solid rgba(30,45,74,0.2)' }}>
                  <ExternalLink className="size-3" /> Directions
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Right — government schemes */}
        <div className="p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B96A8' }}>
            Government funding available
          </p>
          <div className="space-y-2.5">
            {SCHEMES.map(s => (
              <div key={s.shortName} className="rounded-xl p-3"
                style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.06)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: '#0F1828' }}>{s.shortName}</p>
                      <span className="text-xs font-bold" style={{ color: s.color }}>{s.amount}</span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: '#8B96A8' }}>{s.description}</p>
                  </div>
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}35` }}>
                    Apply →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg px-3 py-2 text-xs" style={{ background: 'rgba(184,132,42,0.05)', border: '1px solid rgba(184,132,42,0.15)', color: '#92694A' }}>
            <BadgeIndianRupee className="mr-1 inline size-3.5" style={{ color: '#B8842A' }} />
            NPRD 2021 approval rate is 30%. Filing immediately after diagnosis significantly improves outcomes.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        style={{ background: 'rgba(3,11,24,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{ background: '#FBF8F0', border: '1px solid rgba(30,45,74,0.2)', boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: '#0F1828' }}>{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:bg-black/[0.06]" style={{ color: '#8B96A8' }}>
            <X className="size-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
