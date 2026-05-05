'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import {
    Menu, X, ChevronRight, Dna, Brain, Microscope,
    FlaskConical, HeartPulse, Stethoscope, CheckCircle2,
    Loader2, AlertTriangle, ArrowRight,
    Users, BarChart3, Search, ArrowUpRight
} from 'lucide-react'
import { motion, useScroll, AnimatePresence } from 'motion/react'
import { RoleSwitcher } from '@/components/layout/role-switcher'

/* ─── Palette ──────────────────────────────────────────────────── */
// All hero colours are hardcoded so the section is always dark-mode
// regardless of the user's OS preference.

export function HeroSection() {
    return (
        <div style={{ background: '#F5EFE3' }}>
            <HeroHeader />
            <main className="overflow-x-hidden">
                <HeroMain />
                <SliderSection />
                <AgentSection />
                <FourActorsSection />
                <LandingFooter />
            </main>
        </div>
    )
}

/* ─── Hero main ─────────────────────────────────────────────────── */
function HeroMain() {
    return (
        <section className="relative min-h-screen flex items-center">
            {/* Background grid */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(30,45,74,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(30,45,74,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                }}
            />
            {/* Radial glows */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `
                        radial-gradient(ellipse 70% 60% at 70% 50%, rgba(29,78,216,0.12) 0%, transparent 70%),
                        radial-gradient(ellipse 40% 40% at 20% 80%, rgba(92,120,85,0.06) 0%, transparent 60%)
                    `,
                }}
            />

            <div className="relative z-10 w-full px-[5%] pb-24 pt-36">
                <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:gap-12">

                    {/* Left: content */}
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}>
                            <span
                                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
                                style={{
                                    borderColor: 'rgba(30,45,74,0.35)',
                                    background: 'rgba(30,45,74,0.08)',
                                    color: '#A04A1F',
                                }}>
                                <Dna className="size-3" />
                                Clinical Decision Support · Rare Disease · India
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 32 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="mt-7 text-6xl leading-[1.05] md:text-7xl xl:text-8xl 2xl:text-9xl"
                            style={{ fontFamily: 'var(--font-display)', color: '#EEF4FF' }}>
                            Specialist case conference.{' '}
                            <span
                                style={{
                                    fontStyle: 'italic',
                                    background: 'linear-gradient(135deg, #1E2D4A 0%, #5C7855 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                90 seconds.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-7 max-w-2xl text-lg leading-relaxed md:text-xl"
                            style={{ color: '#2D4060' }}>
                            Nidaan runs 6 specialist agents in parallel — metabolic, neurogenetic, immunologic —
                            and synthesises a ranked differential with explicit disagreements and next tests.
                            Built for first-line Indian physicians who suspect rare disease but can't wait 6 weeks for a geneticist.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-10 flex flex-wrap items-center gap-3">
                            <Link
                                href="/analyze"
                                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                                style={{
                                    background: 'linear-gradient(135deg, #1E2D4A 0%, #5C7855 100%)',
                                    color: '#fff',
                                    boxShadow: '0 0 32px rgba(30,45,74,0.35)',
                                }}>
                                Run a Case Conference
                                <ChevronRight className="size-4" />
                            </Link>
                            <Link
                                href="/analyze?demo=gaucher"
                                className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors hover:border-blue-400/40"
                                style={{
                                    borderColor: 'rgba(15,24,40,0.1)',
                                    color: '#8BAFC8',
                                }}>
                                Try Gaucher demo
                                <ArrowRight className="size-3.5" />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-12 flex items-center gap-8">
                            <HeroStat value="96M" label="Indians with rare disease" />
                            <div className="h-10 w-px" style={{ background: 'rgba(15,24,40,0.07)' }} />
                            <HeroStat value="4–6 yr" label="avg diagnostic odyssey" />
                            <div className="h-10 w-px" style={{ background: 'rgba(15,24,40,0.07)' }} />
                            <HeroStat value="&lt;90s" label="Nidaan runtime" />
                        </motion.div>
                    </div>

                    {/* Right: animated case conference mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="w-full flex-shrink-0 lg:w-[45%] xl:w-[42%]">
                        <CaseConferenceMockup />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

/* ─── Animated case conference mockup ──────────────────────────── */
const STAGES = ['screener', 'extractor', 'specialists', 'results'] as const
type Stage = typeof STAGES[number]

function CaseConferenceMockup() {
    const [stage, setStage] = useState<Stage>('screener')
    const [visibleResults, setVisibleResults] = useState(0)

    useEffect(() => {
        const timeline: { delay: number; fn: () => void }[] = [
            { delay: 1200, fn: () => setStage('extractor') },
            { delay: 2800, fn: () => setStage('specialists') },
            { delay: 5200, fn: () => setStage('results') },
            { delay: 6000, fn: () => setVisibleResults(1) },
            { delay: 6800, fn: () => setVisibleResults(2) },
            { delay: 7500, fn: () => setVisibleResults(3) },
            // restart
            { delay: 11000, fn: () => { setStage('screener'); setVisibleResults(0) } },
        ]
        const timers = timeline.map(({ delay, fn }) => setTimeout(fn, delay))
        return () => timers.forEach(clearTimeout)
    }, [stage === 'screener' && visibleResults === 0 ? 'reset' : 'running'])

    const done = (s: Stage) => {
        const order = ['screener', 'extractor', 'specialists', 'results']
        return order.indexOf(stage) > order.indexOf(s)
    }
    const active = (s: Stage) => stage === s

    const differentials = [
        { rank: 1, name: 'Gaucher disease type 1', omim: '230800', agent: 'Metabolic', pct: 89, color: '#1E2D4A' },
        { rank: 2, name: 'Niemann-Pick type B', omim: '607616', agent: 'Metabolic', pct: 61, color: '#1E2D4A' },
        { rank: 3, name: 'HLH (secondary)', omim: '267700', agent: 'Immunologic', pct: 44, color: '#5C7855' },
    ]

    return (
        <div
            className="relative rounded-2xl"
            style={{
                background: '#070F1E',
                border: '1px solid rgba(30,45,74,0.18)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(15,24,40,0.04)',
            }}>
            {/* Title bar */}
            <div
                className="flex items-center justify-between rounded-t-2xl px-5 py-3.5"
                style={{ borderBottom: '1px solid rgba(15,24,40,0.05)', background: 'rgba(15,24,40,0.02)' }}>
                <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                    <div className="size-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
                    <div className="size-2.5 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <span className="text-xs" style={{ fontFamily: 'var(--font-mono-jb)', color: '#8B96A8' }}>
                    rarecouncil — case conference
                </span>
                <div />
            </div>

            <div className="p-5 space-y-4">
                {/* Patient input */}
                <div
                    className="rounded-xl p-4"
                    style={{ background: 'rgba(15,24,40,0.03)', border: '1px solid rgba(15,24,40,0.06)' }}>
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-widest" style={{ color: '#8B96A8' }}>Patient case</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#6B7D93' }}>
                        39M, Ahmedabad. Consanguineous marriage. 10 months of abdominal distension,
                        low-grade fever, weight loss. Massive splenomegaly. Pancytopenia. Elevated ferritin.
                        Previously treated for malaria and kala-azar — no response.
                    </p>
                </div>

                {/* Pipeline steps */}
                <div className="space-y-2">
                    <PipelineStep
                        icon={<Stethoscope className="size-3.5" />}
                        label="Common-disease screener"
                        sublabel="Malaria, TB, kala-azar ruled out"
                        done={done('screener')}
                        active={active('screener')}
                    />
                    <PipelineStep
                        icon={<Dna className="size-3.5" />}
                        label="Phenotype extraction"
                        sublabel="HP:0001744 · HP:0001903 · HP:0001433 + 4 more"
                        done={done('extractor')}
                        active={active('extractor')}
                    />
                    <div className="grid grid-cols-3 gap-1.5">
                        {['Metabolic', 'Neurogenetic', 'Immunologic'].map((spec) => (
                            <SpecialistChip
                                key={spec}
                                label={spec}
                                running={active('specialists')}
                                done={stage === 'results' || done('specialists')}
                            />
                        ))}
                    </div>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {stage === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#8B96A8' }}>
                                    Differential
                                </span>
                                <span className="text-xs" style={{ fontFamily: 'var(--font-mono-jb)', color: '#5C7855' }}>
                                    67s total
                                </span>
                            </div>
                            {differentials.slice(0, visibleResults).map((d, i) => (
                                <motion.div
                                    key={d.rank}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center gap-3 rounded-lg p-2.5"
                                    style={{ background: 'rgba(30,45,74,0.06)', border: '1px solid rgba(30,45,74,0.12)' }}>
                                    <span
                                        className="flex size-5 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                                        style={{ background: 'rgba(30,45,74,0.2)', color: '#A04A1F' }}>
                                        {d.rank}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: '#0F1828' }}>{d.name}</p>
                                        <p className="text-xs" style={{ fontFamily: 'var(--font-mono-jb)', color: '#8B96A8' }}>
                                            OMIM:{d.omim} · {d.agent}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <div className="h-1 w-16 rounded-full overflow-hidden" style={{ background: 'rgba(15,24,40,0.07)' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${d.pct}%` }}
                                                transition={{ duration: 0.6, delay: 0.1 }}
                                                className="h-full rounded-full"
                                                style={{ background: `linear-gradient(90deg, ${d.color}, #5C7855)` }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono" style={{ color: '#5A7A9A' }}>{d.pct}%</span>
                                    </div>
                                </motion.div>
                            ))}

                            {visibleResults >= 3 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 rounded-lg p-2.5"
                                    style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                                    <AlertTriangle className="size-3.5 flex-shrink-0" style={{ color: '#FBB024' }} />
                                    <p className="text-xs leading-relaxed" style={{ color: '#B89A50' }}>
                                        Disagreement: Niemann-Pick C flagged by Neurogenetic only.
                                        Resolving test: Filipin staining / NPC1 panel.
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

function PipelineStep({
    icon, label, sublabel, done, active,
}: {
    icon: React.ReactNode
    label: string
    sublabel: string
    done: boolean
    active: boolean
}) {
    return (
        <div
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-300"
            style={{
                background: active ? 'rgba(30,45,74,0.08)' : done ? 'rgba(92,120,85,0.04)' : 'rgba(15,24,40,0.02)',
                border: `1px solid ${active ? 'rgba(30,45,74,0.25)' : done ? 'rgba(92,120,85,0.15)' : 'rgba(15,24,40,0.05)'}`,
            }}>
            <div
                className="flex size-6 flex-shrink-0 items-center justify-center rounded-md"
                style={{
                    background: active ? 'rgba(30,45,74,0.2)' : done ? 'rgba(92,120,85,0.15)' : 'rgba(15,24,40,0.05)',
                    color: active ? '#A04A1F' : done ? '#5C7855' : '#8B96A8',
                }}>
                {active ? <Loader2 className="size-3.5 animate-spin" /> : done ? <CheckCircle2 className="size-3.5" /> : icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: active ? '#C5DEFF' : done ? '#8DCFC4' : '#8B96A8' }}>
                    {label}
                </p>
                {done && (
                    <p className="text-[10px] truncate" style={{ fontFamily: 'var(--font-mono-jb)', color: '#3A5A6E' }}>
                        {sublabel}
                    </p>
                )}
            </div>
        </div>
    )
}

function SpecialistChip({ label, running, done }: { label: string; running: boolean; done: boolean }) {
    return (
        <div
            className="flex flex-col items-center gap-1 rounded-lg py-2 px-1 text-center transition-all duration-300"
            style={{
                background: running ? 'rgba(30,45,74,0.08)' : done ? 'rgba(92,120,85,0.05)' : 'rgba(15,24,40,0.02)',
                border: `1px solid ${running ? 'rgba(30,45,74,0.25)' : done ? 'rgba(92,120,85,0.2)' : 'rgba(15,24,40,0.05)'}`,
            }}>
            <div style={{ color: running ? '#A04A1F' : done ? '#5C7855' : '#8B96A8' }}>
                {label === 'Metabolic' && <FlaskConical className="size-3.5 mx-auto" />}
                {label === 'Neurogenetic' && <Brain className="size-3.5 mx-auto" />}
                {label === 'Immunologic' && <HeartPulse className="size-3.5 mx-auto" />}
            </div>
            <span className="text-[10px] font-semibold" style={{ color: running ? '#A04A1F' : done ? '#5C7855' : '#8B96A8' }}>
                {label}
            </span>
            {running && <Loader2 className="size-2.5 animate-spin" style={{ color: '#1E2D4A' }} />}
            {done && <CheckCircle2 className="size-2.5" style={{ color: '#5C7855' }} />}
        </div>
    )
}

function HeroStat({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <div
                className="text-3xl font-bold tabular-nums md:text-4xl"
                style={{ fontFamily: 'var(--font-display)', color: '#EEF4FF' }}
                dangerouslySetInnerHTML={{ __html: value }}
            />
            <div className="mt-0.5 text-xs font-medium" style={{ color: '#6B7D93' }}>{label}</div>
        </div>
    )
}

/* ─── Slider ────────────────────────────────────────────────────── */
function SliderSection() {
    return (
        <section style={{ borderTop: '1px solid rgba(15,24,40,0.05)' }}>
            <div className="w-full px-[5%] py-8">
                <div className="flex flex-col items-center gap-4 md:flex-row md:gap-0">
                    <div className="flex-shrink-0 md:w-44 md:border-r md:pr-6" style={{ borderColor: 'rgba(15,24,40,0.07)' }}>
                        <p className="text-sm font-medium md:text-right" style={{ color: '#8B96A8' }}>Evidence sourced from</p>
                    </div>
                    <div className="relative w-full md:pl-6">
                        <InfiniteSlider speedOnHover={15} speed={35} gap={64}>
                            {['OMIM', 'Orphanet', 'HPO', 'PubMed', 'GeneReviews', 'IUIS', 'IEMbase', 'CDFD'].map((label) => (
                                <span
                                    key={label}
                                    className="text-sm font-semibold tracking-wide"
                                    style={{ color: '#3A5A72', fontFamily: 'var(--font-mono-jb)', whiteSpace: 'nowrap' }}>
                                    {label}
                                </span>
                            ))}
                        </InfiniteSlider>
                        <div className="absolute inset-y-0 left-0 w-16 pointer-events-none" style={{ background: 'linear-gradient(to right, #F5EFE3, transparent)' }} />
                        <div className="absolute inset-y-0 right-0 w-16 pointer-events-none" style={{ background: 'linear-gradient(to left, #F5EFE3, transparent)' }} />
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ─── Agent cards section ───────────────────────────────────────── */
const agents = [
    { icon: <Stethoscope className="size-5" />, step: '01', title: 'Common-disease screener', desc: 'Rules out malaria, TB, kala-azar, and nutritional causes before triggering the rare disease pathway.', model: 'Haiku 4.5', tier: 'fast' },
    { icon: <Dna className="size-5" />, step: '02', title: 'Phenotype extractor', desc: 'Free-text → structured HPO terms with onset, severity, and regression flags.', model: 'Haiku 4.5', tier: 'fast' },
    { icon: <FlaskConical className="size-5" />, step: '03', title: 'Metabolic specialist', desc: 'IEM-focused with Indian priors: Gaucher leads (11.2% of IEM burden), LSDs, organic acidemias, consanguinity-aware.', model: 'Opus 4.7', tier: 'deep' },
    { icon: <Brain className="size-5" />, step: '04', title: 'Neurogenetic specialist', desc: '48.9% of Indian rare disease burden. DMD (32.9%), trinucleotide repeats (27.3%), SMA (15.9%).', model: 'Opus 4.7', tier: 'deep' },
    { icon: <HeartPulse className="size-5" />, step: '05', title: 'Immunologic specialist', desc: 'PIDs and rare autoimmune. Recurrent infections pattern-matched against IUIS classification.', model: 'Opus 4.7', tier: 'deep' },
    { icon: <Microscope className="size-5" />, step: '06', title: 'Synthesizer', desc: 'Merges specialist reports, validates tool-backed claims, surfaces disagreements — the insight every other tool hides.', model: 'Opus 4.7', tier: 'synth' },
]

function AgentSection() {
    return (
        <section id="how-it-works" className="py-24" style={{ borderTop: '1px solid rgba(15,24,40,0.05)' }}>
            <div className="w-full px-[5%]">
                <div className="mb-14 w-full max-w-[60%]">
                    <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: '#8B96A8' }}>
                        How it works
                    </p>
                    <h2
                        className="mt-3 text-4xl md:text-5xl"
                        style={{ fontFamily: 'var(--font-display)', color: '#D8EEFF' }}>
                        Six agents. One case conference.
                    </h2>
                    <p className="mt-4 text-base leading-relaxed" style={{ color: '#6A8AAA' }}>
                        The fleet runs in hierarchical topology — screener and extractor first,
                        three specialists in parallel, synthesizer last. No adversarial agents.
                        Disagreement is real, not manufactured.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {agents.map((a, i) => (
                        <motion.div
                            key={a.step}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.4, delay: i * 0.06 }}
                            className="group relative rounded-2xl p-5 transition-all duration-300"
                            style={{
                                background: a.tier === 'deep'
                                    ? 'rgba(29,58,116,0.18)'
                                    : a.tier === 'synth'
                                    ? 'rgba(92,120,85,0.07)'
                                    : 'rgba(15,24,40,0.03)',
                                border: `1px solid ${a.tier === 'deep' ? 'rgba(30,45,74,0.18)' : a.tier === 'synth' ? 'rgba(92,120,85,0.2)' : 'rgba(15,24,40,0.07)'}`,
                            }}>
                            <div className="mb-4 flex items-center justify-between">
                                <div
                                    className="flex size-9 items-center justify-center rounded-xl"
                                    style={{
                                        background: a.tier === 'deep' ? 'rgba(30,45,74,0.15)' : a.tier === 'synth' ? 'rgba(92,120,85,0.12)' : 'rgba(15,24,40,0.06)',
                                        color: a.tier === 'deep' ? '#A04A1F' : a.tier === 'synth' ? '#5C7855' : '#8B96A8',
                                    }}>
                                    {a.icon}
                                </div>
                                <span
                                    className="text-xs font-bold"
                                    style={{ fontFamily: 'var(--font-mono-jb)', color: '#2E4E64' }}>
                                    {a.step}
                                </span>
                            </div>
                            <h3 className="text-base font-bold lg:text-lg" style={{ color: '#C5DEFF' }}>{a.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed" style={{ color: '#6B7D93' }}>{a.desc}</p>
                            <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(15,24,40,0.05)' }}>
                                <span
                                    className="text-xs font-medium"
                                    style={{ fontFamily: 'var(--font-mono-jb)', color: '#2E4E64' }}>
                                    Claude {a.model}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ─── Nav ───────────────────────────────────────────────────────── */
const menuItems = [
    { name: 'How it works', href: '#how-it-works' },
    { name: 'Demo', href: '/analyze?demo=gaucher' },
    { name: 'Platform', href: '#platform' },
]

function HeroHeader() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { scrollYProgress } = useScroll()

    useEffect(() => {
        return scrollYProgress.on('change', (v) => setScrolled(v > 0.04))
    }, [scrollYProgress])

    return (
        <header className="fixed top-0 z-50 w-full">
            <div
                className="transition-all duration-300"
                style={{
                    background: scrolled ? 'rgba(3,11,24,0.90)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(20px)' : 'none',
                    borderBottom: scrolled ? '1px solid rgba(15,24,40,0.05)' : '1px solid transparent',
                }}>
                <div className="w-full flex items-center justify-between px-[5%] py-4">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div
                            className="flex size-7 items-center justify-center rounded-lg"
                            style={{ background: 'linear-gradient(135deg, #1E2D4A, #5C7855)' }}>
                            <Dna className="size-4 text-white" />
                        </div>
                        <span className="text-base font-bold" style={{ color: '#0F1828' }}>Nidaan</span>
                    </Link>

                    <nav className="hidden items-center gap-8 lg:flex">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium transition-colors duration-150 hover:text-orange-700"
                                style={{ color: '#6B7D93' }}>
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        <RoleSwitcher />
                        <Link
                            href="/analyze"
                            className="rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #1E2D4A, #5C7855)', color: '#F5EFE3' }}>
                            Run Case
                        </Link>
                    </div>

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="lg:hidden"
                        style={{ color: '#6B7D93' }}>
                        {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden lg:hidden"
                            style={{ borderTop: '1px solid rgba(15,24,40,0.05)' }}>
                            <div className="px-[5%] pb-6 pt-4 space-y-4">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block text-sm font-medium"
                                        style={{ color: '#6A8AAA' }}
                                        onClick={() => setMenuOpen(false)}>
                                        {item.name}
                                    </Link>
                                ))}
                                <Link
                                    href="/analyze"
                                    className="inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
                                    style={{ background: 'linear-gradient(135deg, #1E2D4A, #5C7855)', color: '#F5EFE3' }}>
                                    Run Case
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}

/* ─── Four Actors section ───────────────────────────────────────── */
const ACTORS = [
    {
        role: 'Doctor',
        tagline: 'Diagnostic intelligence at the point of suspicion',
        steps: [
            'Paste a clinical case — free text, 10 minutes of notes, nothing structured required',
            '6 specialist agents run in parallel and return a ranked differential in under 90 seconds',
            'When test results confirm the diagnosis, record it in one modal — four fields',
            'Invite the patient and request a specialist consultation directly from the case view',
        ],
        cta: 'Run a case',
        href: '/analyze',
        secondaryCta: 'My cases',
        secondaryHref: '/doctor/cases',
        color: '#1E2D4A',
        bgColor: 'rgba(30,45,74,0.06)',
        borderColor: 'rgba(30,45,74,0.18)',
        icon: <Stethoscope className="size-6" />,
        stats: [
            { value: '6', label: 'specialist agents' },
            { value: '<90s', label: 'runtime' },
            { value: '5', label: 'demo cases' },
        ],
    },
    {
        role: 'Patient',
        tagline: 'Your diagnosis, in plain language',
        steps: [
            'Receive an SMS invite from your doctor after your diagnosis is confirmed',
            'Claim your account — see your condition explained in plain language, not clinical output',
            'Manage three consent toggles: epidemiology reporting, research cohort, research contact',
            'See how many others with your diagnosis are in India and join the community mailing list',
        ],
        cta: 'View patient record',
        href: '/patient/dashboard',
        secondaryCta: 'Manage consent',
        secondaryHref: '/patient/consent',
        color: '#5C7855',
        bgColor: 'rgba(92,120,85,0.05)',
        borderColor: 'rgba(92,120,85,0.18)',
        icon: <Users className="size-6" />,
        stats: [
            { value: '23', label: 'Gaucher patients in India' },
            { value: '3', label: 'consent controls' },
            { value: '∞', label: 'data is yours' },
        ],
    },
    {
        role: 'Government',
        tagline: 'The rare disease registry India needs',
        steps: [
            'Log in to the aggregate dashboard — no individual patient data, ever',
            'See confirmed case counts by disease category and geographic distribution by state',
            'Track diagnostic delay: median days from symptom onset to Nidaan analysis, by disease',
            'Export aggregate CSV for budget justification — one row per disease per state per quarter',
        ],
        cta: 'View dashboard',
        href: '/government/dashboard',
        secondaryCta: 'Export CSV',
        secondaryHref: '/government/dashboard',
        color: '#B8842A',
        bgColor: 'rgba(184,132,42,0.05)',
        borderColor: 'rgba(184,132,42,0.18)',
        icon: <BarChart3 className="size-6" />,
        stats: [
            { value: '47', label: 'confirmed cases (12 mo)' },
            { value: '4', label: 'dashboard panels' },
            { value: '0', label: 'individual rows shown' },
        ],
    },
    {
        role: 'Research Lab',
        tagline: 'Find the cohort you could not find before',
        steps: [
            'Query by disease, gene, state, and consent status — get a count in seconds',
            'Minimum 3-patient threshold enforced server-side — individual existence is never disclosed',
            'Submit a formal request with IRB reference — admin reviews, treating doctors re-confirm consent',
            'Receive de-identified data: age range, gender, HPO terms, confirmed variant, state — no names ever',
        ],
        cta: 'Query cohorts',
        href: '/research/query',
        secondaryCta: 'My requests',
        secondaryHref: '/research/requests',
        color: '#A04A1F',
        bgColor: 'rgba(160,74,31,0.05)',
        borderColor: 'rgba(160,74,31,0.18)',
        icon: <Search className="size-6" />,
        stats: [
            { value: '≥3', label: 'minimum cohort threshold' },
            { value: '0', label: 'PII ever shared' },
            { value: '5', label: 'queryable diseases' },
        ],
    },
]

function FourActorsSection() {
    return (
        <section id="platform" className="py-28" style={{ borderTop: '1px solid rgba(15,24,40,0.05)' }}>
            <div className="w-full px-[5%]">
                <div className="mb-16">
                    <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: '#8B96A8' }}>
                        The platform
                    </p>
                    <h2
                        className="mt-3 max-w-3xl text-4xl md:text-5xl"
                        style={{ fontFamily: 'var(--font-display)', color: '#D8EEFF' }}>
                        Four actors. One shared infrastructure.
                    </h2>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: '#6A8AAA' }}>
                        The GP who suspects rare disease. The patient who finally has a name for what is wrong. The government that needs epidemiology it cannot generate. The biologist who needs cohorts they cannot find. Nidaan is the connective tissue between all four.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {ACTORS.map((actor, i) => (
                        <motion.div
                            key={actor.role}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.45, delay: i * 0.08 }}
                            className="group relative flex flex-col rounded-2xl p-7"
                            style={{
                                background: actor.bgColor,
                                border: `1px solid ${actor.borderColor}`,
                            }}>
                            <div className="mb-5 flex items-start gap-4">
                                <div
                                    className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                                    style={{ background: `${actor.color}18`, color: actor.color }}>
                                    {actor.icon}
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: actor.color }}>
                                        {actor.role}
                                    </p>
                                    <p className="mt-0.5 text-base font-semibold" style={{ color: '#0F1828' }}>
                                        {actor.tagline}
                                    </p>
                                </div>
                            </div>

                            <ol className="mb-6 flex-1 space-y-2.5">
                                {actor.steps.map((step, j) => (
                                    <li key={j} className="flex items-start gap-3">
                                        <span
                                            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                                            style={{ background: `${actor.color}18`, color: actor.color }}>
                                            {j + 1}
                                        </span>
                                        <span className="text-sm leading-relaxed" style={{ color: '#6B7D93' }}>{step}</span>
                                    </li>
                                ))}
                            </ol>

                            <div className="mb-6 grid grid-cols-3 gap-3">
                                {actor.stats.map((s, j) => (
                                    <div
                                        key={j}
                                        className="rounded-xl p-3 text-center"
                                        style={{ background: 'rgba(15,24,40,0.03)', border: '1px solid rgba(15,24,40,0.06)' }}>
                                        <p className="text-xl font-bold" style={{ color: actor.color }}>{s.value}</p>
                                        <p className="mt-0.5 text-xs leading-tight" style={{ color: '#A0AAB8' }}>{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href={actor.href}
                                    className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                                    style={{
                                        background: `${actor.color}18`,
                                        border: `1px solid ${actor.color}40`,
                                        color: actor.color,
                                    }}>
                                    {actor.cta}
                                    <ArrowUpRight className="size-3.5" />
                                </Link>
                                <Link
                                    href={actor.secondaryHref}
                                    className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-orange-700"
                                    style={{ color: '#8B96A8' }}>
                                    {actor.secondaryCta}
                                    <ChevronRight className="size-3.5" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-10 rounded-2xl p-6 text-center"
                    style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.06)' }}>
                    <p className="text-base" style={{ color: '#6B7D93' }}>
                        No actor is asked to do anything they would not already want to do.{' '}
                        <span style={{ color: '#4A5D7A' }}>
                            Their collective participation creates something none of them could build alone.
                        </span>
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

/* ─── Footer ────────────────────────────────────────────────────── */
function LandingFooter() {
    const columns = [
        {
            heading: 'Diagnostic tool',
            links: [
                { label: 'Run case analysis', href: '/analyze' },
                { label: 'Gaucher demo', href: '/analyze?demo=gaucher' },
                { label: 'Sign up (doctor)', href: '/auth/signup' },
                { label: 'Sign in', href: '/auth/login' },
            ],
        },
        {
            heading: 'Platform',
            links: [
                { label: 'Doctor dashboard', href: '/doctor/cases' },
                { label: 'Specialist consultations', href: '/doctor/consultations' },
                { label: 'Patient record', href: '/patient/dashboard' },
                { label: 'Patient consent', href: '/patient/consent' },
            ],
        },
        {
            heading: 'Ecosystem',
            links: [
                { label: 'Government dashboard', href: '/government/dashboard' },
                { label: 'Research cohort query', href: '/research/query' },
                { label: 'Research requests', href: '/research/requests' },
                { label: 'Admin panel', href: '/admin/users' },
            ],
        },
    ]

    return (
        <footer className="py-16" style={{ borderTop: '1px solid rgba(15,24,40,0.06)' }}>
            <div className="w-full px-[5%]">
                <div className="mb-12 flex flex-wrap items-start justify-between gap-8">
                    <div className="max-w-xs">
                        <div className="mb-4 flex items-center gap-2.5">
                            <div
                                className="flex size-8 items-center justify-center rounded-lg"
                                style={{ background: 'linear-gradient(135deg, #1E2D4A, #5C7855)' }}>
                                <Dna className="size-4 text-white" />
                            </div>
                            <span className="text-base font-bold" style={{ color: '#0F1828' }}>Nidaan</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: '#A0AAB8' }}>
                            Rare disease diagnostic intelligence for first-line Indian physicians. Connecting patients, doctors, government, and biology — one confirmed diagnosis at a time.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-12">
                        {columns.map(col => (
                            <div key={col.heading}>
                                <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#A0AAB8' }}>
                                    {col.heading}
                                </p>
                                <ul className="space-y-2">
                                    {col.links.map(l => (
                                        <li key={l.label}>
                                            <Link
                                                href={l.href}
                                                className="text-sm transition-colors hover:text-orange-700"
                                                style={{ color: '#8B96A8' }}>
                                                {l.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className="flex flex-wrap items-center justify-between gap-4 pt-8 text-xs"
                    style={{ borderTop: '1px solid rgba(15,24,40,0.05)', color: '#A0AAB8' }}>
                    <p>© 2026 Nidaan · Built for the Anthropic Hackathon</p>
                    <p>Nidaan outputs are clinical decision-support tools, not diagnoses. Clinical judgment remains with the treating physician.</p>
                </div>
            </div>
        </footer>
    )
}
