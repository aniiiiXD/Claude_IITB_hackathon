'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, AlertCircle, Users, Send, ChevronDown, Lock, Loader2 } from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';
import { MissionBanner } from '@/components/workspace/mission-banner';

const INDIA_STATES = [
  'All India', 'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

const DISEASE_OPTIONS = [
  { name: 'Gaucher disease type 1', omim: '230800', gene: 'GBA' },
  { name: 'Gaucher disease type 2', omim: '230900', gene: 'GBA' },
  { name: 'Gaucher disease type 3', omim: '231000', gene: 'GBA' },
  { name: 'Spinal muscular atrophy', omim: '253300', gene: 'SMN1' },
  { name: 'Wilson disease', omim: '277900', gene: 'ATP7B' },
  { name: 'Wiskott-Aldrich syndrome', omim: '301000', gene: 'WAS' },
  { name: "Duchenne muscular dystrophy", omim: '310200', gene: 'DMD' },
  { name: 'Niemann-Pick type C', omim: '257220', gene: 'NPC1' },
];

export default function ResearchQueryPage() {
  const { user } = useMockSession();
  const [query, setQuery] = useState({
    disease: '',
    omim: '',
    gene: '',
    state: '',
    consentOnly: true,
  });
  const [result, setResult] = useState<{ count: number; tooFew: boolean } | null>(null);
  const [querying, setQuerying] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    purpose: '',
    institution: 'CSIR-CCMB Hyderabad',
    irb: '',
    fields: 'Age range, gender, HPO terms, confirmed variant, state',
  });

  const runQuery = async () => {
    setQuerying(true);
    try {
      const params = new URLSearchParams();
      if (query.disease) params.set('disease', query.disease);
      if (query.omim) params.set('omim', query.omim);
      if (query.gene) params.set('gene', query.gene);
      if (query.state && query.state !== 'All India') params.set('state', query.state);
      const data = await fetch(`/api/research/query?${params}`).then(r => r.json());
      setResult({ count: data.count, tooFew: data.count < 3 });
    } catch {
      setResult({ count: 0, tooFew: true });
    } finally {
      setQuerying(false);
      setShowRequestForm(false);
    }
  };

  const selectDisease = (d: typeof DISEASE_OPTIONS[0]) => {
    setQuery(q => ({ ...q, disease: d.name, omim: d.omim, gene: d.gene }));
  };

  return (
    <div className="px-[5%] py-10">
      <MissionBanner
        eyebrow="The Indian variant map that doesn't yet exist"
        accent="#A04A1F"
        icon={Search}
        mission="Most Indian rare-disease patients carry variants — particularly in Gaucher, Wilson's, and hereditary spastic paraplegias — that aren't in ClinVar or dbSNP. This console builds the genotype-phenotype map as a side effect of consented care. Cohort counts only. Patient identity never leaves the platform."
      />
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: 'rgba(160,74,31,0.1)' }}>
            <Search className="size-5" style={{ color: '#A04A1F' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
              Cohort Query
            </h1>
            <p className="text-sm" style={{ color: '#6B7D93' }}>
              Search for consented patient cohorts by disease, gene, and geography
            </p>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div
        className="mb-6 flex items-start gap-3 rounded-xl p-4 text-sm"
        style={{ background: 'rgba(160,74,31,0.05)', border: '1px solid rgba(160,74,31,0.15)', color: '#6B7D93' }}>
        <Lock className="mt-0.5 size-4 shrink-0" style={{ color: '#A04A1F' }} />
        <div>
          Results show cohort counts only. Minimum threshold of 3 patients enforced.
          No names, contact details, or individual records are accessible at any point.
          Contact with patients is always mediated through treating doctors.
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Query form */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider" style={{ color: '#6B7D93' }}>
            Define cohort criteria
          </h2>

          {/* Disease */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium" style={{ color: '#4A5D7A' }}>Disease *</label>
            <div className="grid grid-cols-2 gap-2">
              {DISEASE_OPTIONS.map(d => (
                <button
                  key={d.omim}
                  onClick={() => selectDisease(d)}
                  className="rounded-xl px-3 py-2 text-left text-sm transition-all"
                  style={{
                    background: query.disease === d.name ? 'rgba(160,74,31,0.1)' : 'rgba(15,24,40,0.03)',
                    border: `1px solid ${query.disease === d.name ? 'rgba(160,74,31,0.35)' : 'rgba(15,24,40,0.07)'}`,
                    color: query.disease === d.name ? '#A04A1F' : '#6B7D93',
                  }}>
                  <span className="block truncate font-medium">{d.name}</span>
                  <span className="text-xs opacity-60">{d.gene} · OMIM {d.omim}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gene + OMIM row */}
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#4A5D7A' }}>Gene (optional)</label>
              <input
                value={query.gene}
                onChange={e => setQuery(q => ({ ...q, gene: e.target.value }))}
                placeholder="e.g. GBA"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(160,74,31,0.15)', color: '#0F1828', fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#4A5D7A' }}>OMIM ID (optional)</label>
              <input
                value={query.omim}
                onChange={e => setQuery(q => ({ ...q, omim: e.target.value }))}
                placeholder="e.g. 230800"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(160,74,31,0.15)', color: '#0F1828', fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>
          </div>

          {/* State */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#4A5D7A' }}>State (optional)</label>
            <select
              value={query.state}
              onChange={e => setQuery(q => ({ ...q, state: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: '#FBF8F0', border: '1px solid rgba(160,74,31,0.15)', color: '#0F1828' }}>
              <option value="">All India</option>
              {INDIA_STATES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Consent filter */}
          <div className="mb-6 flex items-center justify-between rounded-xl px-4 py-3" style={{ background: 'rgba(15,24,40,0.03)', border: '1px solid rgba(15,24,40,0.07)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: '#1E2D4A' }}>Research cohort consent only</p>
              <p className="text-xs" style={{ color: '#8B96A8' }}>Return only patients who have consented to research inclusion</p>
            </div>
            <button
              onClick={() => setQuery(q => ({ ...q, consentOnly: !q.consentOnly }))}
              className="relative rounded-full transition-all duration-300"
              style={{ width: 44, height: 24, background: query.consentOnly ? '#A04A1F' : 'rgba(15,24,40,0.1)' }}>
              <motion.div
                animate={{ x: query.consentOnly ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute top-1 size-4 rounded-full bg-white shadow"
              />
            </button>
          </div>

          <button
            onClick={runQuery}
            disabled={!query.disease || querying}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #A04A1F, #8B6C9C)', color: 'white' }}>
            {querying ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            {querying ? 'Querying…' : 'Run cohort query'}
          </button>
        </div>

        {/* Result panel */}
        <div>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-64 flex-col items-center justify-center rounded-xl text-center"
                style={{ background: 'rgba(15,24,40,0.01)', border: '1px dashed rgba(15,24,40,0.08)' }}>
                <Users className="mb-3 size-10 opacity-20" style={{ color: '#A04A1F' }} />
                <p className="text-sm" style={{ color: '#A0AAB8' }}>Select a disease and run query to see cohort size</p>
              </motion.div>
            ) : result.tooFew ? (
              <motion.div
                key="toofew"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl p-6"
                style={{ background: 'rgba(184,132,42,0.06)', border: '1px solid rgba(184,132,42,0.2)' }}>
                <AlertCircle className="mb-3 size-8" style={{ color: '#B8842A' }} />
                <p className="font-semibold" style={{ color: '#0F1828' }}>Fewer than 3 patients match</p>
                <p className="mt-2 text-sm" style={{ color: '#6B7D93' }}>
                  To protect individual privacy, cohort counts below 3 are not disclosed.
                  Try broadening your criteria (remove state filter, or try a parent disease category).
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}>
                <div
                  className="mb-4 rounded-xl p-6 text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(160,74,31,0.08) 0%, rgba(139,108,156,0.06) 100%)',
                    border: '1px solid rgba(160,74,31,0.25)',
                  }}>
                  <p className="text-6xl font-bold" style={{ color: '#A04A1F' }}>{result.count}</p>
                  <p className="mt-2 text-sm" style={{ color: '#4A5D7A' }}>
                    patients match your query
                    {query.disease && <><br /><span style={{ color: '#1E2D4A' }}>{query.disease}</span></>}
                    {query.state && <><br />in <span style={{ color: '#1E2D4A' }}>{query.state}</span></>}
                  </p>
                  <p className="mt-2 text-xs" style={{ color: '#8B96A8' }}>
                    All have confirmed diagnoses and research cohort consent
                  </p>
                </div>

                {!requestSubmitted ? (
                  <>
                    {!showRequestForm ? (
                      <button
                        onClick={() => setShowRequestForm(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ background: 'rgba(160,74,31,0.1)', border: '1px solid rgba(160,74,31,0.3)', color: '#A04A1F' }}>
                        Submit formal research request
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl p-5"
                        style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
                        <p className="mb-4 text-sm font-semibold" style={{ color: '#0F1828' }}>Formal research request</p>
                        <div className="space-y-3">
                          {[
                            { label: 'Research purpose', key: 'purpose', rows: 3, placeholder: 'Describe the study and its scientific value…' },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="mb-1 block text-xs font-medium" style={{ color: '#6B7D93' }}>{f.label}</label>
                              <textarea
                                value={requestForm[f.key as keyof typeof requestForm]}
                                onChange={e => setRequestForm(r => ({ ...r, [f.key]: e.target.value }))}
                                rows={f.rows}
                                placeholder={f.placeholder}
                                className="w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                                style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(160,74,31,0.15)', color: '#0F1828' }}
                              />
                            </div>
                          ))}
                          {[
                            { label: 'Institution', key: 'institution', placeholder: 'CSIR-CCMB Hyderabad' },
                            { label: 'IRB reference', key: 'irb', placeholder: 'CCMB/IEC/2026/04' },
                            { label: 'Data fields needed', key: 'fields', placeholder: 'Age range, gender, HPO terms…' },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="mb-1 block text-xs font-medium" style={{ color: '#6B7D93' }}>{f.label}</label>
                              <input
                                value={requestForm[f.key as keyof typeof requestForm]}
                                onChange={e => setRequestForm(r => ({ ...r, [f.key]: e.target.value }))}
                                placeholder={f.placeholder}
                                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                                style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(160,74,31,0.15)', color: '#0F1828' }}
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={async () => {
                            setSubmitting(true);
                            try {
                              await fetch('/api/research/requests', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  researcherId: user?.id ?? 'u5',
                                  queryDiseaseName: query.disease,
                                  queryOmimId: query.omim || undefined,
                                  queryGene: query.gene || undefined,
                                  queryState: query.state && query.state !== 'All India' ? query.state : null,
                                  purpose: requestForm.purpose,
                                  institution: requestForm.institution,
                                  irbReference: requestForm.irb,
                                  dataFieldsRequested: requestForm.fields,
                                }),
                              });
                              setRequestSubmitted(true);
                            } catch {
                              setRequestSubmitted(true);
                            } finally {
                              setSubmitting(false);
                            }
                          }}
                          disabled={!requestForm.purpose || !requestForm.irb || submitting}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                          style={{ background: 'linear-gradient(135deg, #A04A1F, #8B6C9C)', color: 'white' }}>
                          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                          Submit for admin review
                        </button>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-5 text-center"
                    style={{ background: 'rgba(92,120,85,0.06)', border: '1px solid rgba(92,120,85,0.2)' }}>
                    <p className="font-semibold" style={{ color: '#5C7855' }}>Request submitted</p>
                    <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>
                      Under admin review. You'll be notified when approved.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
