'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, FileText, Plus, ChevronRight, Inbox, Loader2, MessageSquarePlus, Stethoscope } from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';
import type { StoredCase, CaseStatus } from '@/lib/store';
import { MissionBanner } from '@/components/workspace/mission-banner';

const STATUS_STYLE: Record<CaseStatus, { color: string; bg: string; label: string; icon: React.ElementType }> = {
  awaiting_doctor_review: { color: '#A04A1F', bg: 'rgba(160,74,31,0.1)', label: 'Patient submission · review needed', icon: Inbox },
  analyzing: { color: '#8B6C9C', bg: 'rgba(139,108,156,0.1)', label: 'AI analyzing', icon: Loader2 },
  draft: { color: '#B8842A', bg: 'rgba(184,132,42,0.1)', label: 'Awaiting confirmation', icon: Clock },
  confirmed: { color: '#5C7855', bg: 'rgba(92,120,85,0.1)', label: 'Confirmed', icon: CheckCircle2 },
  archived: { color: '#8B96A8', bg: 'rgba(107,114,128,0.1)', label: 'Archived', icon: FileText },
};

export default function DoctorCasesPage() {
  const { user, ready } = useMockSession();
  const [cases, setCases] = useState<StoredCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    const userId = user?.id ?? 'u1';
    const load = () =>
      fetch(`/api/cases?createdBy=${userId}`)
        .then(r => r.json())
        .then(data => { setCases(data); setLoading(false); })
        .catch(() => setLoading(false));
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [ready, user]);

  const inbox = cases.filter(c => c.status === 'awaiting_doctor_review');
  const analyzing = cases.filter(c => c.status === 'analyzing');
  const others = cases.filter(c => c.status !== 'awaiting_doctor_review' && c.status !== 'analyzing');
  const confirmed = cases.filter(c => c.status === 'confirmed').length;
  const draft = cases.filter(c => c.status === 'draft').length;

  const renderCaseCard = (c: StoredCase, i: number) => {
    const st = STATUS_STYLE[c.status] ?? STATUS_STYLE.draft;
    const Icon = st.icon;
    const topDx = (c.aiResult as { unified_differential?: { disease_name?: string }[] } | null)
      ?.unified_differential?.[0]?.disease_name;
    const isPatientSubmission = c.submittedBy === 'patient';

    return (
      <motion.div
        key={c.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + i * 0.05 }}>
        <Link
          href={`/doctor/cases/${c.id}`}
          className="group flex items-center gap-5 rounded-xl p-5 transition-colors hover:bg-black/[0.04]"
          style={{
            background: c.status === 'awaiting_doctor_review' ? 'rgba(160,74,31,0.04)' : 'rgba(15,24,40,0.02)',
            border: `1px solid ${c.status === 'awaiting_doctor_review' ? 'rgba(160,74,31,0.2)' : 'rgba(15,24,40,0.06)'}`,
          }}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: st.bg }}>
            <Icon className={`size-5 ${c.status === 'analyzing' ? 'animate-spin' : ''}`} style={{ color: st.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold truncate" style={{ color: '#1E2D4A' }}>{c.patientSummary}</p>
              {isPatientSubmission && (
                <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: 'rgba(92,120,85,0.1)', color: '#5C7855' }}>
                  From patient
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: '#8B96A8' }}>
              <span>#{c.id.slice(0, 8).toUpperCase()}</span>
              <span>·</span>
              <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {c.confirmedDiagnosisName && <><span>·</span><span style={{ color: '#5C7855' }}>{c.confirmedDiagnosisName}</span></>}
              {!c.confirmedDiagnosisName && topDx && <><span>·</span><span style={{ color: '#A04A1F' }}>AI: {topDx}</span></>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: st.bg, color: st.color }}>
              {st.label}
            </span>
            <ChevronRight className="size-4 opacity-40 transition-opacity group-hover:opacity-80" style={{ color: '#6B7D93' }} />
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="px-[5%] py-10">
      <MissionBanner
        eyebrow="Link 01 of the chain · Recognition"
        accent="#A04A1F"
        icon={Stethoscope}
        mission="A 6-specialist case conference, in 5 minutes, at the first visit. The 7-year diagnostic odyssey starts compressing here — before the patient is lost to follow-up."
      />
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
            My Cases
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>
            {loading ? 'Loading…' : `${cases.length} cases · ${confirmed} confirmed${inbox.length > 0 ? ` · ${inbox.length} from patients` : ''}`}
          </p>
        </div>
        <Link
          href="/analyze"
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #1E2D4A, #5C7855)', color: '#F5EFE3' }}>
          <Plus className="size-4" />
          Run new analysis
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Patient inbox', value: inbox.length, color: '#A04A1F' },
          { label: 'Analyzing', value: analyzing.length, color: '#8B6C9C' },
          { label: 'Awaiting confirm', value: draft, color: '#B8842A' },
          { label: 'Confirmed', value: confirmed, color: '#5C7855' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl p-4"
            style={{ background: 'rgba(15,24,40,0.03)', border: '1px solid rgba(15,24,40,0.07)' }}>
            <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="mt-0.5 text-xs" style={{ color: '#8B96A8' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Patient inbox */}
      {inbox.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquarePlus className="size-4" style={{ color: '#A04A1F' }} />
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#A04A1F' }}>
              Patient inbox · needs your review
            </h2>
          </div>
          <div className="space-y-3">
            {inbox.map((c, i) => renderCaseCard(c, i))}
          </div>
        </div>
      )}

      {/* Analyzing */}
      {analyzing.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" style={{ color: '#8B6C9C' }} />
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#8B6C9C' }}>
              AI analyzing
            </h2>
          </div>
          <div className="space-y-3">
            {analyzing.map((c, i) => renderCaseCard(c, i))}
          </div>
        </div>
      )}

      {/* Other cases */}
      {others.length > 0 && (
        <div>
          {(inbox.length > 0 || analyzing.length > 0) && (
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: '#6B7D93' }}>
              All cases
            </h2>
          )}
          <div className="space-y-3">
            {others.map((c, i) => renderCaseCard(c, i))}
          </div>
        </div>
      )}

      {!loading && cases.length === 0 && (
        <div className="mt-16 mx-auto max-w-xl rounded-2xl p-10 text-center"
          style={{ background: 'rgba(160,74,31,0.04)', border: '1px solid rgba(160,74,31,0.2)' }}>
          <FileText className="mx-auto mb-4 size-10 opacity-50" style={{ color: '#A04A1F' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
            Every case here is a chain you&apos;re holding together.
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#6B7D93' }}>
            Submit a case from the analyse tool, or wait for a patient submission to land in your inbox.
            The first time you confirm a rare-disease diagnosis here, an NPRD application,
            a lab requisition, and a treatment-centre referral are all waiting in the same report.
          </p>
          <Link
            href="/analyze"
            className="mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#0F1828', color: '#F5EFE3', boxShadow: '2px 2px 0 rgba(160,74,31,0.3)' }}>
            <Plus className="size-4" />
            Run your first analysis
          </Link>
        </div>
      )}
    </div>
  );
}
