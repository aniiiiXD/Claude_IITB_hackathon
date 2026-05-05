'use client';

import { motion } from 'motion/react';

const CREAM = '#F5EFE3';
const CREAM_LIGHT = '#FBF8F0';
const INK_900 = '#0F1828';
const INK_800 = '#1E2D4A';
const INK_500 = '#6B7D93';
const RUST = '#A04A1F';
const RUST_LIGHT = '#C46B3D';
const SAGE = '#5C7855';

/* ─── Public: section that drops onto landing or standalone page ── */

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-[5%] py-24" style={{ background: CREAM }}>
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest" style={{ color: RUST }}>
          How it works
        </p>
        <h2 className="text-4xl leading-tight md:text-5xl"
          style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
          The multi-agent topology:<br />a digital hospital board
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed" style={{ color: INK_500 }}>
          One clinical note. Three layers of reasoning. Six specialized models working
          in parallel — the way a teaching hospital&apos;s case conference actually runs,
          compressed from six weeks into six minutes.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 rounded-2xl px-4 py-8 md:px-10 md:py-12"
          style={{
            background: CREAM_LIGHT,
            border: `1px solid ${INK_900}15`,
            boxShadow: `0 2px 0 ${INK_900}08`,
          }}>
          <Topology />

          {/* Decorative squiggle */}
          <svg className="mt-8 h-8 w-full opacity-60" viewBox="0 0 1000 32" preserveAspectRatio="none">
            <path
              d="M 0 16 C 50 4, 100 28, 150 16 S 250 4, 300 16 S 400 28, 450 16 S 550 4, 600 16 S 700 28, 750 16 S 850 4, 900 16 L 1000 16"
              fill="none" stroke={RUST_LIGHT} strokeWidth="1.5" strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* Layer explanations */}
        <div className="mt-20 grid gap-12 md:grid-cols-3">
          <LayerExplain
            num="01"
            title="Screeners"
            model="Claude Haiku 4.5"
            description="Fast triage. The common-disease screener rules out malaria, TB, kala-azar — high-prevalence Indian conditions that look rare on a chart but aren't. The phenotype extractor maps the patient's free-text symptoms to formal HPO terms so the specialists speak the same language."
          />
          <LayerExplain
            num="02"
            title="Specialists"
            model="Claude Sonnet 4.6"
            description="Three sub-experts read the same case in parallel — Metabolic (lysosomal storage, IEM), Neurogenetic (SMA, DMD, mitochondrial), and Immunologic (PIDs, rare autoimmune). Each searches NCBI MedGen, Orphanet, and PubMed independently, then writes its own ranked differential."
          />
          <LayerExplain
            num="03"
            title="Synthesizer"
            model="Claude Opus 4.7"
            description="Reads all three specialist reports. Merges overlapping diagnoses, surfaces disagreements (where one specialist saw something the others missed), and proposes the single test cascade that resolves the question fastest."
          />
        </div>

        {/* Why it matters */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto mt-24 max-w-3xl text-center">
          <h3 className="text-3xl"
            style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
            Why three layers, not one model?
          </h3>
          <p className="mt-6 text-base leading-relaxed" style={{ color: INK_500 }}>
            A single model summarizing a case can miss things by averaging across specialties.
            Three specialists in parallel preserve disagreement — and disagreement is where
            rare disease diagnoses actually live. The synthesizer&apos;s job isn&apos;t to flatten
            disagreement; it&apos;s to make it visible to the doctor and propose the test
            that settles it.
          </p>
        </motion.div>
      </div>
    </section>
  );
}


/* ─── Topology diagram (single inline SVG, fits in viewBox) ────── */

export function Topology() {
  // viewBox: 1280 × 580 — wide enough that the synthesizer box doesn't clip
  const xClinical = 60;
  const xL1 = 250;
  const xL2 = 600;
  const xL3 = 950;

  const yClinical = 280;

  const yL1a = 200;
  const yL1b = 360;

  const yL2a = 130;
  const yL2b = 280;
  const yL2c = 430;

  const yL3 = 280;

  const boxW1 = 230;
  const boxH1 = 90;
  const boxW2 = 240;
  const boxH2 = 80;
  const boxW3 = 220;
  const boxH3 = 110;

  return (
    <svg
      viewBox="0 0 1280 580"
      className="block w-full h-auto"
      style={{ fontFamily: 'inherit' }}>
      <defs>
        <marker id="arrow-rust" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill={RUST} />
        </marker>
        <marker id="arrow-ink" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill={INK_800} />
        </marker>
        <marker id="arrow-sage" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill={SAGE} />
        </marker>
      </defs>

      {/* Layer headings */}
      <SvgHeading x={xL1 + boxW1 / 2} y={50} num="Layer 1" title="The Screeners" model="Claude Haiku 4.5" />
      <SvgHeading x={xL2 + boxW2 / 2} y={50} num="Layer 2" title="The Specialists" model="Claude Sonnet 4.6 · parallel" />
      <SvgHeading x={xL3 + boxW3 / 2} y={50} num="Layer 3" title="The Synthesizer" model="Claude Opus 4.7" />

      {/* Clinical Note icon */}
      <g transform={`translate(${xClinical - 30}, ${yClinical - 34})`}>
        <rect x="0" y="0" width="60" height="68" rx="4" ry="4"
          fill={CREAM} stroke={RUST} strokeWidth="1.5" />
        <line x1="12" y1="20" x2="48" y2="20" stroke={RUST} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="32" x2="48" y2="32" stroke={RUST} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="44" x2="36" y2="44" stroke={RUST} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="56" x2="42" y2="56" stroke={RUST} strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <text x={xClinical} y={yClinical + 56} textAnchor="middle"
        fill={INK_900} fontSize="13" fontWeight="500">
        Clinical Note
      </text>

      {/* Arrows: Clinical Note → Layer 1 */}
      <ArrowPath x1={xClinical + 30} y1={yClinical - 5} x2={xL1 - 6} y2={yL1a + boxH1 / 2}
        color={RUST} marker="arrow-rust" />
      <ArrowPath x1={xClinical + 30} y1={yClinical + 5} x2={xL1 - 6} y2={yL1b + boxH1 / 2}
        color={RUST} marker="arrow-rust" />

      {/* Layer 1 boxes */}
      <SvgBox x={xL1} y={yL1a} w={boxW1} h={boxH1}
        title="Common-disease screener"
        body="Rules out malaria, TB, and kala-azar."
        accent={RUST} />
      <SvgBox x={xL1} y={yL1b} w={boxW1} h={boxH1}
        title="Phenotype extractor"
        body="Maps free-text findings to Human Phenotype Ontology terms."
        accent={RUST} />

      {/* Arrows: Layer 1 → Layer 2 (cross pattern) */}
      {[yL2a + boxH2 / 2, yL2b + boxH2 / 2, yL2c + boxH2 / 2].map((targetY, i) => (
        <g key={`l1-${i}`}>
          <ArrowPath x1={xL1 + boxW1 + 4} y1={yL1a + boxH1 / 2} x2={xL2 - 6} y2={targetY}
            color={INK_800} marker="arrow-ink" />
          <ArrowPath x1={xL1 + boxW1 + 4} y1={yL1b + boxH1 / 2} x2={xL2 - 6} y2={targetY}
            color={INK_800} marker="arrow-ink" />
        </g>
      ))}

      {/* Layer 2 boxes */}
      <SvgBox x={xL2} y={yL2a} w={boxW2} h={boxH2}
        title="Metabolic"
        body="Lysosomal storage disorders, IEM, organic acidemias."
        accent={INK_800} />
      <SvgBox x={xL2} y={yL2b} w={boxW2} h={boxH2}
        title="Neurogenetic"
        body="SMA, DMD, mitochondrial diseases."
        accent={INK_800} />
      <SvgBox x={xL2} y={yL2c} w={boxW2} h={boxH2}
        title="Immunologic"
        body="Primary immunodeficiencies, rare autoimmune."
        accent={INK_800} />

      {/* Arrows: Layer 2 → Layer 3 */}
      <ArrowPath x1={xL2 + boxW2 + 4} y1={yL2a + boxH2 / 2} x2={xL3 - 6} y2={yL3 + boxH3 / 2}
        color={SAGE} marker="arrow-sage" />
      <ArrowPath x1={xL2 + boxW2 + 4} y1={yL2b + boxH2 / 2} x2={xL3 - 6} y2={yL3 + boxH3 / 2}
        color={SAGE} marker="arrow-sage" />
      <ArrowPath x1={xL2 + boxW2 + 4} y1={yL2c + boxH2 / 2} x2={xL3 - 6} y2={yL3 + boxH3 / 2}
        color={SAGE} marker="arrow-sage" />

      {/* Layer 3 box (synthesizer) */}
      <SvgBox x={xL3} y={yL3} w={boxW3} h={boxH3}
        title=""
        body="Merges specialist outputs into a single case conference report."
        accent={SAGE}
        muted />

      {/* Layer footer labels */}
      <text x={xL1 + boxW1 / 2} y={530} textAnchor="middle" fill={INK_500} fontSize="12">Layer 1</text>
      <text x={xL2 + boxW2 / 2} y={530} textAnchor="middle" fill={INK_500} fontSize="12">Layer 2</text>
      <text x={xL3 + boxW3 / 2} y={530} textAnchor="middle" fill={INK_500} fontSize="12">Layer 3</text>
    </svg>
  );
}


function SvgHeading({ x, y, num, title, model }: {
  x: number; y: number; num: string; title: string; model: string;
}) {
  return (
    <g>
      <text x={x} y={y} textAnchor="middle" fill={INK_500} fontSize="11"
        fontWeight="500" letterSpacing="2">
        {num.toUpperCase()}
      </text>
      <text x={x} y={y + 18} textAnchor="middle" fill={INK_900} fontSize="14" fontWeight="700">
        {title}
      </text>
      <text x={x} y={y + 34} textAnchor="middle" fill={INK_500} fontSize="11">
        ({model})
      </text>
    </g>
  );
}


function SvgBox({ x, y, w, h, title, body, accent, muted }: {
  x: number; y: number; w: number; h: number;
  title: string; body: string; accent: string; muted?: boolean;
}) {
  const lines = wrap(body, Math.floor(w / 7));
  const lineHeight = 14;
  const titleHeight = title ? 22 : 0;
  const startY = y + 26 + (h - titleHeight - lines.length * lineHeight) / 2;

  return (
    <g>
      <rect x={x + 3} y={y + 3} width={w} height={h} rx="3" ry="3"
        fill={accent} opacity="0.15" />
      <rect x={x} y={y} width={w} height={h} rx="3" ry="3"
        fill={CREAM_LIGHT} stroke={accent} strokeWidth={muted ? 1.5 : 2} />
      {title && (
        <text x={x + 12} y={y + 22} fill={accent} fontSize="13" fontWeight="700">
          {title}
        </text>
      )}
      {lines.map((line, i) => (
        <text key={i}
          x={x + 12}
          y={startY + i * lineHeight}
          fill={INK_900} fontSize="11.5">
          {line}
        </text>
      ))}
    </g>
  );
}


function ArrowPath({ x1, y1, x2, y2, color, marker }: {
  x1: number; y1: number; x2: number; y2: number; color: string; marker: string;
}) {
  const midX = (x1 + x2) / 2;
  const d = `M ${x1} ${y1} Q ${midX} ${y1}, ${midX} ${(y1 + y2) / 2} T ${x2} ${y2}`;
  return (
    <path d={d} fill="none" stroke={color} strokeWidth="1.3" strokeOpacity="0.85"
      markerEnd={`url(#${marker})`} />
  );
}


function wrap(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) lines.push(line);
  return lines;
}


function LayerExplain({ num, title, model, description }: {
  num: string; title: string; model: string; description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.05 * parseInt(num) }}
    >
      <p className="text-sm font-medium tracking-widest" style={{ color: RUST }}>
        {num}
      </p>
      <h4 className="mt-2 text-2xl"
        style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
        {title}
      </h4>
      <p className="mt-1 text-xs uppercase tracking-widest" style={{ color: INK_500 }}>
        {model}
      </p>
      <p className="mt-4 text-sm leading-relaxed" style={{ color: INK_900 }}>
        {description}
      </p>
    </motion.div>
  );
}
