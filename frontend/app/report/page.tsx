'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
    AlertTriangle, ArrowLeft, Brain, CheckCircle2, ChevronDown, ChevronRight,
    Copy, Dna, FlaskConical, HeartPulse, Info, Microscope, Stethoscope, Timer, Users,
} from 'lucide-react'
import { PageNav } from '@/components/layout/page-nav'
import { getCaseById, DEMO_CASES, type CaseResult, type Differential, type Disagreement, type RecommendedTest } from '@/lib/demo-cases'
import { Suspense } from 'react'

/* ─── Agent colour map ──────────────────────────────────────────── */
const AGENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    Metabolic:    { bg: 'rgba(30,45,74,0.12)',  border: 'rgba(30,45,74,0.3)',  text: '#A04A1F' },
    Neurogenetic: { bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)',  text: '#C084FC' },
    Immunologic:  { bg: 'rgba(92,120,85,0.12)',  border: 'rgba(92,120,85,0.3)',  text: '#5C7855' },
}
const CONFIDENCE_COLORS: Record<string, { bar: string; badge: string; text: string }> = {
    high:   { bar: '#5C7855', badge: 'rgba(92,120,85,0.12)',  text: '#5C7855' },
    medium: { bar: '#1E2D4A', badge: 'rgba(30,45,74,0.12)',  text: '#A04A1F' },
    low:    { bar: '#8B96A8', badge: 'rgba(74,106,138,0.12)',  text: '#6B7D93' },
}
const TIER_BADGE: Record<number, { bg: string; text: string; label: string }> = {
    1: { bg: 'rgba(92,120,85,0.1)',  text: '#5C7855', label: 'Tier 1 — Start here' },
    2: { bg: 'rgba(30,45,74,0.1)',  text: '#A04A1F', label: 'Tier 2 — If Tier 1 inconclusive' },
    3: { bg: 'rgba(168,85,247,0.1)', text: '#C084FC', label: 'Tier 3 — Confirmatory / genetic' },
}

function ReportContent() {
    const searchParams = useSearchParams()
    const caseParam = searchParams.get('case')
    const [result, setResult] = useState<CaseResult | null>(null)
    const [patientSummary, setPatientSummary] = useState('')
    const [caseId, setCaseId] = useState('')
    const [expandedRow, setExpandedRow] = useState<number | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        // Try sessionStorage first (from pipeline run)
        const stored = sessionStorage.getItem('rc_result')
        const storedId = sessionStorage.getItem('rc_case_id')
        const storedSummary = sessionStorage.getItem('rc_patient_summary')

        if (stored && storedId) {
            setResult(JSON.parse(stored))
            setCaseId(storedId)
            setPatientSummary(storedSummary ?? '')
        } else {
            // Fallback to demo case from URL param
            const id = caseParam ?? 'gaucher'
            const c = getCaseById(id) ?? DEMO_CASES[0]
            setResult(c.result)
            setCaseId(c.id)
            setPatientSummary(c.patient_summary)
        }
    }, [caseParam])

    function copyHPO() {
        if (!result) return
        navigator.clipboard.writeText(result.hpo_referral_summary)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!result) {
        return (
            <div className="flex min-h-screen items-center justify-center" style={{ background: '#F5EFE3' }}>
                <div className="flex items-center gap-3" style={{ color: '#8B96A8' }}>
                    <div className="size-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: '#1E2D4A', borderTopColor: 'transparent' }} />
                    <span className="text-sm">Loading case conference…</span>
                </div>
            </div>
        )
    }

    const demoCase = getCaseById(caseId)
    const tierGroups = [1, 2, 3].map(t => ({
        tier: t,
        tests: result.recommended_tests.filter(r => r.tier === t),
    })).filter(g => g.tests.length > 0)

    return (
        <div className="min-h-screen w-full pb-24" style={{ background: '#F5EFE3' }}>
            {/* BG grid */}
            <div aria-hidden className="pointer-events-none fixed inset-0" style={{
                backgroundImage: `linear-gradient(rgba(30,45,74,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,74,0.025) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
            }} />

            {/* Case info banner */}
            <div className="relative z-10 w-full px-[5%] pt-28 pb-4">
                <div
                    className="flex flex-wrap items-start justify-between gap-4 rounded-2xl p-5"
                    style={{ background: 'rgba(15,24,40,0.025)', border: '1px solid rgba(15,24,40,0.07)' }}>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link
                                href="/analyze"
                                className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-orange-700"
                                style={{ color: '#8B96A8' }}>
                                <ArrowLeft className="size-3" /> New case
                            </Link>
                            <span style={{ color: '#1E3A50' }}>·</span>
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#A0AAB8' }}>
                                Case Conference Report
                            </span>
                        </div>
                        <p className="text-base font-bold" style={{ color: '#C5DEFF' }}>{patientSummary || demoCase?.patient_summary}</p>
                        {demoCase && (
                            <p className="mt-1 text-xs" style={{ color: '#8B96A8' }}>
                                Published case · True diagnosis: <span style={{ color: '#5C7855' }}>{demoCase.true_diagnosis}</span>
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <StatPill icon={<Timer className="size-3.5" />} value={`${result.runtime_seconds}s`} label="runtime" color="#5C7855" />
                        <StatPill icon={<Users className="size-3.5" />} value="6" label="agents" color="#1E2D4A" />
                        <StatPill icon={<Microscope className="size-3.5" />} value={`${result.unified_differential.length}`} label="dx ranked" color="#A04A1F" />
                    </div>
                </div>
            </div>

            <div className="relative z-10 w-full px-[5%] space-y-6 mt-2">

                {/* Screener banner */}
                {result.screener.proceed_to_rare_workup && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl p-5"
                        style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="size-5 flex-shrink-0 mt-0.5" style={{ color: '#FBB024' }} />
                            <div>
                                <p className="text-sm font-bold mb-1.5" style={{ color: '#FBB024' }}>
                                    SCREENER NOTE — Common conditions ruled out · Rare disease workup indicated
                                </p>
                                <p className="text-sm leading-relaxed" style={{ color: '#A88A40' }}>
                                    {result.screener.screener_note}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {result.screener.common_conditions_considered.map(c => (
                                        <span
                                            key={c}
                                            className="rounded-lg px-2.5 py-1 text-xs font-medium"
                                            style={{ background: 'rgba(251,191,36,0.08)', color: '#8A6A2A', border: '1px solid rgba(251,191,36,0.12)' }}>
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Case conference narrative */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="rounded-2xl p-5"
                    style={{ background: 'rgba(30,45,74,0.05)', border: '1px solid rgba(30,45,74,0.15)' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Microscope className="size-4" style={{ color: '#1E2D4A' }} />
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#A0AAB8' }}>
                            Case Conference Summary
                        </span>
                        <span
                            className="rounded px-2 py-0.5 text-[10px] font-bold uppercase"
                            style={{ background: 'rgba(30,45,74,0.1)', color: '#4A7AB8', fontFamily: 'var(--font-mono-jb)' }}>
                            Synthesizer · Opus 4.7
                        </span>
                    </div>
                    <p className="text-base leading-relaxed" style={{ color: '#2D4060' }}>
                        {result.case_conference_narrative}
                    </p>
                </motion.div>

                {/* Two-column layout: differential + disagreements */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">

                    {/* Differential table */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl overflow-hidden"
                        style={{ border: '1px solid rgba(15,24,40,0.07)' }}>
                        <div
                            className="flex items-center justify-between px-5 py-4"
                            style={{ background: 'rgba(15,24,40,0.025)', borderBottom: '1px solid rgba(15,24,40,0.06)' }}>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#A0AAB8' }}>
                                    Differential Diagnosis
                                </span>
                                <span
                                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                    style={{ background: 'rgba(30,45,74,0.15)', color: '#A04A1F' }}>
                                    {result.unified_differential.length} conditions ranked
                                </span>
                            </div>
                            <span className="text-xs" style={{ color: '#A0AAB8', fontFamily: 'var(--font-mono-jb)' }}>
                                Click row to expand
                            </span>
                        </div>

                        <div className="divide-y" style={{ borderColor: 'rgba(15,24,40,0.04)' }}>
                            {result.unified_differential.map((d, i) => (
                                <DifferentialRow
                                    key={d.rank}
                                    d={d}
                                    index={i}
                                    expanded={expandedRow === d.rank}
                                    onToggle={() => setExpandedRow(expandedRow === d.rank ? null : d.rank)}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Right column: disagreements */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="space-y-4">
                        <DisagreementPanel disagreements={result.disagreements} />
                        <ReferralCard
                            type={result.specialist_type_recommended}
                            centers={result.referral_centers}
                        />
                    </motion.div>
                </div>

                {/* Recommended tests */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid rgba(15,24,40,0.07)' }}>
                    <div
                        className="px-5 py-4"
                        style={{ background: 'rgba(15,24,40,0.025)', borderBottom: '1px solid rgba(15,24,40,0.06)' }}>
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#A0AAB8' }}>
                            Recommended Next Tests — ordered by yield-per-rupee
                        </span>
                    </div>
                    <div className="p-5 space-y-6">
                        {tierGroups.map(({ tier, tests }) => (
                            <div key={tier}>
                                <div
                                    className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold mb-3"
                                    style={{ background: TIER_BADGE[tier].bg, color: TIER_BADGE[tier].text }}>
                                    {TIER_BADGE[tier].label}
                                </div>
                                <div className="space-y-2">
                                    {tests.map(test => (
                                        <TestRow key={test.name} test={test} tier={tier} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* HPO summary */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ border: '1px solid rgba(15,24,40,0.07)' }}>
                    <div
                        className="flex items-center justify-between px-5 py-4"
                        style={{ background: 'rgba(15,24,40,0.025)', borderBottom: '1px solid rgba(15,24,40,0.06)' }}>
                        <div className="flex items-center gap-2">
                            <Dna className="size-4" style={{ color: '#1E2D4A' }} />
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#A0AAB8' }}>
                                HPO Summary — for referral letter
                            </span>
                        </div>
                        <button
                            onClick={copyHPO}
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                            style={{
                                background: copied ? 'rgba(92,120,85,0.15)' : 'rgba(30,45,74,0.1)',
                                color: copied ? '#5C7855' : '#A04A1F',
                                border: `1px solid ${copied ? 'rgba(92,120,85,0.3)' : 'rgba(30,45,74,0.2)'}`,
                            }}>
                            {copied ? <CheckCircle2 className="size-3.5" /> : <Copy className="size-3.5" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <div className="p-5">
                        <p
                            className="text-sm leading-loose"
                            style={{
                                fontFamily: 'var(--font-mono-jb)',
                                color: '#6B7D93',
                                background: 'rgba(15,24,40,0.02)',
                                border: '1px solid rgba(15,24,40,0.05)',
                                borderRadius: '12px',
                                padding: '16px',
                            }}>
                            {result.hpo_referral_summary.split(' · ').map((term, i) => (
                                <span key={i}>
                                    {i > 0 && <span style={{ color: '#1E3A50' }}> · </span>}
                                    <span style={{ color: term.startsWith('HP:') ? '#A04A1F' : '#8AAECC' }}>
                                        {term}
                                    </span>
                                </span>
                            ))}
                        </p>
                        <p className="mt-3 text-xs" style={{ color: '#2E4E64' }}>
                            Copy and paste directly into your referral letter. Each HP: code links to the Human Phenotype Ontology.
                        </p>
                    </div>
                </motion.div>

                {/* Other demo cases */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    className="rounded-2xl p-5"
                    style={{ border: '1px solid rgba(15,24,40,0.06)', background: 'rgba(15,24,40,0.02)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#A0AAB8' }}>
                        Try another published case
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {DEMO_CASES.map(c => (
                            <Link
                                key={c.id}
                                href={`/analyze?demo=${c.id}`}
                                className="rounded-xl px-3 py-2.5 text-left transition-all hover:bg-blue-500/10"
                                style={{
                                    background: c.id === caseId ? 'rgba(30,45,74,0.1)' : 'rgba(15,24,40,0.02)',
                                    border: `1px solid ${c.id === caseId ? 'rgba(30,45,74,0.3)' : 'rgba(15,24,40,0.06)'}`,
                                }}>
                                <p className="text-xs font-semibold leading-tight" style={{ color: c.id === caseId ? '#A04A1F' : '#8AAECC' }}>
                                    {c.label.split(' — ')[1]}
                                </p>
                                <p className="mt-0.5 text-[10px]" style={{ color: '#2E4E64', fontFamily: 'var(--font-mono-jb)' }}>
                                    {c.id === caseId ? 'Current' : 'Run →'}
                                </p>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

/* ─── Differential row ──────────────────────────────────────────── */
function DifferentialRow({ d, index, expanded, onToggle }: {
    d: Differential
    index: number
    expanded: boolean
    onToggle: () => void
}) {
    const cc = CONFIDENCE_COLORS[d.confidence]
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}>
            <button
                onClick={onToggle}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-black/[0.03]">
                {/* Rank */}
                <span
                    className="flex size-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                    style={{ background: cc.badge, color: cc.text }}>
                    {d.rank}
                </span>

                {/* Disease + codes */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: '#0F1828' }}>{d.disease_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#A0AAB8', fontFamily: 'var(--font-mono-jb)' }}>
                        OMIM:{d.omim_id} · ORPHA:{d.orpha_code}
                    </p>
                </div>

                {/* Confidence bar */}
                <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0 w-28">
                    <div className="flex items-center gap-1.5 w-full">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(15,24,40,0.07)' }}>
                            <div className="h-full rounded-full" style={{ width: `${d.confidence_pct}%`, background: cc.bar }} />
                        </div>
                        <span className="text-xs font-bold tabular-nums" style={{ color: cc.text, fontFamily: 'var(--font-mono-jb)' }}>
                            {d.confidence_pct}%
                        </span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase" style={{ color: cc.text }}>{d.confidence}</span>
                </div>

                {/* Flagged by agents */}
                <div className="hidden md:flex gap-1.5 flex-shrink-0">
                    {d.flagged_by.map(agent => {
                        const ac = AGENT_COLORS[agent] ?? { bg: 'rgba(30,45,74,0.1)', border: 'rgba(30,45,74,0.2)', text: '#A04A1F' }
                        return (
                            <span
                                key={agent}
                                className="rounded px-2 py-0.5 text-[10px] font-bold"
                                style={{ background: ac.bg, color: ac.text, border: `1px solid ${ac.border}` }}>
                                {agent}
                            </span>
                        )
                    })}
                </div>

                <ChevronDown
                    className="size-4 flex-shrink-0 transition-transform"
                    style={{ color: '#A0AAB8', transform: expanded ? 'rotate(180deg)' : 'none' }} />
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                        style={{ borderTop: '1px solid rgba(15,24,40,0.04)' }}>
                        <div className="px-5 py-4 grid grid-cols-1 gap-4 md:grid-cols-2" style={{ background: 'rgba(15,24,40,0.015)' }}>
                            {/* Supporting */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#5C7855' }}>
                                    Supporting features
                                </p>
                                <ul className="space-y-1.5">
                                    {d.supporting_features.map(f => (
                                        <li key={f} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: '#8AAECC' }}>
                                            <CheckCircle2 className="size-3 flex-shrink-0 mt-0.5" style={{ color: '#5C7855' }} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Non-matching */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: '#FBB024' }}>
                                    Non-matching / caution
                                </p>
                                <ul className="space-y-1.5">
                                    {d.non_matching_features.map(f => (
                                        <li key={f} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: '#8A7040' }}>
                                            <Info className="size-3 flex-shrink-0 mt-0.5" style={{ color: '#FBB024' }} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                {/* Confirmatory tests */}
                                <p className="text-[11px] font-bold uppercase tracking-widest mt-4 mb-2.5" style={{ color: '#A04A1F' }}>
                                    Confirmatory tests
                                </p>
                                <ul className="space-y-2">
                                    {d.confirmatory_tests.map(t => (
                                        <li
                                            key={t.test}
                                            className="rounded-lg px-3 py-2"
                                            style={{ background: 'rgba(30,45,74,0.06)', border: '1px solid rgba(30,45,74,0.12)' }}>
                                            <p className="text-xs font-semibold" style={{ color: '#C5DEFF' }}>{t.test}</p>
                                            <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: '#8B96A8' }}>{t.yield_level}</p>
                                            {t.cost_inr && (
                                                <p className="mt-0.5 text-[10px]" style={{ color: '#2E4E64', fontFamily: 'var(--font-mono-jb)' }}>
                                                    {t.cost_inr}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

/* ─── Disagreement panel ────────────────────────────────────────── */
function DisagreementPanel({ disagreements }: { disagreements: Disagreement[] }) {
    if (!disagreements.length) return null
    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.03)' }}>
            <div
                className="flex items-center gap-2 px-5 py-4"
                style={{ borderBottom: '1px solid rgba(251,191,36,0.1)' }}>
                <AlertTriangle className="size-4" style={{ color: '#FBB024' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8A6A2A' }}>
                    Specialist Disagreements
                </span>
                <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: 'rgba(251,191,36,0.15)', color: '#FBB024' }}>
                    {disagreements.length}
                </span>
            </div>

            <div className="p-4 space-y-4">
                {disagreements.map(d => (
                    <div key={d.disease}>
                        <p className="text-sm font-bold mb-3" style={{ color: '#0F1828' }}>{d.disease}</p>

                        {/* Agent opinion split */}
                        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${d.flagged_by.length + d.not_flagged_by.length}, 1fr)` }}>
                            {d.flagged_by.map(agent => {
                                const ac = AGENT_COLORS[agent] ?? { bg: 'rgba(92,120,85,0.1)', border: 'rgba(92,120,85,0.25)', text: '#5C7855' }
                                return (
                                    <div
                                        key={agent}
                                        className="rounded-xl p-3 text-center"
                                        style={{ background: ac.bg, border: `1px solid ${ac.border}` }}>
                                        <CheckCircle2 className="size-4 mx-auto mb-1" style={{ color: ac.text }} />
                                        <p className="text-[10px] font-bold leading-tight" style={{ color: ac.text }}>{agent}</p>
                                        <p className="text-[9px] mt-0.5 font-semibold uppercase" style={{ color: ac.text, opacity: 0.7 }}>flagged</p>
                                    </div>
                                )
                            })}
                            {d.not_flagged_by.map(agent => {
                                const ac = AGENT_COLORS[agent] ?? { bg: 'rgba(74,106,138,0.1)', border: 'rgba(74,106,138,0.2)', text: '#6B7D93' }
                                return (
                                    <div
                                        key={agent}
                                        className="rounded-xl p-3 text-center"
                                        style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
                                        <div className="size-4 mx-auto mb-1 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#A0AAB8' }}>
                                            <div className="size-1.5 rounded-full" style={{ background: '#A0AAB8' }} />
                                        </div>
                                        <p className="text-[10px] font-bold leading-tight" style={{ color: '#8B96A8' }}>{agent}</p>
                                        <p className="text-[9px] mt-0.5 font-semibold uppercase" style={{ color: '#A0AAB8' }}>not flagged</p>
                                    </div>
                                )
                            })}
                        </div>

                        <p className="mt-3 text-xs leading-relaxed" style={{ color: '#8A7040' }}>{d.reason}</p>

                        <div
                            className="mt-3 flex items-start gap-2 rounded-lg p-3"
                            style={{ background: 'rgba(30,45,74,0.06)', border: '1px solid rgba(30,45,74,0.15)' }}>
                            <ChevronRight className="size-3.5 flex-shrink-0 mt-0.5" style={{ color: '#A04A1F' }} />
                            <p className="text-xs" style={{ color: '#A04A1F' }}>
                                <span className="font-bold">Resolving test: </span>{d.resolving_test}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─── Test row ──────────────────────────────────────────────────── */
function TestRow({ test, tier }: { test: RecommendedTest; tier: number }) {
    const tc = TIER_BADGE[tier]
    return (
        <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(15,24,40,0.025)', border: '1px solid rgba(15,24,40,0.06)' }}>
            <div
                className="flex size-5 flex-shrink-0 items-center justify-center rounded-md mt-0.5"
                style={{ background: tc.bg, color: tc.text }}>
                <div className="size-1.5 rounded-full" style={{ background: tc.text }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: '#C5DEFF' }}>{test.name}</p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: '#6B7D93' }}>{test.rationale}</p>
            </div>
            {test.cost_inr && (
                <span
                    className="flex-shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold"
                    style={{ background: 'rgba(15,24,40,0.04)', color: '#8B96A8', fontFamily: 'var(--font-mono-jb)', border: '1px solid rgba(15,24,40,0.06)' }}>
                    {test.cost_inr}
                </span>
            )}
        </div>
    )
}

/* ─── Referral card ─────────────────────────────────────────────── */
function ReferralCard({ type, centers }: { type: string; centers: string[] }) {
    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(92,120,85,0.2)', background: 'rgba(92,120,85,0.03)' }}>
            <div
                className="flex items-center gap-2 px-5 py-4"
                style={{ borderBottom: '1px solid rgba(92,120,85,0.1)' }}>
                <Users className="size-4" style={{ color: '#5C7855' }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#2A6A5A' }}>
                    Refer to
                </span>
            </div>
            <div className="p-4 space-y-3">
                <p className="text-sm font-bold" style={{ color: '#8DCFC4' }}>{type}</p>
                <div className="space-y-1.5">
                    {centers.map(c => (
                        <div key={c} className="flex items-start gap-2 text-xs" style={{ color: '#4A8A7A' }}>
                            <ChevronRight className="size-3 flex-shrink-0 mt-0.5" style={{ color: '#5C7855' }} />
                            {c}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ─── Stat pill ─────────────────────────────────────────────────── */
function StatPill({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
    return (
        <div className="flex items-center gap-2">
            <div style={{ color }}>{icon}</div>
            <div>
                <span className="text-lg font-bold tabular-nums" style={{ color, fontFamily: 'var(--font-display)' }}>{value}</span>
                <span className="ml-1.5 text-xs" style={{ color: '#A0AAB8' }}>{label}</span>
            </div>
        </div>
    )
}

/* ─── Page export with Suspense (required for useSearchParams) ───── */
export default function ReportPage() {
    return (
        <>
            <PageNav />
            <Suspense fallback={
                <div className="flex min-h-screen items-center justify-center" style={{ background: '#F5EFE3' }}>
                    <div className="size-6 animate-spin rounded-full border-2" style={{ borderColor: '#1E2D4A', borderTopColor: 'transparent' }} />
                </div>
            }>
                <ReportContent />
            </Suspense>
        </>
    )
}
