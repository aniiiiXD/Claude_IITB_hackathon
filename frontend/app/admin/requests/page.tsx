'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardCheck, CheckCircle2, XCircle } from 'lucide-react';
import type { StoredResearchRequest } from '@/lib/store';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<StoredResearchRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/research/requests')
      .then(r => r.json())
      .then(data => { setRequests(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const res = await fetch(`/api/research/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
    }
  };

  return (
    <div className="px-[5%] py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
          Research Requests
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>
          {loading ? 'Loading…' : `${requests.filter(r => r.status === 'pending').length} pending review`}
        </p>
      </div>

      <div className="space-y-4">
        {requests.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold" style={{ color: '#1E2D4A' }}>{r.queryDiseaseName}</p>
                <p className="text-xs" style={{ color: '#8B96A8' }}>
                  {r.institution} · IRB: {r.irbReference} · {r.matchedCount} patients matched
                </p>
              </div>
              <div className="flex items-center gap-2">
                {r.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => updateStatus(r.id, 'approved')}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
                      style={{ background: 'rgba(92,120,85,0.1)', border: '1px solid rgba(92,120,85,0.3)', color: '#5C7855' }}>
                      <CheckCircle2 className="size-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, 'rejected')}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
                      style={{ background: 'rgba(160,74,31,0.1)', border: '1px solid rgba(160,74,31,0.3)', color: '#A04A1F' }}>
                      <XCircle className="size-3.5" /> Reject
                    </button>
                  </>
                ) : (
                  <span
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      background: r.status === 'approved' ? 'rgba(92,120,85,0.1)' : 'rgba(160,74,31,0.1)',
                      color: r.status === 'approved' ? '#5C7855' : '#A04A1F',
                    }}>
                    {r.status === 'approved' ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                    {r.status === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm" style={{ color: '#6B7D93' }}>{r.purpose}</p>
            <p className="mt-2 text-xs" style={{ color: '#A0AAB8' }}>Data fields: {r.dataFieldsRequested}</p>
          </motion.div>
        ))}

        {!loading && requests.length === 0 && (
          <div className="mt-16 mx-auto max-w-xl rounded-2xl p-10 text-center"
            style={{ background: 'rgba(92,120,85,0.05)', border: '1px solid rgba(92,120,85,0.2)' }}>
            <ClipboardCheck className="mx-auto mb-4 size-10 opacity-60" style={{ color: '#5C7855' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
              No research requests in the queue.
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#6B7D93' }}>
              Researchers querying the consented cohort submit formal data requests here.
              Review the IRB documentation, the requested data fields, and approve only
              what the patient consent supports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
