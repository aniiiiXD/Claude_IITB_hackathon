'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, XCircle, Package } from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';
import type { StoredResearchRequest } from '@/lib/store';

const STATUS_STYLE = {
  pending: { color: '#B8842A', bg: 'rgba(184,132,42,0.1)', label: 'Pending review', icon: Clock },
  approved: { color: '#5C7855', bg: 'rgba(92,120,85,0.1)', label: 'Approved', icon: CheckCircle2 },
  rejected: { color: '#A04A1F', bg: 'rgba(160,74,31,0.1)', label: 'Rejected', icon: XCircle },
  data_released: { color: '#8B6C9C', bg: 'rgba(139,108,156,0.1)', label: 'Data released', icon: Package },
};

export default function ResearchRequestsPage() {
  const { user, ready } = useMockSession();
  const [requests, setRequests] = useState<StoredResearchRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    const researcherId = user?.id ?? 'u5';
    fetch(`/api/research/requests?researcherId=${researcherId}`)
      .then(r => r.json())
      .then(data => { setRequests(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [ready, user]);

  return (
    <div className="px-[5%] py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
          My Research Requests
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>
          {loading ? 'Loading…' : `${requests.length} submitted · ${requests.filter(r => r.status === 'approved').length} approved`}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Submitted', value: requests.length, color: '#A04A1F' },
          { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: '#5C7855' },
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: '#B8842A' },
          { label: 'Data released', value: requests.filter(r => r.status === 'data_released').length, color: '#8B6C9C' },
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

      {/* Requests */}
      <div className="space-y-4">
        {requests.map((r, i) => {
          const st = STATUS_STYLE[r.status];
          const Icon = st.icon;

          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className="rounded-xl p-5"
              style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
              {/* Header row */}
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold" style={{ color: '#1E2D4A' }}>{r.queryDiseaseName}</p>
                    {r.queryGene && (
                      <span className="rounded px-1.5 py-0.5 font-mono text-xs" style={{ background: 'rgba(30,45,74,0.1)', color: '#A04A1F' }}>
                        {r.queryGene}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs" style={{ color: '#A0AAB8' }}>
                    OMIM {r.queryOmimId} · {r.queryState ?? 'All India'} ·{' '}
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="flex size-8 items-center justify-center rounded-xl"
                    style={{ background: st.bg }}>
                    <Icon className="size-4" style={{ color: st.color }} />
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="mb-0.5 text-xs uppercase tracking-wider" style={{ color: '#A0AAB8' }}>Matched cohort</p>
                  <p className="text-2xl font-bold" style={{ color: '#A04A1F' }}>{r.matchedCount}</p>
                  <p className="text-xs" style={{ color: '#8B96A8' }}>patients at query time</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="mb-0.5 text-xs uppercase tracking-wider" style={{ color: '#A0AAB8' }}>Purpose</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#4A5D7A' }}>{r.purpose}</p>
                </div>
              </div>

              {/* IRB + data fields */}
              <div className="mt-3 flex flex-wrap gap-4 border-t pt-3 text-xs" style={{ borderColor: 'rgba(15,24,40,0.06)', color: '#8B96A8' }}>
                <span>IRB: <span style={{ color: '#6B7D93' }}>{r.irbReference}</span></span>
                <span>·</span>
                <span>Data: <span style={{ color: '#6B7D93' }}>{r.dataFieldsRequested}</span></span>
              </div>

              {r.adminNotes && (
                <div
                  className="mt-3 rounded-lg px-3 py-2 text-xs"
                  style={{ background: 'rgba(92,120,85,0.05)', color: '#6B7D93' }}>
                  Admin note: {r.adminNotes}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
