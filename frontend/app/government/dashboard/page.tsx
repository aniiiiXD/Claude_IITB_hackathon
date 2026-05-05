'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, AlertTriangle, TrendingUp, MapPin, Clock, Activity, ExternalLink, Building2, BarChart3 } from 'lucide-react';
import { MOCK_GOV_STATS } from '@/lib/mock-data';
import { CENTERS } from '@/lib/centers';
import { googleMapsDirectionsUrl } from '@/lib/geolocation';
import { MissionBanner } from '@/components/workspace/mission-banner';

const CATEGORY_COLORS: Record<string, string> = {
  Metabolic: '#1E2D4A',
  Neurogenetic: '#8B6C9C',
  Immunologic: '#5C7855',
};

type GovStats = typeof MOCK_GOV_STATS;

export default function GovernmentDashboardPage() {
  const [downloaded, setDownloaded] = useState(false);
  const [stats, setStats] = useState<GovStats>(MOCK_GOV_STATS);

  useEffect(() => {
    fetch('/api/government/stats')
      .then(r => r.json())
      .then((data: Partial<GovStats>) => {
        setStats(prev => ({
          ...prev,
          ...data,
          byCategory: { ...prev.byCategory, ...(data.byCategory ?? {}) },
          byState: data.byState?.length ? data.byState : prev.byState,
          diagnosticDelay: {
            medianDays: data.diagnosticDelay?.medianDays ?? prev.diagnosticDelay.medianDays,
            byDisease: data.diagnosticDelay?.byDisease?.length
              ? data.diagnosticDelay.byDisease
              : prev.diagnosticDelay.byDisease,
          },
          treatmentAccessGap: {
            noCoECount: data.treatmentAccessGap?.noCoECount ?? prev.treatmentAccessGap.noCoECount,
            noCoEStates: data.treatmentAccessGap?.noCoEStates?.length
              ? data.treatmentAccessGap.noCoEStates
              : prev.treatmentAccessGap.noCoEStates,
          },
          quarterlyTrend: data.quarterlyTrend?.length ? data.quarterlyTrend : prev.quarterlyTrend,
        }));
      })
      .catch(() => {});
  }, []);

  const downloadCSV = () => {
    const rows = [
      ['Disease category', 'State', 'Quarter', 'Confirmed cases', 'Median diagnostic delay (days)'],
      ...stats.byState.map(s => ['Metabolic', s.state, 'Q1 2026', s.count, '']),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rarecouncil_aggregate_Q1_2026.csv';
    a.click();
    setDownloaded(true);
  };

  return (
    <div className="px-[5%] py-10">
      <MissionBanner
        eyebrow="The registry NPRD 2021 mandated"
        accent="#B8842A"
        icon={BarChart3}
        mission="A national rare-disease registry that does not effectively function under NPRD 2021 — generated here as a side effect of clinical care, not as a separate data-collection exercise. Aggregate by construction. Anonymised by design."
      />
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8842A' }}>
            Ministry of Health and Family Welfare
          </p>
          <h1 className="text-3xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
            National Rare Disease Registry
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>
            Aggregate epidemiology · Rolling 12 months · Last updated: 1 May 2026
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: downloaded ? 'rgba(92,120,85,0.1)' : 'rgba(184,132,42,0.1)',
            border: `1px solid ${downloaded ? 'rgba(92,120,85,0.3)' : 'rgba(184,132,42,0.3)'}`,
            color: downloaded ? '#5C7855' : '#B8842A',
          }}>
          <Download className="size-4" />
          {downloaded ? 'Downloaded' : 'Export CSV'}
        </button>
      </div>

      {/* Top stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Confirmed cases (12 mo)', value: stats.totalConfirmed, color: '#B8842A', sub: 'All rare diseases' },
          { label: 'Metabolic', value: stats.byCategory.Metabolic, color: '#1E2D4A', sub: 'Gaucher, Pompe, Wilson…' },
          { label: 'Neurogenetic', value: stats.byCategory.Neurogenetic, color: '#8B6C9C', sub: 'SMA, DMD, HD…' },
          { label: 'Immunologic', value: stats.byCategory.Immunologic, color: '#5C7855', sub: 'WAS, CVID, HLH…' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-xl p-4"
            style={{ background: 'rgba(15,24,40,0.03)', border: '1px solid rgba(15,24,40,0.07)' }}>
            <p className="text-4xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="mt-1 text-sm font-medium" style={{ color: '#2D4060' }}>{s.label}</p>
            <p className="mt-0.5 text-xs" style={{ color: '#A0AAB8' }}>{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Geographic distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-5"
          style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="size-4" style={{ color: '#B8842A' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#0F1828' }}>Geographic distribution</h2>
          </div>
          <div className="space-y-3">
            {stats.byState.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-28 text-sm" style={{ color: '#4A5D7A' }}>{s.state}</span>
                <div className="flex-1 overflow-hidden rounded-full" style={{ height: 8, background: 'rgba(15,24,40,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.count / stats.totalConfirmed) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.04, duration: 0.7 }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #B8842A, #1E2D4A)' }}
                  />
                </div>
                <span className="w-6 text-right text-sm font-bold" style={{ color: '#B8842A' }}>{s.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Diagnostic delay */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl p-5"
          style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="size-4" style={{ color: '#1E2D4A' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#0F1828' }}>Diagnostic delay</h2>
          </div>
          <div
            className="mb-4 rounded-xl p-3 text-center"
            style={{ background: 'rgba(30,45,74,0.07)', border: '1px solid rgba(30,45,74,0.15)' }}>
            <p className="text-3xl font-bold" style={{ color: '#1E2D4A' }}>
              {stats.diagnosticDelay.medianDays}
            </p>
            <p className="mt-0.5 text-sm" style={{ color: '#6B7D93' }}>median days, symptom onset → Nidaan analysis</p>
          </div>
          <div className="space-y-2.5">
            {stats.diagnosticDelay.byDisease.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span style={{ color: '#4A5D7A' }}>{d.disease}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full" style={{ background: 'rgba(15,24,40,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((d.days / 400) * 100, 100)}%` }}
                      transition={{ delay: 0.35 + i * 0.04, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: d.days > 250 ? '#A04A1F' : d.days > 180 ? '#B8842A' : '#5C7855' }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono font-semibold" style={{ color: d.days > 250 ? '#A04A1F' : d.days > 180 ? '#B8842A' : '#5C7855' }}>
                    {d.days}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Treatment access gap */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl p-5"
          style={{
            background: 'rgba(160,74,31,0.05)',
            border: '1px solid rgba(160,74,31,0.2)',
          }}>
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="size-4" style={{ color: '#A04A1F' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#0F1828' }}>Treatment access gap</h2>
          </div>
          <div
            className="mb-4 rounded-xl p-4 text-center"
            style={{ background: 'rgba(160,74,31,0.08)', border: '1px solid rgba(160,74,31,0.15)' }}>
            <p className="text-4xl font-bold" style={{ color: '#A04A1F' }}>
              {stats.treatmentAccessGap.noCoECount}
            </p>
            <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>
              confirmed patients in states with <strong>no Centre of Excellence</strong> for their disease category
            </p>
          </div>
          <div className="space-y-2">
            {stats.treatmentAccessGap.noCoEStates.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(15,24,40,0.03)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1E2D4A' }}>{s.state}</p>
                  <p className="text-xs" style={{ color: '#8B96A8' }}>{s.disease}</p>
                </div>
                <span className="text-2xl font-bold" style={{ color: '#A04A1F' }}>{s.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quarterly trend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl p-5"
          style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-4" style={{ color: '#5C7855' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#0F1828' }}>Quarterly trend</h2>
          </div>
          <div className="flex h-40 items-end gap-4">
            {stats.quarterlyTrend.map((q, i) => {
              const max = Math.max(...stats.quarterlyTrend.map(x => x.confirmed));
              const pct = (q.confirmed / max) * 100;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: '#5C7855' }}>{q.confirmed}</span>
                  <div className="relative w-full overflow-hidden rounded-t-lg" style={{ height: `${pct}%`, background: 'rgba(92,120,85,0.08)', border: '1px solid rgba(92,120,85,0.2)' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ delay: 0.4 + i * 0.07, duration: 0.6 }}
                      className="absolute bottom-0 w-full rounded-t-lg"
                      style={{ background: 'linear-gradient(to top, #5C785540, transparent)' }}
                    />
                  </div>
                  <span className="text-center text-xs" style={{ color: '#A0AAB8' }}>{q.quarter}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-center" style={{ color: '#A0AAB8' }}>
            Confirmed cases per quarter — 3× growth over 12 months
          </p>
        </motion.div>
      </div>

      {/* CoE Network */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(30,45,74,0.2)' }}>
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'rgba(30,45,74,0.05)', borderBottom: '1px solid rgba(30,45,74,0.1)' }}>
          <div className="flex items-center gap-2">
            <Building2 className="size-4" style={{ color: '#1E2D4A' }} />
            <h2 className="text-sm font-semibold" style={{ color: '#0F1828' }}>
              Centre of Excellence network
            </h2>
            <span className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ background: 'rgba(30,45,74,0.12)', color: '#A04A1F' }}>
              {CENTERS.filter(c => c.nprdApproved).length} NPRD-approved · {CENTERS.filter(c => !c.nprdApproved).length} specialist
            </span>
          </div>
          <span className="text-xs" style={{ color: '#A0AAB8' }}>NPRD 2021 · MoHFW</span>
        </div>

        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ background: 'rgba(15,24,40,0.04)' }}>
          {CENTERS.filter(c => c.nprdApproved || c.type === 'specialist').map((c, i) => (
            <div key={c.id} className="flex items-start justify-between gap-3 p-4"
              style={{ background: '#F5EFE3' }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: c.nprdApproved ? '#5C7855' : '#B8842A' }}
                  />
                  <p className="text-sm font-medium truncate" style={{ color: '#1E2D4A' }}>{c.shortName}</p>
                </div>
                <p className="mt-0.5 text-xs" style={{ color: '#A0AAB8' }}>{c.city}, {c.state}</p>
                <p className="mt-1 text-xs truncate" style={{ color: '#A0AAB8' }}>
                  {c.capabilities.slice(0, 2).join(' · ')}
                </p>
              </div>
              <a href={googleMapsDirectionsUrl(c)} target="_blank" rel="noopener noreferrer"
                className="shrink-0 rounded-lg p-1.5 transition-opacity hover:opacity-80"
                style={{ background: 'rgba(30,45,74,0.08)', color: '#A04A1F' }}>
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 px-5 py-3 text-xs"
          style={{ background: 'rgba(30,45,74,0.03)', borderTop: '1px solid rgba(30,45,74,0.08)', color: '#A0AAB8' }}>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-teal-400" style={{ background: '#5C7855' }} />
            NPRD 2021 approved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: '#B8842A' }} />
            Specialist centre
          </span>
          <span className="ml-auto">
            States without CoE: <span style={{ color: '#A04A1F' }}>Bihar, Jharkhand, NE states</span>
          </span>
        </div>
      </motion.div>

      {/* Footer note */}
      <div
        className="mt-8 rounded-xl p-4 text-xs leading-relaxed"
        style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.06)', color: '#A0AAB8' }}>
        <Activity className="mr-1.5 inline size-3.5" style={{ color: '#8B96A8' }} />
        All data is aggregate and anonymised. No individual patient data is accessible at any government route.
        Minimum granularity: disease category + state + quarter. Geographic detail is state-level only in MVP.
        Data refreshes every 24 hours.
      </div>
    </div>
  );
}
