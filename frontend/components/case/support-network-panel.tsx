'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown, BadgeIndianRupee, Building2, FlaskConical, Users,
  ExternalLink, AlertCircle, CheckSquare, XSquare, Phone, Mail, Scale, ArrowRight,
} from 'lucide-react';
import { findApplicableSchemes, schemesByCategory, type Scheme, type SchemeCategory } from '@/lib/schemes';
import { getTipsForScheme, GENERIC_TIPS } from '@/lib/scheme-tips';
import { findAdvocacyOrgs, findSpecialists, LEGAL_RESOURCES } from '@/lib/connections';

const CREAM = '#F5EFE3';
const CREAM_LIGHT = '#FBF8F0';
const INK_900 = '#0F1828';
const INK_500 = '#6B7D93';
const INK_400 = '#8B96A8';
const RUST = '#A04A1F';
const SAGE = '#5C7855';
const PURPLE = '#8B6C9C';
const OCHRE = '#B8842A';

const CATEGORY_META: Record<SchemeCategory, {
  label: string;
  icon: React.ElementType;
  color: string;
  intro: string;
}> = {
  central:      { label: 'Central government schemes', icon: BadgeIndianRupee, color: OCHRE, intro: 'NPRD, PM-JAY, ICMR — apply through your CoE specialist.' },
  state:        { label: 'State government schemes',   icon: Building2,        color: SAGE,  intro: 'Top-up cover above central schemes for residents of your state.' },
  pharma:       { label: 'Manufacturer programs',      icon: FlaskConical,     color: RUST,  intro: 'Free / subsidised drug access from Sanofi, Takeda, Roche, Novartis, BioMarin.' },
  advocacy:     { label: 'Patient advocacy funds',     icon: Users,            color: PURPLE,intro: 'Disease-specific organisations with direct manufacturer relationships.' },
  tax:          { label: 'Tax benefits',                icon: Scale,           color: INK_900, intro: 'Income-tax deductions for treatment expenses.' },
  crowdfunding: { label: 'Crowdfunding platforms',     icon: Users,            color: RUST,  intro: 'Vetted platforms with rare-disease verification pipelines.' },
};


export function SupportNetworkPanel({ omimId, state }: {
  omimId: string | null;
  state: string | null;
}) {
  const schemes = findApplicableSchemes({ omimId, state });
  const grouped = schemesByCategory(schemes);
  const advocacyOrgs = findAdvocacyOrgs(omimId);
  const specialists = findSpecialists(omimId);

  return (
    <div className="overflow-hidden rounded-xl"
      style={{ background: CREAM_LIGHT, border: '1px solid rgba(160,74,31,0.2)' }}>
      <div className="px-5 py-3"
        style={{ background: 'rgba(139,108,156,0.06)', borderBottom: '1px solid rgba(139,108,156,0.15)' }}>
        <div className="flex items-center gap-2">
          <Users className="size-4" style={{ color: PURPLE }} />
          <span className="text-sm font-semibold" style={{ color: INK_900 }}>
            Your support network
          </span>
          <span className="text-xs" style={{ color: INK_500 }}>
            — every scheme, every contact, every escalation pathway for this diagnosis
          </span>
        </div>
      </div>

      <div className="px-5 py-5 space-y-6">
        {/* Schemes — by category */}
        <section>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: INK_500 }}>
            Funding & assistance · {schemes.length} schemes apply
          </h3>
          <div className="space-y-2">
            {(Object.keys(grouped) as SchemeCategory[])
              .filter(k => grouped[k].length > 0)
              .map(cat => (
                <SchemeCategoryGroup
                  key={cat}
                  category={cat}
                  schemes={grouped[cat]}
                />
              ))}
          </div>
        </section>

        {/* Advocacy contacts */}
        {advocacyOrgs.length > 0 && (
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: INK_500 }}>
              People who can help · disease-specific advocacy
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {advocacyOrgs.map(org => (
                <div key={org.id}
                  className="rounded-md p-4"
                  style={{ background: CREAM, border: `1px solid ${PURPLE}30` }}>
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: INK_900 }}>
                      {org.name}
                    </p>
                    <a href={org.url} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 transition-opacity hover:opacity-70" style={{ color: PURPLE }}>
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                  <p className="text-xs italic" style={{ color: INK_500 }}>{org.scope}</p>
                  {org.notableFigure && (
                    <p className="mt-1 text-[11px]" style={{ color: INK_500 }}>
                      <span style={{ color: PURPLE }}>Founded by:</span> {org.notableFigure}
                    </p>
                  )}
                  <ul className="mt-2 space-y-0.5 text-[11px] leading-snug" style={{ color: INK_900 }}>
                    {org.helpsWith.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span style={{ color: PURPLE }}>›</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  {(org.phone || org.email) && (
                    <div className="mt-3 flex flex-wrap gap-3 text-[11px]" style={{ color: INK_500 }}>
                      {org.phone && (
                        <a href={`tel:${org.phone.replace(/\s/g, '')}`}
                          className="flex items-center gap-1 transition-opacity hover:opacity-70">
                          <Phone className="size-3" />
                          {org.phone}
                        </a>
                      )}
                      {org.email && (
                        <a href={`mailto:${org.email}`}
                          className="flex items-center gap-1 transition-opacity hover:opacity-70">
                          <Mail className="size-3" />
                          {org.email}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CoE specialists */}
        {specialists.length > 0 && (
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: INK_500 }}>
              Specialists with track records for this disease
            </h3>
            <div className="grid gap-2 md:grid-cols-2">
              {specialists.slice(0, 4).map(s => (
                <div key={s.id}
                  className="rounded-md p-3"
                  style={{ background: CREAM, border: `1px solid ${INK_900}15` }}>
                  <p className="text-sm font-semibold" style={{ color: INK_900 }}>{s.name}</p>
                  <p className="mt-0.5 text-[11px]" style={{ color: INK_500 }}>
                    {s.city}, {s.state}
                  </p>
                  <ul className="mt-2 space-y-0.5 text-[11px] leading-snug" style={{ color: INK_900 }}>
                    {s.receives.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span style={{ color: SAGE }}>›</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Legal escalation */}
        <section className="rounded-md p-4"
          style={{ background: 'rgba(160,74,31,0.04)', border: `1px dashed ${RUST}40` }}>
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: RUST }}>
            <Scale className="size-3.5" />
            If everything else fails · the legal pathway
          </h3>
          <p className="mb-3 text-xs leading-relaxed" style={{ color: INK_900 }}>
            After Master Arnesh Shaw v. Union of India (Delhi HC, Oct 2024), the courts have established that
            cost cannot deny life-saving treatment access. Patients have successfully obtained court-ordered
            funding when NPRD applications stall. The pathway:
          </p>
          <ol className="space-y-1 text-[11px] leading-relaxed" style={{ color: INK_500 }}>
            <li className="flex gap-2"><span style={{ color: RUST, fontWeight: 700 }}>1.</span><span>Document the NPRD rejection or stalling (request rejection in writing)</span></li>
            <li className="flex gap-2"><span style={{ color: RUST, fontWeight: 700 }}>2.</span><span>Contact ORDI (+91-77603-77767) for legal-referral pathway</span></li>
            <li className="flex gap-2"><span style={{ color: RUST, fontWeight: 700 }}>3.</span><span>File a writ petition in your jurisdictional High Court citing Mohd Ahmed (2014) + Arnesh Shaw (2024) precedents</span></li>
            <li className="flex gap-2"><span style={{ color: RUST, fontWeight: 700 }}>4.</span><span>Most petitions get interim orders within 2–4 weeks for life-threatening cases</span></li>
          </ol>
          <div className="mt-3 grid gap-1.5">
            {LEGAL_RESOURCES.map(r => (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between rounded px-2 py-1.5 transition-opacity hover:opacity-70"
                style={{ background: 'rgba(160,74,31,0.06)' }}>
                <span className="text-[11px]" style={{ color: INK_900 }}>
                  <span className="font-semibold">{r.name}</span>
                  <span style={{ color: INK_500 }}> · {r.scope}</span>
                </span>
                <ExternalLink className="size-3" style={{ color: RUST }} />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


/* ─── Per-category accordion ─────────────────────────────── */

function SchemeCategoryGroup({ category, schemes }: { category: SchemeCategory; schemes: Scheme[] }) {
  const [open, setOpen] = useState(category === 'central'); // open central by default
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <div className="rounded-md overflow-hidden"
      style={{ background: CREAM, border: `1px solid ${meta.color}20` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-black/[0.02]">
        <div className="flex items-center gap-2.5">
          <Icon className="size-4" style={{ color: meta.color }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: INK_900 }}>
              {meta.label}
              <span className="ml-2 text-xs font-normal" style={{ color: INK_500 }}>
                · {schemes.length} {schemes.length === 1 ? 'scheme' : 'schemes'}
              </span>
            </p>
            <p className="text-[11px]" style={{ color: INK_500 }}>{meta.intro}</p>
          </div>
        </div>
        <ChevronDown className="size-4 transition-transform"
          style={{ color: INK_400, transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="border-t px-4 py-3 space-y-3" style={{ borderColor: `${meta.color}15` }}>
              {schemes.map(s => <SchemeRow key={s.id} scheme={s} accent={meta.color} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


/* ─── Single scheme row with expandable tips ─────────────── */

function SchemeRow({ scheme, accent }: { scheme: Scheme; accent: string }) {
  const [tipsOpen, setTipsOpen] = useState(false);
  const tips = getTipsForScheme(scheme.id) ?? GENERIC_TIPS;

  return (
    <div className="rounded p-3"
      style={{ background: CREAM_LIGHT, border: `1px solid ${accent}15` }}>
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: INK_900 }}>
            {scheme.shortName}
            <span className="ml-2 text-[11px] font-medium" style={{ color: accent }}>
              · {scheme.amount}
            </span>
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: INK_500 }}>
            {scheme.description}
          </p>
          {(scheme.processingTime || scheme.approvalRate) && (
            <div className="mt-1.5 flex flex-wrap gap-3 text-[10px]" style={{ color: INK_400 }}>
              {scheme.processingTime && (
                <span>Time: <span style={{ color: INK_500 }}>{scheme.processingTime}</span></span>
              )}
              {scheme.approvalRate && (
                <span>Approval: <span style={{ color: INK_500 }}>{scheme.approvalRate}</span></span>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a href={scheme.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-opacity hover:opacity-70"
            style={{ background: `${accent}15`, color: accent }}>
            Apply
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>

      {/* Tips toggle */}
      <button
        onClick={() => setTipsOpen(o => !o)}
        className="mt-2 flex items-center gap-1 text-[10px] font-medium transition-opacity hover:opacity-70"
        style={{ color: accent }}>
        <ChevronDown className="size-3 transition-transform"
          style={{ transform: tipsOpen ? 'rotate(180deg)' : 'none' }} />
        How to make this application strong
      </button>

      <AnimatePresence>
        {tipsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="mt-3 space-y-3 border-t pt-3 text-[11px]" style={{ borderColor: `${accent}15`, color: INK_900 }}>
              {tips.documentsRequired.length > 0 && (
                <div>
                  <p className="mb-1 font-semibold" style={{ color: accent }}>📋 Documents to gather first</p>
                  <ul className="space-y-0.5 pl-1">
                    {tips.documentsRequired.map((d, i) => (
                      <li key={i} className="flex gap-1.5"><CheckSquare className="mt-0.5 size-3 shrink-0" style={{ color: accent }} /><span>{d}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {tips.strengtheningTips.length > 0 && (
                <div>
                  <p className="mb-1 font-semibold" style={{ color: SAGE }}>✓ How to strengthen your application</p>
                  <ul className="space-y-0.5 pl-1">
                    {tips.strengtheningTips.map((t, i) => (
                      <li key={i} className="flex gap-1.5"><span style={{ color: SAGE }}>›</span><span>{t}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {tips.commonRejectionReasons.length > 0 && (
                <div>
                  <p className="mb-1 font-semibold" style={{ color: RUST }}>✗ Why applications get rejected</p>
                  <ul className="space-y-0.5 pl-1">
                    {tips.commonRejectionReasons.map((r, i) => (
                      <li key={i} className="flex gap-1.5"><XSquare className="mt-0.5 size-3 shrink-0" style={{ color: RUST }} /><span>{r}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {tips.escalationPath.length > 0 && (
                <div>
                  <p className="mb-1 font-semibold" style={{ color: PURPLE }}>📞 If stuck or rejected, escalate to:</p>
                  <ol className="space-y-0.5 pl-1">
                    {tips.escalationPath.map((e, i) => (
                      <li key={i} className="flex gap-1.5"><ArrowRight className="mt-0.5 size-3 shrink-0" style={{ color: PURPLE }} /><span>{e}</span></li>
                    ))}
                  </ol>
                </div>
              )}

              <p className="text-[10px] italic" style={{ color: INK_400 }}>
                <AlertCircle className="mr-1 inline size-2.5" />
                {tips.timelineNotes}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
