'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Stethoscope, MessageSquarePlus, Search, BarChart3, X, Check, Network, Building2, FlaskConical, BadgeIndianRupee, AlertTriangle, Shield } from 'lucide-react';
import { RoleSwitcher } from '@/components/layout/role-switcher';
import { HowItWorksSection } from '@/components/landing/topology';

const CREAM = '#F5EFE3';
const CREAM_LIGHT = '#FBF8F0';
const INK_900 = '#0F1828';
const INK_800 = '#1E2D4A';
const INK_500 = '#6B7D93';
const RUST = '#A04A1F';
const RUST_LIGHT = '#C46B3D';
const SAGE = '#5C7855';

export function WarmLanding() {
  return (
    <div className="min-h-screen w-full" style={{ background: CREAM }}>
      <Header />
      <Hero />
      <StatsStrip />
      <FiveLinkChain />
      <SolutionSection />
      <GuardrailsSection />
      <HowWeFitSection />
      <HowItWorksSection />
      <RolesGrid />
      <Footer />
    </div>
  );
}

/* ─── Header ────────────────────────────────────────────── */

function Header() {
  return (
    <header className="px-[5%] py-5">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-2xl"
            style={{ color: INK_900, fontFamily: 'Instrument Serif, serif' }}>
            Nidaan
          </span>
          <span className="text-xs uppercase tracking-widest" style={{ color: RUST }}>
            India
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#how-it-works" className="text-sm transition-opacity hover:opacity-70"
            style={{ color: INK_900 }}>
            How it works
          </Link>
          <Link href="#guardrails" className="text-sm transition-opacity hover:opacity-70"
            style={{ color: INK_900 }}>
            Guardrails
          </Link>
          <Link href="/government/dashboard" className="text-sm transition-opacity hover:opacity-70"
            style={{ color: INK_900 }}>
            For government
          </Link>
          <Link href="/research/query" className="text-sm transition-opacity hover:opacity-70"
            style={{ color: INK_900 }}>
            For researchers
          </Link>
          <RoleSwitcher />
        </nav>
      </div>
    </header>
  );
}

/* ─── Hero — compact ─────────────────────────────────────── */

function Hero() {
  return (
    <section className="px-[5%] pt-16 pb-20 md:pt-20 md:pb-24">
      <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16 items-start">
        {/* Left column — pitch */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 text-xs font-medium uppercase tracking-[0.2em]"
            style={{ color: RUST }}>
            Rare-disease decision support · India
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl leading-[1.15] md:text-5xl lg:text-[3.5rem]"
            style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
            Six specialists. One clinical note.{' '}
            <span style={{ color: RUST }}>Six minutes to a differential.</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                background: INK_900,
                color: CREAM,
                boxShadow: `2px 2px 0 ${RUST}30`,
              }}>
              Run an analysis
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="#problem"
              className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-all hover:opacity-70"
              style={{ color: INK_500 }}>
              Why this exists ↓
            </Link>
          </motion.div>

          {/* Decorative squiggle */}
          <motion.svg
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 0.4, scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={{ transformOrigin: 'left center' }}
            className="mt-12 h-6 w-full max-w-md"
            viewBox="0 0 600 32"
            preserveAspectRatio="none">
            <path
              d="M 0 16 C 30 4, 60 28, 90 16 S 150 4, 180 16 S 240 28, 270 16 S 330 4, 360 16 S 420 28, 450 16 S 510 4, 540 16 L 600 16"
              fill="none" stroke={RUST_LIGHT} strokeWidth="1.5" strokeLinecap="round"
            />
          </motion.svg>
        </div>

        {/* Right column — Aanya vignette in Roboto Mono */}
        <AanyaVignette />
      </div>
    </section>
  );
}


/* ─── Real-case vignette — Arohi / Yogesh Kajabe ─────────── */

function AanyaVignette() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="relative rounded-md p-6 lg:p-7"
      style={{
        background: CREAM_LIGHT,
        border: `1px solid ${RUST}30`,
        boxShadow: `3px 3px 0 ${RUST}20`,
      }}>
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="size-4" style={{ color: RUST }} strokeWidth={1.5} />
        <p className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: RUST }}>
          A father&apos;s daughter · rural Maharashtra
        </p>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: INK_900 }}>
        <span className="font-semibold">Arohi had Gaucher disease type 1.</span>{' '}
        Two injections a month could have stopped it. Each injection: $1,200.
        Her father Yogesh, a daily-wage cotton farmer, sold his land and borrowed over $6,000.
        India&apos;s rare-disease scheme — ₹50 lakh per year per patient under{' '}
        <span className="font-semibold">NPRD 2021</span> — was supposed to cover it.
        Only 30% of applications get approved. His never did.
      </p>

      <blockquote className="my-5 border-l-2 pl-4 text-sm italic leading-relaxed"
        style={{ borderColor: RUST, color: INK_900 }}>
        &ldquo;My only child died before my eyes because I couldn&apos;t afford the medicines.&rdquo;
        <footer className="mt-2 not-italic text-xs" style={{ color: INK_500 }}>
          — Yogesh Kajabe
        </footer>
      </blockquote>

      <p className="text-xs leading-relaxed" style={{ color: INK_500 }}>
        The scheme existed. The medicine existed. The Centres of Excellence existed.
        Nothing reached Arohi.
      </p>

      <p className="mt-3 text-[10px]" style={{ color: INK_500 }}>
        Source: <em>Global Health NOW</em>, November 2025
      </p>

      {/* Real case tag */}
      <div className="absolute -right-2 -top-2 rotate-12 rounded-sm px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest"
        style={{ background: RUST, color: CREAM }}>
        Real case
      </div>
    </motion.aside>
  );
}


/* ─── Stats strip — hard numbers right under hero ─────────── */

function StatsStrip() {
  const stats = [
    { number: '30%', label: 'of children with rare disease die before age 5', sub: 'most undiagnosed', color: RUST },
    { number: '7 yrs', label: 'average time to diagnosis in India', sub: '4.7 yrs globally', color: RUST },
    { number: '30%', label: 'NPRD funding application approval rate', sub: 'rest stuck or rejected', color: INK_800 },
    { number: '₹2.93 L', label: 'raised on the official crowdfunding portal since 2021', sub: 'need: ₹91 billion', color: INK_800 },
    { number: '12', label: 'Centres of Excellence in India', sub: '20 of 28 states have none', color: SAGE },
  ];

  return (
    <section className="px-[5%] py-12"
      style={{ background: CREAM_LIGHT, borderTop: `1px solid ${INK_900}10`, borderBottom: `1px solid ${INK_900}10` }}>
      <div className="mx-auto max-w-7xl">
        <p className="mb-8 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: RUST }}>
          The numbers
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="border-l-2 pl-4"
              style={{ borderColor: s.color }}>
              <p className="text-4xl md:text-5xl"
                style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
                {s.number}
              </p>
              <p className="mt-2 text-xs leading-snug" style={{ color: INK_900 }}>
                {s.label}
              </p>
              <p className="mt-1 text-xs italic" style={{ color: INK_500 }}>
                {s.sub}
              </p>
            </motion.div>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-xs leading-relaxed italic" style={{ color: INK_500 }}>
          Yes, ~70 million Indians live with some form of rare disease — but most public conversation
          gets stuck on that headline. The numbers above are the ones that actually decide whether a
          child with a treatable disease lives or dies.
        </p>
      </div>
    </section>
  );
}


/* ─── Bullet section primitive ───────────────────────────── */

function BulletSection({
  id, eyebrow, eyebrowColor, heading, bullets, accentColor, icon: Icon, bgTone,
}: {
  id: string;
  eyebrow: string;
  eyebrowColor: string;
  heading: string;
  bullets: { strong: string; rest: string }[];
  accentColor: string;
  icon: React.ElementType;
  bgTone: 'cream' | 'cream-light';
}) {
  return (
    <section id={id} className="px-[5%] py-20"
      style={{
        background: bgTone === 'cream-light' ? CREAM_LIGHT : CREAM,
        borderTop: `1px solid ${INK_900}10`,
      }}>
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[280px_1fr]">
        {/* Eyebrow + heading */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-3">
            <Icon className="size-4" style={{ color: accentColor }} />
            <p className="text-xs font-medium uppercase tracking-[0.2em]"
              style={{ color: eyebrowColor }}>
              {eyebrow}
            </p>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl"
            style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
            {heading}
          </motion.h2>
        </div>

        {/* Bullets */}
        <ul className="space-y-5">
          {bullets.map((b, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex gap-4 border-l-2 pl-5"
              style={{ borderColor: accentColor }}>
              <div className="flex-1">
                <p className="text-base font-semibold leading-snug" style={{ color: INK_900 }}>
                  {b.strong}
                </p>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: INK_500 }}>
                  {b.rest}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}


/* ─── The Five-Link Chain — the centerpiece ─────────────── */

type ChainLinkData = {
  n: string;
  title: string;
  accent: string;
  tagline: string;
  thebreak: string;
  caseName: string;
  caseBody: string;
  caseQuote?: string;
  caseAttribution?: string;
  caseSource: string;
  stats: { num: string; label: string }[];
  nidaan: string;
};


function FiveLinkChain() {
  const links: ChainLinkData[] = [
    {
      n: '01',
      title: 'Recognition',
      accent: RUST,
      tagline: 'The doctor never thinks of it.',
      thebreak: 'A district-hospital GP sees one rare-disease patient a year. The textbook differential is malaria, TB, leukemia. The rare diagnosis isn\'t even on the list.',
      caseName: 'A 12-year-old girl, malaria-endemic India',
      caseBody: 'Splenomegaly, epistaxis, and recurrent fevers in a malaria-endemic region. Her positive malaria test "explained" the swollen spleen. Nobody ordered a bone-marrow biopsy or an enzyme assay. Gaucher disease was confirmed only years later.',
      caseSource: 'PMC10807272 / Dove Press',
      stats: [
        { num: '7 yrs', label: 'avg India delay' },
        { num: '43%', label: 'GPs never seen one' },
        { num: '31%', label: 'researchers can\'t name a delay' },
      ],
      nidaan: 'A 6-agent specialist conference at the first visit. The rare differential makes it onto the list before the patient is lost to follow-up.',
    },
    {
      n: '02',
      title: 'Confirmation',
      accent: INK_800,
      tagline: 'The lab is too far, or doesn\'t exist.',
      thebreak: 'Even when a doctor suspects rare disease, enzyme assays and gene sequencing live in five labs across the entire country — almost all in metros.',
      caseName: 'A 12-year-old boy, rural Maharashtra',
      caseBody: 'He presented at age 10 with ascites, jaundice, and Kayser-Fleischer rings — pathognomonic for Wilson\'s disease. The rural facility had no slit-lamp. He was misdiagnosed. The Wilson\'s diagnosis was confirmed at autopsy, two years later.',
      caseSource: 'Indian J. of Pathology and Oncology',
      stats: [
        { num: '5', label: 'enzyme labs in India' },
        { num: '125 km', label: 'avg travel to a CoE' },
        { num: '63%', label: 'Wilson\'s misdiagnosed' },
      ],
      nidaan: 'Routes the GP to the nearest accredited lab with sample-collection instructions, costs in ₹, and a pre-filled requisition form.',
    },
    {
      n: '03',
      title: 'Funding',
      accent: RUST,
      tagline: 'NPRD exists. The application gets stuck.',
      thebreak: 'NPRD 2021 promises ₹50 lakh per patient. The Centre of Excellence files the application. The Ministry of Health and Family Welfare approves three out of ten.',
      caseName: 'Arohi Kajabe, rural Maharashtra',
      caseBody: 'Gaucher disease type 1. Two ERT injections a month — at $1,200 each — would have stopped the progression. Her father Yogesh, a daily-wage cotton farmer, sold his land and borrowed over $6,000. The Ministry never approved the hospital\'s NPRD application. Arohi died.',
      caseQuote: 'My only child died before my eyes because I couldn\'t afford the medicines.',
      caseAttribution: '— Yogesh Kajabe',
      caseSource: 'Global Health NOW, November 2025',
      stats: [
        { num: '30%', label: 'NPRD approval rate' },
        { num: '₹50 L', label: 'cap (year 1 only)' },
        { num: '₹2.93 L', label: 'crowdfund total since 2021' },
      ],
      nidaan: 'Pre-fills the NPRD application from case data the moment a CoE specialist confirms the diagnosis. The gap between "eligible" and "applied" closes to zero.',
    },
    {
      n: '04',
      title: 'Drug access',
      accent: INK_800,
      tagline: 'The medicine costs more than the cap.',
      thebreak: '₹50 lakh sounds like a lot until the drug is ₹1.8 crore a year. Indian manufacturers export the active ingredients; foreign companies sell the finished drug back at imported-drug prices. There is no domestic orphan-drug pathway.',
      caseName: 'Shaurya Singh, 13',
      caseBody: 'Hunter Syndrome — a treatable lysosomal disorder that destroys the brain and organs without enzyme replacement. He waited years for treatment that never came. He died in August 2025. A cross-party group of 45 doctor-MPs has reported that other previously-stabilised children are now relapsing as the ₹50-lakh cap exhausts.',
      caseSource: 'Global Health NOW, November 2025',
      stats: [
        { num: '₹1.8 Cr', label: 'eliglustat / yr' },
        { num: '95%+', label: 'priced out' },
        { num: '0', label: 'domestic producers' },
      ],
      nidaan: 'Surfaces the drug, the import status, manufacturer-supply pathways, the cost, and eligible top-up schemes — in the same report as the diagnosis.',
    },
    {
      n: '05',
      title: 'Time',
      accent: SAGE,
      tagline: 'Even when the chain holds, time runs out.',
      thebreak: 'Diagnosis is not the finish line. The infusion centre is hours away. The equipment fails. The fund release is delayed. Every hour the chain holds, the patient is alive.',
      caseName: 'Nidhi Shirol — India\'s first known Pompe patient',
      caseBody: 'Diagnosed at age 7 after her parents visited 40+ hospitals across India. Samples were sent to Delhi, then to the Netherlands. Treatment access was secured only via a free-supply programme from the manufacturer. She lived a normal childhood for ten years on enzyme replacement therapy. At a college event, the UPS battery on her ventilator failed silently. She died in 2017, aged 24, from a preventable equipment failure. Her father Prasanna co-founded ORDI — India\'s first rare-disease patient advocacy organisation.',
      caseSource: 'The Indian Express · SCMP · The Better India',
      stats: [
        { num: '30%', label: 'children die before age 5' },
        { num: '69%', label: 'rural ERT missed during COVID' },
        { num: '1', label: 'reason: time' },
      ],
      nidaan: 'Compresses Links 1–4 into a single afternoon. Diagnosis at the first visit. The funding application is drafted by the time the patient leaves the room.',
    },
  ];

  return (
    <section id="the-chain" className="px-[5%] py-24"
      style={{ background: CREAM, borderTop: `1px solid ${INK_900}10` }}>
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: RUST }}>
          The five-link chain
        </p>
        <h2 className="text-3xl md:text-5xl"
          style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
          Five things must hold for one patient to live.<br />
          <span style={{ color: RUST }}>India breaks all five by default.</span>
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-relaxed" style={{ color: INK_500 }}>
          A treatable rare disease in India is not primarily a medical problem. It is a logistics
          problem dressed up as a medical one. There are five sequential failures between a child&apos;s
          first symptom and the medicine that saves them. Any single break in this chain is fatal.
        </p>

        <div className="mt-16 space-y-6">
          {links.map((link, i) => (
            <ChainLinkCard key={link.n} link={link} index={i} isLast={i === links.length - 1} />
          ))}
        </div>

        {/* Closer */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-md p-8 text-center"
          style={{
            background: CREAM_LIGHT,
            border: `1.5px solid ${RUST}`,
            boxShadow: `3px 3px 0 ${RUST}30`,
          }}>
          <p className="text-xl leading-relaxed md:text-2xl"
            style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
            The funding exists. The labs exist. The specialists exist. The legal precedent exists.{' '}
            <span style={{ color: RUST, fontStyle: 'italic' }}>
              Nidaan is the connective tissue between them.
            </span>
          </p>
          <p className="mt-4 text-xs leading-relaxed" style={{ color: INK_500 }}>
            <em>Master Arnesh Shaw v. Union of India</em> — Delhi High Court, October 2024 — established the
            legal obligation to provide rare-disease care. The Supreme Court hears the Union government&apos;s
            appeal in March 2026. The clinical infrastructure to act on a favourable ruling does not yet exist.
            That is the gap we&apos;re building into.
          </p>
        </motion.div>
      </div>
    </section>
  );
}


function ChainLinkCard({ link, index, isLast }: {
  link: ChainLinkData;
  index: number;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay: index * 0.05 }}
      className="relative grid gap-6 rounded-md p-6 md:grid-cols-[160px_1fr] md:gap-8 md:p-8"
      style={{
        background: CREAM_LIGHT,
        border: `1px solid ${link.accent}30`,
        boxShadow: `2px 2px 0 ${link.accent}20`,
      }}>
      {/* Left rail — link number + title + tagline */}
      <div className="flex flex-col">
        <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: link.accent }}>
          Link {link.n}
        </p>
        <h3 className="mt-2 text-3xl"
          style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
          {link.title}
        </h3>
        <p className="mt-3 text-sm italic leading-relaxed" style={{ color: INK_500 }}>
          {link.tagline}
        </p>

        {/* Dashed connector down to next link */}
        {!isLast && (
          <div className="mt-6 hidden md:block">
            <svg width="2" height="60" className="opacity-40">
              <line x1="1" y1="0" x2="1" y2="60" stroke={link.accent} strokeWidth="2" strokeDasharray="2 4" />
            </svg>
          </div>
        )}
      </div>

      {/* Right rail — break, case, stats, nidaan */}
      <div className="space-y-5">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: link.accent }}>
            What breaks
          </p>
          <p className="text-sm leading-relaxed" style={{ color: INK_900 }}>
            {link.thebreak}
          </p>
        </div>

        <div className="rounded-md p-4"
          style={{ background: CREAM, border: `1px dashed ${link.accent}40` }}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: link.accent }}>
            Real case · {link.caseName}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: INK_900 }}>
            {link.caseBody}
          </p>
          {link.caseQuote && (
            <blockquote className="mt-3 border-l-2 pl-3 text-sm italic"
              style={{ borderColor: link.accent, color: INK_900 }}>
              &ldquo;{link.caseQuote}&rdquo;
              <footer className="mt-1 not-italic text-xs" style={{ color: INK_500 }}>
                {link.caseAttribution}
              </footer>
            </blockquote>
          )}
          <p className="mt-3 text-[10px]" style={{ color: INK_500 }}>
            Source: <em>{link.caseSource}</em>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {link.stats.map((s, i) => (
            <div key={i} className="border-l-2 pl-3" style={{ borderColor: link.accent }}>
              <p className="text-xl"
                style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
                {s.num}
              </p>
              <p className="text-[10px] leading-tight" style={{ color: INK_500 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-md p-3"
          style={{ background: `${SAGE}10`, border: `1px solid ${SAGE}30` }}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: SAGE }}>
            Where Nidaan holds the link
          </p>
          <p className="text-sm leading-relaxed" style={{ color: INK_900 }}>
            {link.nidaan}
          </p>
        </div>
      </div>
    </motion.div>
  );
}


/* ─── Solution ───────────────────────────────────────────── */

function SolutionSection() {
  return (
    <BulletSection
      id="solution"
      eyebrow="The solution"
      eyebrowColor={SAGE}
      icon={Check}
      heading="Convene the case conference at the point of care."
      accentColor={SAGE}
      bgTone="cream"
      bullets={[
        {
          strong: 'One clinical note in. Six AI specialists out.',
          rest: 'A common-disease screener, a phenotype extractor, three sub-specialists running in parallel, and a synthesizer that merges their reports — six minutes start-to-finish.',
        },
        {
          strong: 'Backed by real medical data.',
          rest: 'Every claim is traced back to NCBI MedGen, the Human Phenotype Ontology, and PubMed citations. No hallucinated diseases, no made-up genes.',
        },
        {
          strong: 'Specialist disagreement is the feature.',
          rest: 'When the metabolic and neurogenetic agents disagree on a diagnosis, the synthesizer surfaces it — and proposes the single test that resolves it.',
        },
        {
          strong: 'The next step is built in.',
          rest: 'Ranked differential, the test to order with cost, the specialist to refer to, and the nearest Centre of Excellence with directions — all in the same report.',
        },
      ]}
    />
  );
}


/* ─── Guardrails — what if it goes wrong ─────────────────── */

type Guardrail = { title: string; body: string };

function GuardrailsSection() {
  const guardrails: Guardrail[] = [
    {
      title: 'Every irreversible action is human.',
      body: 'AI drafts. Doctor confirms. Specialist signs. The patient sees the doctor\'s confirmation — never raw model output. The AI is the resident who reads the chart and presents the case. The attending is still a human.',
    },
    {
      title: 'No diagnosis. Only a differential with evidence.',
      body: 'Every disease ships with the HPO terms, MedGen IDs, and PubMed citations that produced it. If a tool wasn\'t called, the claim doesn\'t ship. Confidence scores live next to their citations, not on their own.',
    },
    {
      title: 'Disagreement is the headline, not buried.',
      body: 'Where the metabolic, neurogenetic, and immunologic agents disagreed — and the single test that resolves the disagreement — is the first thing the doctor sees. Hidden disagreement is the easiest way to launder false confidence.',
    },
    {
      title: 'A test sits between the AI and any treatment.',
      body: 'The recommended next step is always a confirmatory assay or gene panel — never a drug order. The ₹2,500 β-glucocerebrosidase enzyme assay sits between the synthesizer\'s guess and any ERT.',
    },
    {
      title: 'The patient never sees raw model output.',
      body: 'Patients see status updates while the case moves and the doctor\'s confirmed diagnosis when it\'s ready. The synthesizer\'s draft is never exposed. The "Confirm Diagnosis" action gates the handoff, with an audit log.',
    },
    {
      title: 'Cohort floor protects ultra-rare patients.',
      body: 'Researcher queries returning fewer than five patients return "insufficient cohort" — not a count. Re-identifying a single Mizoram Gaucher case from a return value of "1" is the failure we refuse to ship. Geography is bucketed at state level by default.',
    },
  ];

  return (
    <section
      id="guardrails"
      className="px-[5%] py-20"
      style={{ background: CREAM_LIGHT, borderTop: `1px solid ${INK_900}10` }}>
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-3 flex items-center gap-2">
          <Shield className="size-4" style={{ color: RUST }} strokeWidth={1.5} />
          <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: RUST }}>
            What if it goes wrong
          </p>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl"
          style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
          Six guardrails between<br />the AI and a wrong decision.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 max-w-3xl text-base leading-relaxed"
          style={{ color: INK_500 }}>
          A treatable rare-disease patient has fewer chances than the average patient — being
          wrong here costs more. The single design rule:{' '}
          <span style={{ color: INK_900, fontStyle: 'italic' }}>
            every irreversible action is taken by a human, not the AI.
          </span>
        </motion.p>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {guardrails.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i }}
              className="rounded-md p-6"
              style={{
                background: CREAM,
                border: `1px solid ${RUST}25`,
                boxShadow: `2px 2px 0 ${RUST}15`,
              }}>
              <div className="mb-3 flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: RUST }}>
                  Guardrail · 0{i + 1}
                </p>
              </div>
              <h3
                className="mb-2 text-xl leading-snug"
                style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
                {g.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: INK_500 }}>
                {g.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* What we haven't solved — radical honesty box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 rounded-md p-6"
          style={{
            background: CREAM,
            border: `1.5px dashed ${INK_800}50`,
          }}>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: INK_800 }}>
            What we haven&apos;t solved yet
          </p>
          <p className="text-sm leading-relaxed" style={{ color: INK_900 }}>
            Differential privacy for cohort queries (we have a floor; we need an ε-budget).
            Voice and vernacular input for patients without text literacy. Consent revocation
            that retroactively scrubs aggregates. Dataset bias correction by partnering with
            Indian rare-disease registries. We&apos;d rather be wrong publicly than silently —
            the full audit, including ten failure modes with mitigations, lives in{' '}
            <Link
              href="https://github.com/aniiiiXD/Claude_IITB_hackathon/blob/main/docs/risks-and-ethics.md"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-opacity hover:opacity-70"
              style={{ color: RUST }}>
              docs/risks-and-ethics.md
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </section>
  );
}


/* ─── How we fit in ──────────────────────────────────────── */

function HowWeFitSection() {
  return (
    <BulletSection
      id="how-we-fit"
      eyebrow="How Nidaan fits"
      eyebrowColor={INK_800}
      icon={Network}
      heading="One system. Everyone in the loop."
      accentColor={INK_800}
      bgTone="cream-light"
      bullets={[
        {
          strong: 'The patient writes in plain language.',
          rest: '"Belly feels swollen, bruises with no reason, bone pain at night." No medical jargon required.',
        },
        {
          strong: 'The GP adds clinical findings.',
          rest: 'Examination, labs, family history. Then triggers the AI conference with one click.',
        },
        {
          strong: 'The AI does the heavy lifting.',
          rest: 'Six agents in parallel, citing real databases, returning a structured differential the doctor can review and confirm.',
        },
        {
          strong: 'Specialist consult, only if needed.',
          rest: 'The GP can route the case to a metabolic geneticist, neurogeneticist, or immunologist — they see the patient text, AI report, and disagreements upfront.',
        },
        {
          strong: 'Government sees aggregate, never individuals.',
          rest: 'Every confirmed case (with patient consent) feeds anonymised state- and disease-level epidemiology to the Ministry of Health.',
        },
        {
          strong: 'Researchers query consented cohorts.',
          rest: 'Approved labs can ask "how many GBA Gaucher patients in Maharashtra?" — counts only, never identifying records, with a minimum-cohort floor for privacy.',
        },
      ]}
    />
  );
}

/* ─── Roles grid ─────────────────────────────────────────── */

function RolesGrid() {
  const roles = [
    {
      icon: Stethoscope,
      title: 'For doctors',
      body: 'Submit a free-text clinical note. Receive a ranked differential, the next test to order, and which specialist to refer to — backed by HPO, MedGen and PubMed citations.',
      cta: 'Open analyze',
      href: '/analyze',
    },
    {
      icon: MessageSquarePlus,
      title: 'For patients',
      body: 'Describe what you\'re experiencing in your own words. Your doctor adds clinical observations, then the AI does the heavy lifting. Track status updates as your case moves.',
      cta: 'Submit symptoms',
      href: '/patient/submit',
    },
    {
      icon: Search,
      title: 'For researchers',
      body: 'Search consented patient cohorts by disease, gene, or geography. Cohort counts only — never individual records. Submit formal data requests through the admin pipeline.',
      cta: 'Run cohort query',
      href: '/research/query',
    },
    {
      icon: BarChart3,
      title: 'For government',
      body: 'Aggregate epidemiology by state, disease category and quarter. Diagnostic delay metrics. Treatment access gaps. Centre of Excellence coverage. CSV export for policy work.',
      cta: 'Open dashboard',
      href: '/government/dashboard',
    },
  ];

  return (
    <section className="px-[5%] py-24">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest" style={{ color: RUST }}>
          Built for everyone in the loop
        </p>
        <h2 className="mb-16 text-4xl md:text-5xl"
          style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
          One system. Four perspectives.
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {roles.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-md p-6 transition-all hover:translate-y-[-2px]"
                style={{
                  background: CREAM_LIGHT,
                  border: `1px solid ${INK_900}15`,
                  boxShadow: `2px 2px 0 ${INK_900}10`,
                }}>
                <div className="flex size-10 items-center justify-center rounded-md mb-4"
                  style={{ background: `${RUST}15`, color: RUST }}>
                  <Icon className="size-5" />
                </div>
                <h3 className="text-2xl mb-2"
                  style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
                  {r.title}
                </h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: INK_500 }}>
                  {r.body}
                </p>
                <Link href={r.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: RUST }}>
                  {r.cta}
                  <ArrowRight className="size-3.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="px-[5%] py-10"
      style={{ borderTop: `1px solid ${INK_900}15`, background: CREAM_LIGHT }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs"
        style={{ color: INK_500 }}>
        <p>
          Nidaan · A multi-agent clinical decision support tool for first-line Indian physicians
        </p>
        <p>
          Built with <span style={{ color: SAGE }}>Claude Haiku, Sonnet & Opus</span> · NCBI MedGen · HPO · PubMed
        </p>
      </div>
    </footer>
  );
}
