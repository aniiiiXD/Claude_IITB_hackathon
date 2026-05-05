'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
    Brain, CheckCircle2, ChevronDown, Dna, FlaskConical,
    HeartPulse, Loader2, Microscope, Stethoscope, Zap,
} from 'lucide-react'
import { DEMO_CASES, getCaseById } from '@/lib/demo-cases'
import { getMockSession, useRequireRole } from '@/lib/mock-session'

/* ─── Pipeline step definitions ────────────────────────────────── */
const STEPS = [
    { id: 'screener', label: 'Common-disease screener', sub: 'Ruling out malaria, TB, kala-azar, nutritional causes…', model: 'Haiku 4.5', icon: <Stethoscope className="size-4" />, color: '#1E2D4A', startMs: 0, durationMs: 1600 },
    { id: 'extractor', label: 'Phenotype extraction (HPO)', sub: 'Mapping clinical findings to Human Phenotype Ontology…', model: 'Haiku 4.5', icon: <Dna className="size-4" />, color: '#1E2D4A', startMs: 1600, durationMs: 1800 },
    { id: 'metabolic', label: 'Metabolic specialist', sub: 'IEM, lysosomal storage disorders, organic acidemias…', model: 'Sonnet 4.6', icon: <FlaskConical className="size-4" />, color: '#1E2D4A', startMs: 3400, durationMs: 2800, parallel: true },
    { id: 'neurogenetic', label: 'Neurogenetic specialist', sub: 'DMD, SMA, trinucleotide repeats, mitochondrial…', model: 'Sonnet 4.6', icon: <Brain className="size-4" />, color: '#8B6C9C', startMs: 3400, durationMs: 3200, parallel: true },
    { id: 'immunologic', label: 'Immunologic specialist', sub: 'PIDs, rare autoimmune, complement deficiencies…', model: 'Sonnet 4.6', icon: <HeartPulse className="size-4" />, color: '#5C7855', startMs: 3400, durationMs: 2600, parallel: true },
    { id: 'synthesizer', label: 'Case synthesizer', sub: 'Merging specialist reports, ranking differential, surfacing disagreements…', model: 'Opus 4.7', icon: <Microscope className="size-4" />, color: '#5C7855', startMs: 6600, durationMs: 2200 },
]
const TOTAL_MS = 8800
const NAVIGATE_MS = TOTAL_MS + 600

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

/* ─── Main exported component ──────────────────────────────────── */
export function AnalyzeClient({ initialDemo }: { initialDemo?: string }) {
    const router = useRouter()
    const { user, ready } = useRequireRole(['gp', 'specialist'])
    const [caseText, setCaseText] = useState('')
    const [selectedDemo, setSelectedDemo] = useState<string | null>(null)
    const [phase, setPhase] = useState<'input' | 'running' | 'done' | 'screener_stopped'>('input')
    const [stepStates, setStepStates] = useState<Record<string, 'pending' | 'running' | 'done'>>({})
    const [elapsed, setElapsed] = useState(0)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [screenerMessage, setScreenerMessage] = useState<string | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        if (initialDemo) loadDemo(initialDemo)
    }, [initialDemo])

    function loadDemo(id: string) {
        const c = getCaseById(id)
        if (!c) return
        setCaseText(c.case_text)
        setSelectedDemo(id)
        setDropdownOpen(false)
    }

    async function startPipeline() {
        if (!caseText.trim()) return
        setPhase('running')
        setElapsed(0)
        setError(null)
        setStepStates({})

        const start = Date.now()
        timerRef.current = setInterval(() => {
            setElapsed(Math.floor((Date.now() - start) / 100) / 10)
        }, 100)

        try {
            const res = await fetch(`${API_URL}/analyze/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ case_text: caseText }),
            })

            if (!res.ok) {
                const detail = await res.json().catch(() => ({}))
                throw new Error(detail.detail ?? `Server error ${res.status}`)
            }

            const reader = res.body!.getReader()
            const decoder = new TextDecoder()
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() ?? ''

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    const data = JSON.parse(line.slice(6))

                    if (data.event === 'agent_start') {
                        setStepStates(s => ({ ...s, [data.agent]: 'running' }))
                    } else if (data.event === 'agent_done') {
                        setStepStates(s => ({ ...s, [data.agent]: 'done' }))
                    } else if (data.event === 'complete') {
                        if (timerRef.current) clearInterval(timerRef.current)

                        if (data.result.stopped_at_screener) {
                            setScreenerMessage(data.result.screener?.reasoning ?? data.result.message)
                            setPhase('screener_stopped')
                            return
                        }

                        setPhase('done')

                        // Save to local DB and navigate to real case page
                        try {
                            const userId = getMockSession()?.id ?? 'u1'
                            const res2 = await fetch('/api/cases', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    createdBy: userId,
                                    caseText,
                                    aiResult: data.result,
                                    patientSummary: caseText.split('\n')[0].slice(0, 120),
                                    demoId: selectedDemo ?? undefined,
                                }),
                            })
                            const saved = await res2.json()
                            setTimeout(() => router.push(`/doctor/cases/${saved.id}`), 600)
                        } catch {
                            // Fallback to report page if save fails
                            sessionStorage.setItem('rc_result', JSON.stringify(data.result))
                            setTimeout(() => router.push('/report'), 600)
                        }
                    } else if (data.event === 'error') {
                        throw new Error(data.message)
                    }
                }
            }
        } catch (err) {
            if (timerRef.current) clearInterval(timerRef.current)
            setError(err instanceof Error ? err.message : 'Unexpected error — is the backend running?')
            setPhase('input')
        }
    }

    if (!ready || !user) return null

    return (
        <div
            className="min-h-screen w-full"
            style={{ background: '#F5EFE3' }}>
            {/* Background grid */}
            <div aria-hidden className="pointer-events-none fixed inset-0" style={{
                backgroundImage: `linear-gradient(rgba(30,45,74,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(30,45,74,0.03) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
            }} />

            <AnimatePresence mode="wait">
                {phase === 'input' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full pt-28 pb-16 px-[5%]">
                        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">

                            {/* Left: form */}
                            <div className="flex-1">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                    <span
                                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                                        style={{ borderColor: 'rgba(30,45,74,0.35)', background: 'rgba(30,45,74,0.08)', color: '#A04A1F' }}>
                                        <Zap className="size-3" /> 6 specialist agents · <span style={{ color: '#5C7855' }}>&lt;90 seconds</span>
                                    </span>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.55, delay: 0.08 }}
                                    className="mt-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
                                    style={{ fontFamily: 'var(--font-display)', color: '#0F1828' }}>
                                    Describe the patient case
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.15 }}
                                    className="mt-4 max-w-xl text-base leading-relaxed md:text-lg"
                                    style={{ color: '#6B7D93' }}>
                                    Type or paste the case in your own words. Include symptoms, timeline, family history, consanguinity, exam findings, and lab results.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.22 }}
                                    className="mt-8 space-y-4">
                                    {/* Demo case selector */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setDropdownOpen(v => !v)}
                                            className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all"
                                            style={{
                                                background: 'rgba(15,24,40,0.03)',
                                                borderColor: dropdownOpen ? 'rgba(30,45,74,0.4)' : 'rgba(15,24,40,0.08)',
                                                color: selectedDemo ? '#2D4060' : '#8B96A8',
                                            }}>
                                            <span className="font-medium">
                                                {selectedDemo
                                                    ? DEMO_CASES.find(c => c.id === selectedDemo)?.label
                                                    : 'Or load a published demo case…'}
                                            </span>
                                            <ChevronDown
                                                className="size-4 transition-transform"
                                                style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', color: '#8B96A8' }} />
                                        </button>

                                        <AnimatePresence>
                                            {dropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                                    exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                                                    className="absolute left-0 right-0 mt-1 overflow-hidden rounded-xl border"
                                                    style={{
                                                        transformOrigin: 'top',
                                                        background: '#FBF8F0',
                                                        borderColor: 'rgba(30,45,74,0.2)',
                                                        boxShadow: '0 12px 32px rgba(15,24,40,0.12)',
                                                        zIndex: 50,
                                                    }}>
                                                    {DEMO_CASES.map((c, i) => (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => loadDemo(c.id)}
                                                            className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-black/[0.04]"
                                                            style={{ borderBottom: i < DEMO_CASES.length - 1 ? '1px solid rgba(15,24,40,0.04)' : 'none' }}>
                                                            <span className="text-sm font-semibold" style={{ color: '#1E2D4A' }}>{c.label}</span>
                                                            <span className="text-xs" style={{ color: '#8B96A8' }}>True diagnosis: {c.true_diagnosis}</span>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Textarea */}
                                    <div className="relative">
                                        <textarea
                                            value={caseText}
                                            onChange={e => setCaseText(e.target.value)}
                                            placeholder="e.g. 8-year-old male, consanguineous parents. Progressive proximal weakness since age 4. Positive Gower's sign. CK 12,000 IU/L. Maternal uncle had similar symptoms..."
                                            rows={10}
                                            className="w-full resize-none rounded-xl px-5 py-4 text-sm leading-relaxed outline-none transition-all"
                                            style={{
                                                background: 'rgba(15,24,40,0.03)',
                                                border: `1px solid ${caseText ? 'rgba(30,45,74,0.35)' : 'rgba(15,24,40,0.08)'}`,
                                                color: '#1E2D4A',
                                                fontFamily: 'var(--font-mono-jb)',
                                                fontSize: '13px',
                                                lineHeight: '1.7',
                                                caretColor: '#1E2D4A',
                                            }}
                                        />
                                        {caseText && (
                                            <div className="absolute bottom-3 right-3 text-[10px]" style={{ color: '#A0AAB8', fontFamily: 'var(--font-mono-jb)' }}>
                                                {caseText.split(/\s+/).filter(Boolean).length} words
                                            </div>
                                        )}
                                    </div>

                                                    {error && (
                                        <div
                                            className="rounded-xl px-4 py-3 text-sm"
                                            style={{ background: 'rgba(160,74,31,0.08)', border: '1px solid rgba(160,74,31,0.25)', color: '#A04A1F' }}>
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={startPipeline}
                                        disabled={!caseText.trim()}
                                        className="flex w-full items-center justify-center gap-3 rounded-xl py-4 text-base font-bold transition-all duration-200 disabled:opacity-30"
                                        style={{
                                            background: caseText.trim() ? 'linear-gradient(135deg, #1E2D4A 0%, #5C7855 100%)' : 'rgba(30,45,74,0.3)',
                                            color: '#fff',
                                            boxShadow: caseText.trim() ? '0 0 40px rgba(30,45,74,0.3)' : 'none',
                                        }}>
                                        <Microscope className="size-5" />
                                        Run Case Conference
                                    </button>
                                    <p className="text-center text-xs" style={{ color: '#6B7D93' }}>
                                        Typical runtime: 60–90 seconds · All 6 specialist agents
                                    </p>
                                </motion.div>
                            </div>

                            {/* Right: agent readout */}
                            <motion.div
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="w-full flex-shrink-0 lg:w-[38%]">
                                <AgentReadyPanel />
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {phase === 'screener_stopped' && (
                    <motion.div
                        key="screener_stopped"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex min-h-screen w-full flex-col items-center justify-center px-[5%] py-24">
                        <div className="w-full max-w-[560px] rounded-2xl p-8 text-center"
                            style={{ background: 'rgba(30,45,74,0.06)', border: '1px solid rgba(30,45,74,0.2)' }}>
                            <CheckCircle2 className="mx-auto mb-4 size-10" style={{ color: '#1E2D4A' }} />
                            <h2 className="text-2xl font-bold" style={{ color: '#0F1828', fontFamily: 'var(--font-display)' }}>
                                Common disease identified
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#6B7D93' }}>
                                The screener determined that a common disease explains this presentation.
                                No rare disease workup is indicated.
                            </p>
                            {screenerMessage && (
                                <p className="mt-4 rounded-xl p-4 text-left text-sm leading-relaxed"
                                    style={{ background: 'rgba(15,24,40,0.05)', color: '#2D4060' }}>
                                    {screenerMessage}
                                </p>
                            )}
                            <button
                                onClick={() => { setPhase('input'); setStepStates({}) }}
                                className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold"
                                style={{ background: 'rgba(30,45,74,0.15)', color: '#A04A1F', border: '1px solid rgba(30,45,74,0.3)' }}>
                                Run another case
                            </button>
                        </div>
                    </motion.div>
                )}

                {(phase === 'running' || phase === 'done') && (
                    <motion.div
                        key="pipeline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex min-h-screen w-full flex-col items-center justify-center px-[5%] py-24">
                        <div className="w-full max-w-[640px]">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-10 text-center">
                                <div className="mb-3 flex items-center justify-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8B96A8' }}>
                                        Case Conference Running
                                    </span>
                                </div>
                                <h2 className="text-3xl font-bold md:text-4xl" style={{ fontFamily: 'var(--font-display)', color: '#0F1828' }}>
                                    Consulting specialists…
                                </h2>
                                <div className="mt-2 flex items-center justify-center gap-1.5">
                                    <span className="text-lg font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono-jb)', color: '#5C7855' }}>
                                        {elapsed.toFixed(1)}s
                                    </span>
                                    <span className="text-sm" style={{ color: '#A0AAB8' }}>elapsed</span>
                                </div>
                            </motion.div>

                            <div className="space-y-2.5">
                                {/* Screener + Extractor (sequential) */}
                                {STEPS.filter(s => !s.parallel).slice(0, 2).map((step, i) => (
                                    <PipelineRow key={step.id} step={step} state={stepStates[step.id] ?? 'pending'} delay={i * 0.05} />
                                ))}

                                {/* Parallel specialists block */}
                                <div
                                    className="rounded-xl p-3 space-y-2"
                                    style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.05)' }}>
                                    <p className="text-[11px] font-bold uppercase tracking-widest px-1" style={{ color: '#A0AAB8' }}>
                                        Parallel specialist council
                                    </p>
                                    {STEPS.filter(s => s.parallel).map((step, i) => (
                                        <PipelineRow key={step.id} step={step} state={stepStates[step.id] ?? 'pending'} delay={i * 0.06} />
                                    ))}
                                </div>

                                {/* Synthesizer */}
                                {STEPS.filter(s => !s.parallel).slice(2).map((step, i) => (
                                    <PipelineRow key={step.id} step={step} state={stepStates[step.id] ?? 'pending'} delay={i * 0.05} />
                                ))}
                            </div>

                            <AnimatePresence>
                                {Object.values(stepStates).filter(s => s === 'done').length >= STEPS.length && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 flex items-center justify-center gap-3 rounded-xl py-4"
                                        style={{ background: 'rgba(92,120,85,0.08)', border: '1px solid rgba(92,120,85,0.2)' }}>
                                        <CheckCircle2 className="size-5" style={{ color: '#5C7855' }} />
                                        <span className="text-base font-bold" style={{ color: '#5C7855' }}>Case conference complete — rendering report…</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ─── Pipeline row ──────────────────────────────────────────────── */
function PipelineRow({ step, state, delay }: {
    step: typeof STEPS[0]
    state: 'pending' | 'running' | 'done'
    delay: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay }}
            className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-500"
            style={{
                background: state === 'running'
                    ? `rgba(${step.color === '#8B6C9C' ? '168,85,247' : step.color === '#5C7855' ? '26,223,203' : '61,142,245'},0.08)`
                    : state === 'done'
                    ? 'rgba(92,120,85,0.04)'
                    : 'rgba(15,24,40,0.02)',
                border: `1px solid ${state === 'running'
                    ? `rgba(${step.color === '#8B6C9C' ? '168,85,247' : step.color === '#5C7855' ? '26,223,203' : '61,142,245'},0.25)`
                    : state === 'done'
                    ? 'rgba(92,120,85,0.15)'
                    : 'rgba(15,24,40,0.05)'}`,
            }}>
            <div
                className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                    background: state === 'running'
                        ? `rgba(${step.color === '#8B6C9C' ? '168,85,247' : step.color === '#5C7855' ? '26,223,203' : '61,142,245'},0.2)`
                        : state === 'done'
                        ? 'rgba(92,120,85,0.12)'
                        : 'rgba(15,24,40,0.05)',
                    color: state === 'running' ? step.color : state === 'done' ? '#5C7855' : '#A0AAB8',
                }}>
                {state === 'running'
                    ? <Loader2 className="size-4 animate-spin" />
                    : state === 'done'
                    ? <CheckCircle2 className="size-4" />
                    : step.icon}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: state === 'running' ? '#C5DEFF' : state === 'done' ? '#8DCFC4' : '#8B96A8' }}>
                        {step.label}
                    </p>
                    <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(15,24,40,0.05)', color: '#A0AAB8', fontFamily: 'var(--font-mono-jb)' }}>
                        {step.model}
                    </span>
                </div>
                {state === 'running' && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-0.5 text-xs truncate"
                        style={{ color: '#A0AAB8' }}>
                        {step.sub}
                    </motion.p>
                )}
            </div>

            {state === 'running' && (
                <div className="flex-shrink-0">
                    <div className="h-1 w-20 overflow-hidden rounded-full" style={{ background: 'rgba(15,24,40,0.06)' }}>
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: step.durationMs / 1000, ease: 'linear' }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${step.color}, #5C7855)` }}
                        />
                    </div>
                </div>
            )}
        </motion.div>
    )
}

/* ─── Agent ready panel ─────────────────────────────────────────── */
function AgentReadyPanel() {
    const agents = [
        { icon: <Stethoscope className="size-4" />, title: 'Common-disease screener', model: 'Haiku 4.5', color: '#1E2D4A', tier: 'fast' },
        { icon: <Dna className="size-4" />, title: 'Phenotype extractor', model: 'Haiku 4.5', color: '#1E2D4A', tier: 'fast' },
        { icon: <FlaskConical className="size-4" />, title: 'Metabolic specialist', model: 'Sonnet 4.6', color: '#1E2D4A', tier: 'deep' },
        { icon: <Brain className="size-4" />, title: 'Neurogenetic specialist', model: 'Sonnet 4.6', color: '#8B6C9C', tier: 'deep' },
        { icon: <HeartPulse className="size-4" />, title: 'Immunologic specialist', model: 'Sonnet 4.6', color: '#5C7855', tier: 'deep' },
        { icon: <Microscope className="size-4" />, title: 'Case synthesizer', model: 'Opus 4.7', color: '#5C7855', tier: 'synth' },
    ]
    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{
                background: '#FBF8F0',
                border: '1px solid rgba(30,45,74,0.15)',
                boxShadow: '0 0 0 1px rgba(15,24,40,0.08), 0 16px 40px rgba(15,24,40,0.15)',
            }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(15,24,40,0.05)' }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#A0AAB8' }}>6 agents standing by</p>
            </div>
            <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                {agents.map((a, i) => (
                    <div
                        key={a.title}
                        className="flex items-center gap-3 px-5 py-3.5"
                        style={{ borderColor: 'rgba(15,24,40,0.04)' }}>
                        <div
                            className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg"
                            style={{
                                background: a.tier === 'fast' ? 'rgba(30,45,74,0.1)' : a.tier === 'deep' && a.color === '#8B6C9C' ? 'rgba(139,108,156,0.1)' : a.tier === 'synth' ? 'rgba(92,120,85,0.1)' : a.tier === 'deep' && a.color === '#5C7855' ? 'rgba(92,120,85,0.1)' : 'rgba(30,45,74,0.1)',
                                color: a.color,
                            }}>
                            {a.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: '#1E2D4A' }}>{a.title}</p>
                        </div>
                        <span
                            className="flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-bold"
                            style={{ background: 'rgba(15,24,40,0.04)', color: '#A0AAB8', fontFamily: 'var(--font-mono-jb)' }}>
                            {a.model}
                        </span>
                    </div>
                ))}
            </div>
            <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(15,24,40,0.05)' }}>
                <div className="flex items-center justify-between text-xs" style={{ color: '#A0AAB8' }}>
                    <span style={{ fontFamily: 'var(--font-mono-jb)' }}>Hierarchical topology</span>
                    <span style={{ fontFamily: 'var(--font-mono-jb)', color: '#5C7855' }}>target: &lt;90s</span>
                </div>
            </div>
        </div>
    )
}
