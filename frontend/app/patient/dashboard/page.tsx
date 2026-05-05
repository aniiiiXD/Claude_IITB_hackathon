'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  CheckCircle2, FileText, MessageSquare, Shield,
  Stethoscope, Mail, MapPin, ExternalLink, Navigation,
  Loader2, FlaskConical, BadgeIndianRupee
} from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';
import { DEMO_CASES } from '@/lib/demo-cases';
import type { StoredCase, StoredTimelineEvent, StoredConsultation } from '@/lib/store';
import { MissionBanner } from '@/components/workspace/mission-banner';
import { PipelineTrackerCompact } from '@/components/case/pipeline-tracker';
import { getCentersForDisease, TreatmentCenter } from '@/lib/centers';
import {
  getUserLocation, sortCentersByDistance, googleMapsDirectionsUrl,
  formatDistance, getNearbyLabs, NearbyLab, WithDistance
} from '@/lib/geolocation';
import { SCHEMES } from '@/lib/schemes';

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  case_created: FileText,
  diagnosis_confirmed: CheckCircle2,
  patient_invited: Mail,
  consult_requested: MessageSquare,
  consult_completed: Stethoscope,
  consent_updated: Shield,
};

const TIMELINE_COLORS: Record<string, string> = {
  case_created: '#1E2D4A',
  diagnosis_confirmed: '#5C7855',
  patient_invited: '#1E2D4A',
  consult_requested: '#8B6C9C',
  consult_completed: '#8B6C9C',
  consent_updated: '#B8842A',
};

const CENTER_TYPE_LABEL: Record<string, string> = {
  specialist: 'Specialist centre',
  coe: 'NPRD CoE',
  nidan: 'Genetic testing',
};
const CENTER_TYPE_COLOR: Record<string, string> = {
  specialist: '#5C7855',
  coe: '#1E2D4A',
  nidan: '#8B6C9C',
};

const DISEASE_DESCRIPTIONS: Record<string, string> = {
  'Gaucher disease type 1':
    'Gaucher disease is a genetic condition where the body cannot properly break down a fatty substance called glucocerebroside. This causes it to build up in organs — especially the spleen, liver, and bone marrow. It is treatable with enzyme replacement therapy (ERT), which replaces the missing enzyme and stops the build-up.',
};

export default function PatientDashboardPage() {
  const { user, ready } = useMockSession();
  const [caseData, setCaseData] = useState<(StoredCase & { timeline?: StoredTimelineEvent[] }) | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const patientId = user?.id ?? 'u3';

    const loadCase = async () => {
      try {
        const cases: StoredCase[] = await fetch(`/api/cases?patientId=${patientId}`).then(r => r.json());
        const latest =
          cases.find(c => c.status === 'confirmed') ??
          cases.filter(c => c.status !== 'archived').sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ??
          null;
        if (!latest) {
          setCaseData(null);
          return;
        }
        const full = await fetch(`/api/cases/${latest.id}`).then(r => r.json());
        setCaseData(full);
      } catch {} finally {
        setLoaded(true);
      }
    };

    loadCase();
  }, [ready, user]);

  // Poll while case is in active processing OR while NPRD pipeline is in flight
  useEffect(() => {
    if (!caseData) return;
    const inActiveCaseState = caseData.status === 'analyzing' || caseData.status === 'awaiting_doctor_review' || caseData.status === 'draft';
    const coeRef = (caseData as { consultations?: { purpose: string; pipelineStatus?: string }[] }).consultations?.find(c => c.purpose === 'coe_referral');
    const pipelineActive = coeRef && coeRef.pipelineStatus !== 'mohfw_approved' && coeRef.pipelineStatus !== 'mohfw_rejected';
    if (!inActiveCaseState && !pipelineActive) return;

    const interval = setInterval(() => {
      fetch(`/api/cases/${caseData.id}`)
        .then(r => r.json())
        .then(full => setCaseData(full))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [caseData]);

  const demo = DEMO_CASES.find(d => d.id === caseData?.demoId);
  const result = (caseData?.aiResult ?? demo?.result ?? null) as import('@/lib/demo-cases').CaseResult | null;

  const description = DISEASE_DESCRIPTIONS[caseData?.confirmedDiagnosisName ?? ''] ??
    'Your condition has been confirmed by your doctor. Please speak with your specialist for more information.';

  const timeline = (caseData as { timeline?: StoredTimelineEvent[] } | null)?.timeline ?? [];

  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [sortedCenters, setSortedCenters] = useState<WithDistance<TreatmentCenter>[] | null>(null);
  const [nearbyLabs, setNearbyLabs] = useState<NearbyLab[] | null>(null);

  const staticCenters = getCentersForDisease(caseData?.confirmedOmimId ?? '230800').slice(0, 4);
  const displayCenters = sortedCenters ?? staticCenters.map(c => ({ item: c, distanceKm: -1 }));
  const nearest = displayCenters[0];

  async function handleLocate() {
    setLocating(true);
    setLocationError(null);
    try {
      const loc = await getUserLocation();
      const centers = getCentersForDisease(caseData?.confirmedOmimId ?? '230800');
      setSortedCenters(sortCentersByDistance(centers, loc.lat, loc.lon).slice(0, 4));
      const labs = await getNearbyLabs(loc.lat, loc.lon);
      setNearbyLabs(labs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Location access denied';
      setLocationError(msg.includes('denied') ? 'Please allow location access in your browser.' : msg);
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="px-[5%] py-10">
      <MissionBanner
        eyebrow="Your record · owned by you"
        accent="#5C7855"
        icon={Shield}
        mission="Every step of your care journey, in plain language. Your diagnosis. Your treatment pathway. Your nearest centre. Your funding eligibility. This record travels with you across providers — never locked to a single hospital."
      />
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
          Your Health Record
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>
          Your diagnosis and care journey, in one place.
        </p>
      </motion.div>

      {/* Diagnosis card */}
      {!loaded ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="mt-8 rounded-2xl p-8 text-center"
          style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
          <Loader2 className="mx-auto mb-3 size-8 animate-spin opacity-40" style={{ color: '#1E2D4A' }} />
          <p className="text-sm" style={{ color: '#8B96A8' }}>Loading your health record…</p>
        </motion.div>
      ) : !caseData ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-8 rounded-2xl p-10 text-center"
          style={{ background: 'rgba(92,120,85,0.04)', border: '1px solid rgba(92,120,85,0.2)' }}>
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full"
            style={{ background: 'rgba(92,120,85,0.1)' }}>
            <FileText className="size-7" style={{ color: '#5C7855' }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
            No case on file yet
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#6B7D93' }}>
            Tell us what you're experiencing and your doctor will take it from there.
          </p>
          <Link
            href="/patient/submit"
            className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #5C7855, #1E2D4A)', color: '#F5EFE3' }}>
            Submit your symptoms →
          </Link>
        </motion.div>
      ) : caseData.status === 'awaiting_doctor_review' ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl p-8"
          style={{ background: 'rgba(160,74,31,0.05)', border: '1px solid rgba(160,74,31,0.2)' }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full animate-pulse" style={{ background: '#A04A1F' }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#A04A1F' }}>
              Doctor reviewing
            </p>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
            Your doctor is reading your submission
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#2D4060' }}>
            What used to take five hospital visits now starts with one. Your doctor will add
            their clinical observations and run the AI specialist conference. Updates appear
            here automatically — you don&apos;t need to refresh.
          </p>
          <p className="mt-4 text-xs" style={{ color: '#6B7D93' }}>
            Submitted {new Date(caseData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </motion.div>
      ) : caseData.status === 'analyzing' ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl p-8"
          style={{ background: 'rgba(139,108,156,0.05)', border: '1px solid rgba(139,108,156,0.25)' }}>
          <div className="mb-3 flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" style={{ color: '#8B6C9C' }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B6C9C' }}>
              The case conference is happening now
            </p>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
            Six specialists are reviewing your case in parallel
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#2D4060' }}>
            This is the conference that usually requires you to visit four to seven hospitals
            over five years. A common-disease screener, a phenotype mapper, three sub-specialists
            (metabolic, neurogenetic, immunologic), and a synthesizer who merges their findings —
            all checking your symptoms against thousands of rare diseases at once.
          </p>
          <p className="mt-3 text-xs italic" style={{ color: '#6B7D93' }}>
            Usually completes in 5–7 minutes. Stay on the page or come back later — the analysis
            continues regardless.
          </p>
        </motion.div>
      ) : caseData.status === 'draft' ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl p-8"
          style={{ background: 'rgba(184,132,42,0.04)', border: '1px solid rgba(184,132,42,0.2)' }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="size-2 rounded-full animate-pulse" style={{ background: '#B8842A' }} />
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#B8842A' }}>
              The hard work is done · doctor confirming
            </p>
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
            AI analysis complete · doctor reviewing results
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#2D4060' }}>
            The differential is ranked, the next test is identified, the disagreements between
            specialists are surfaced. Your doctor is reading the report
            and will confirm the final diagnosis shortly.
          </p>
        </motion.div>
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(92,120,85,0.08) 0%, rgba(30,45,74,0.06) 100%)',
          border: '1px solid rgba(92,120,85,0.25)',
        }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5C7855' }}>Confirmed diagnosis</p>
            <h2 className="mt-2 text-2xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
              {caseData.confirmedDiagnosisName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs" style={{ color: '#6B7D93' }}>
              {caseData.confirmedOmimId && (
                <span className="flex items-center gap-1">
                  <span style={{ color: '#A0AAB8' }}>OMIM</span>
                  <span className="font-mono" style={{ color: '#A04A1F' }}>{caseData.confirmedOmimId}</span>
                </span>
              )}
              <span>·</span>
              <span>ORPHA: 355</span>
              {caseData.confirmedGene && (
                <><span>·</span>
                  <span>Gene: <span className="font-mono" style={{ color: '#A04A1F' }}>{caseData.confirmedGene}</span></span>
                </>
              )}
            </div>
          </div>
          <span
            className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'rgba(92,120,85,0.12)', color: '#5C7855', border: '1px solid rgba(92,120,85,0.3)' }}>
            Confirmed {caseData.confirmedAt ? new Date(caseData.confirmedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: '#2D4060' }}>{description}</p>
      </motion.div>
      )}

      {/* All sections below render only when diagnosis is confirmed */}
      {caseData?.status === 'confirmed' && (<>
      {/* ── NPRD pipeline status (when CoE referral active) ─────────────────── */}
      {(() => {
        const coeRef = (caseData as { consultations?: StoredConsultation[] } | null)
          ?.consultations?.find(c => c.purpose === 'coe_referral');
        if (!coeRef) return null;
        return (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-6">
            <PipelineTrackerCompact consultation={coeRef} />
          </motion.div>
        );
      })()}

      {/* ── Treatment Centres — HERO SECTION ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mt-6 overflow-hidden rounded-xl"
        style={{ border: '1px solid rgba(92,120,85,0.2)' }}>

        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-3"
          style={{ background: 'rgba(92,120,85,0.05)', borderBottom: '1px solid rgba(92,120,85,0.1)' }}>
          <div className="flex items-center gap-2">
            <MapPin className="size-4" style={{ color: '#5C7855' }} />
            <span className="text-sm font-semibold" style={{ color: '#0F1828' }}>Your nearest treatment centre</span>
          </div>
          <button
            onClick={handleLocate}
            disabled={locating}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: 'rgba(92,120,85,0.1)', color: '#5C7855', border: '1px solid rgba(92,120,85,0.25)' }}>
            {locating ? <><Loader2 className="size-3 animate-spin" /> Locating…</> : <><Navigation className="size-3" /> Sort by distance</>}
          </button>
        </div>

        {locationError && (
          <p className="px-5 pt-3 text-xs" style={{ color: '#A04A1F' }}>{locationError}</p>
        )}

        {/* Hero — nearest centre */}
        {nearest && (
          <div className="p-5" style={{ borderBottom: '1px solid rgba(15,24,40,0.05)' }}>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold" style={{ color: '#0F1828' }}>{nearest.item.shortName}</h3>
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ background: `${CENTER_TYPE_COLOR[nearest.item.type]}15`, color: CENTER_TYPE_COLOR[nearest.item.type], border: `1px solid ${CENTER_TYPE_COLOR[nearest.item.type]}30` }}>
                    {CENTER_TYPE_LABEL[nearest.item.type]}
                  </span>
                </div>
                <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>{nearest.item.address}</p>
                <p className="mt-1.5 text-xs" style={{ color: '#A0AAB8' }}>{nearest.item.capabilities.join(' · ')}</p>
                {nearest.item.phone && (
                  <a href={`tel:${nearest.item.phone}`} className="mt-1.5 inline-block text-sm font-medium" style={{ color: '#A04A1F' }}>
                    {nearest.item.phone}
                  </a>
                )}
              </div>
              {nearest.distanceKm >= 0 && (
                <div className="shrink-0 text-right">
                  <p className="text-3xl font-bold" style={{ color: '#5C7855' }}>{formatDistance(nearest.distanceKm)}</p>
                  <p className="text-xs" style={{ color: '#A0AAB8' }}>from your location</p>
                </div>
              )}
            </div>
            <a
              href={googleMapsDirectionsUrl(nearest.item)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base font-bold transition-opacity hover:opacity-90"
              style={{ background: '#5C7855', color: '#F5EFE3' }}>
              <MapPin className="size-5" />
              Get directions
            </a>
          </div>
        )}

        {/* Other centres list */}
        <div className="divide-y" style={{ '--tw-divide-color': 'rgba(15,24,40,0.04)' } as React.CSSProperties}>
          {displayCenters.slice(1).map(({ item: c, distanceKm }) => (
            <div key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: '#1E2D4A' }}>{c.shortName}</p>
                <p className="text-xs" style={{ color: '#A0AAB8' }}>
                  {c.city}, {c.state}
                  {distanceKm >= 0 && <span className="ml-2 font-semibold" style={{ color: '#A04A1F' }}>{formatDistance(distanceKm)}</span>}
                </p>
              </div>
              <a href={googleMapsDirectionsUrl(c)} target="_blank" rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                style={{ background: 'rgba(30,45,74,0.1)', color: '#A04A1F', border: '1px solid rgba(30,45,74,0.2)' }}>
                <ExternalLink className="size-3" /> Directions
              </a>
            </div>
          ))}
        </div>

        {/* Nearby labs */}
        {nearbyLabs && nearbyLabs.length > 0 && (
          <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(15,24,40,0.05)', background: 'rgba(139,108,156,0.03)' }}>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B96A8' }}>
              <FlaskConical className="size-3.5" /> Nearest diagnostic labs
            </p>
            <div className="space-y-1.5">
              {nearbyLabs.map((lab, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
                  style={{ background: 'rgba(139,108,156,0.05)', border: '1px solid rgba(139,108,156,0.1)' }}>
                  <div className="min-w-0">
                    <p className="text-sm" style={{ color: '#1E2D4A' }}>{lab.name}</p>
                    <p className="truncate text-xs" style={{ color: '#8B96A8' }}>
                      {lab.address}
                      {lab.distanceKm > 0 && <span className="ml-2 font-semibold" style={{ color: '#8B6C9C' }}>{formatDistance(lab.distanceKm)}</span>}
                    </p>
                  </div>
                  <a href={lab.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="shrink-0 rounded-lg px-2.5 py-1 text-xs transition-opacity hover:opacity-80"
                    style={{ background: 'rgba(139,108,156,0.1)', color: '#8B6C9C', border: '1px solid rgba(139,108,156,0.2)' }}>
                    Open
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Government Schemes ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 rounded-xl p-5"
        style={{ background: 'rgba(184,132,42,0.04)', border: '1px solid rgba(184,132,42,0.15)' }}>
        <div className="mb-4 flex items-center gap-2">
          <BadgeIndianRupee className="size-4" style={{ color: '#B8842A' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#0F1828' }}>Government funding you may be eligible for</h3>
        </div>
        <div className="space-y-2.5">
          {SCHEMES.map(s => (
            <div key={s.shortName} className="flex items-center justify-between gap-3 rounded-xl p-3"
              style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.06)' }}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold" style={{ color: '#0F1828' }}>{s.shortName}</p>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.amount}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed" style={{ color: '#8B96A8' }}>{s.description}</p>
              </div>
              <a href={s.url} target="_blank" rel="noopener noreferrer"
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}35` }}>
                Apply →
              </a>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Symptoms + Specialist grid ──────────────────────────────────────── */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
            <h3 className="mb-4 text-sm font-semibold" style={{ color: '#0F1828' }}>Your symptoms (medical terms)</h3>
            <div className="space-y-2">
              {result.hpo_terms.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full" style={{ background: '#5C7855' }} />
                  <div>
                    <p className="text-sm" style={{ color: '#1E2D4A' }}>{t.name}</p>
                    <p className="font-mono text-xs" style={{ color: '#A0AAB8' }}>{t.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.33 }}
          className="rounded-xl p-5"
          style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: '#0F1828' }}>Your specialist type</h3>
          <div className="rounded-xl p-3" style={{ background: 'rgba(30,45,74,0.06)', border: '1px solid rgba(30,45,74,0.15)' }}>
            <p className="text-sm font-medium" style={{ color: '#A04A1F' }}>
              {result?.specialist_type_recommended ?? 'Metabolic Geneticist (Lysosomal Storage Disorder specialist)'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Care Timeline ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 rounded-xl p-5"
        style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
        <h3 className="mb-5 text-sm font-semibold" style={{ color: '#0F1828' }}>Your care timeline</h3>
        <div className="relative space-y-0">
          {timeline.length === 0 && (
            <p className="text-sm" style={{ color: '#A0AAB8' }}>No timeline events yet.</p>
          )}
          {timeline.map((ev, i) => {
            const Icon = TIMELINE_ICONS[ev.eventType] ?? FileText;
            const color = TIMELINE_COLORS[ev.eventType] ?? '#1E2D4A';
            const isLast = i === timeline.length - 1;
            return (
              <div key={ev.id} className="relative flex gap-4 pb-6">
                {!isLast && (
                  <div className="absolute left-5 top-10 w-px"
                    style={{ height: 'calc(100% - 10px)', background: 'rgba(15,24,40,0.07)' }} />
                )}
                <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${color}15` }}>
                  <Icon className="size-4" style={{ color }} />
                </div>
                <div className="pt-1.5">
                  <p className="text-sm font-medium" style={{ color: '#1E2D4A' }}>
                    {(ev.metadata?.event as string) ?? ev.eventType.replace(/_/g, ' ')}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: '#A0AAB8' }}>
                    {new Date(ev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
      </>)}
    </div>
  );
}
