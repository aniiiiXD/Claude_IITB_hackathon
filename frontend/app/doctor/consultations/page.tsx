'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, ChevronRight, MessageSquare } from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';
import type { StoredConsultation } from '@/lib/store';

const MOCK_USERS: Record<string, { name: string; institution: string }> = {
  u1: { name: 'Dr. Priya Nair', institution: 'Apollo Hospitals, Ahmedabad' },
  u2: { name: 'Dr. Rajesh Mehra', institution: 'AIIMS New Delhi' },
  sp2: { name: 'Dr. Sheela Nampoori', institution: 'CMC Vellore' },
  sp3: { name: 'Dr. Arun Bhatt', institution: 'KEM Mumbai' },
  sp4: { name: 'Dr. Pooja Dewan', institution: 'AIIMS Delhi' },
};

type ConsultWithCase = StoredConsultation & {
  case: { id: string; patientSummary: string; confirmedDiagnosisName: string | null } | null;
};

export default function ConsultationsPage() {
  const { user, ready } = useMockSession();
  const [consults, setConsults] = useState<ConsultWithCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    const userId = user?.id ?? 'u1';
    const role = user?.role;
    const param = role === 'specialist' ? `specialistId=${userId}` : `requestingDoctorId=${userId}`;
    fetch(`/api/consultations?${param}`)
      .then(r => r.json())
      .then(data => { setConsults(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [ready, user]);

  return (
    <div className="px-[5%] py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
          Consultations
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>
          {loading ? 'Loading…' : `${consults.length} consultation${consults.length !== 1 ? 's' : ''} · ${consults.filter(c => c.status === 'pending').length} pending`}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total', value: consults.length, color: '#8B6C9C' },
          { label: 'Pending review', value: consults.filter(c => c.status === 'pending').length, color: '#B8842A' },
          { label: 'Completed', value: consults.filter(c => c.status === 'completed').length, color: '#5C7855' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl p-4"
            style={{ background: 'rgba(15,24,40,0.03)', border: '1px solid rgba(15,24,40,0.07)' }}>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="mt-0.5 text-xs" style={{ color: '#8B96A8' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {consults.map((c, i) => {
          const requestingDoctor = MOCK_USERS[c.requestingDoctorId];
          const isPending = c.status === 'pending';

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}>
              <Link
                href={`/doctor/consultations/${c.id}`}
                className="group flex items-center gap-5 rounded-xl p-5 transition-colors hover:bg-black/[0.04]"
                style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.06)' }}>
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: isPending ? 'rgba(184,132,42,0.1)' : 'rgba(92,120,85,0.1)' }}>
                  {isPending
                    ? <Clock className="size-5" style={{ color: '#B8842A' }} />
                    : <CheckCircle2 className="size-5" style={{ color: '#5C7855' }} />}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold" style={{ color: '#1E2D4A' }}>
                    {c.case?.confirmedDiagnosisName ?? c.case?.patientSummary ?? 'Case'}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: '#8B96A8' }}>
                    From {requestingDoctor?.name ?? 'Unknown'} · {requestingDoctor?.institution ?? ''} ·{' '}
                    {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  {c.requestNote && (
                    <p className="mt-1 text-xs italic truncate" style={{ color: '#8B96A8' }}>
                      "{c.requestNote}"
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      background: isPending ? 'rgba(184,132,42,0.1)' : 'rgba(92,120,85,0.1)',
                      color: isPending ? '#B8842A' : '#5C7855',
                    }}>
                    {isPending ? 'Pending' : 'Completed'}
                  </span>
                  <ChevronRight className="size-4 opacity-40 group-hover:opacity-80" style={{ color: '#6B7D93' }} />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {!loading && consults.length === 0 && (
        <div className="mt-16 mx-auto max-w-xl rounded-2xl p-10 text-center"
          style={{ background: 'rgba(139,108,156,0.05)', border: '1px solid rgba(139,108,156,0.2)' }}>
          <MessageSquare className="mx-auto mb-4 size-10 opacity-60" style={{ color: '#8B6C9C' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
            No consults waiting on you.
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#6B7D93' }}>
            When a GP routes a case to you for specialist input, it lands here with the full
            Nidaan packet — patient text, AI differential, and the disagreement analysis.
            One specialist can multiply their reach 20-fold without leaving their desk.
          </p>
        </div>
      )}
    </div>
  );
}
