'use client';

import { motion } from 'motion/react';
import {
  CheckCircle2, Circle, Loader2, Building2, FlaskConical, FileText, BadgeIndianRupee, XCircle,
} from 'lucide-react';
import type { StoredConsultation, PipelineStatus, PipelineEvent } from '@/lib/store';

const CREAM_LIGHT = '#FBF8F0';
const INK_900 = '#0F1828';
const INK_500 = '#6B7D93';
const INK_400 = '#8B96A8';
const RUST = '#A04A1F';
const SAGE = '#5C7855';
const OCHRE = '#B8842A';

/**
 * Visual chain of the NPRD authorization pipeline. Shows the doctor + patient
 * exactly where the "license" application currently is, with timestamps and
 * actor attribution per stage.
 */

interface Stage {
  status: PipelineStatus;
  label: string;
  icon: React.ElementType;
  description: string;
}

const STAGES: Stage[] = [
  {
    status: 'sent',
    label: 'CoE referral sent',
    icon: FileText,
    description: 'GP has routed the full case packet to the Centre of Excellence specialist.',
  },
  {
    status: 'accepted',
    label: 'CoE accepted',
    icon: Building2,
    description: 'Specialist at the CoE has reviewed the packet and accepted the referral.',
  },
  {
    status: 'lab_confirmed',
    label: 'Diagnosis confirmed at lab',
    icon: FlaskConical,
    description: 'CoE has confirmed the diagnosis at their accredited lab — the precondition for NPRD application.',
  },
  {
    status: 'nprd_filed',
    label: 'NPRD application filed',
    icon: BadgeIndianRupee,
    description: 'CoE has filed the NPRD funding application with MoHFW.',
  },
  {
    status: 'mohfw_approved',
    label: 'MoHFW response',
    icon: CheckCircle2,
    description: 'Final decision from the Ministry on funding. (Approved or rejected.)',
  },
];

function statusIndex(status: PipelineStatus | null | undefined): number {
  if (!status) return -1;
  // Both mohfw_approved and mohfw_rejected occupy the final stage
  const normalised: PipelineStatus = status === 'mohfw_rejected' ? 'mohfw_approved' : status;
  return STAGES.findIndex(s => s.status === normalised);
}

export function PipelineTracker({ consultation }: { consultation: StoredConsultation }) {
  const currentIdx = statusIndex(consultation.pipelineStatus);
  const isRejected = consultation.pipelineStatus === 'mohfw_rejected';
  const isApproved = consultation.pipelineStatus === 'mohfw_approved';

  return (
    <div className="overflow-hidden rounded-xl"
      style={{ background: CREAM_LIGHT, border: '1px solid rgba(92,120,85,0.25)' }}>
      <div className="px-5 py-3"
        style={{ background: 'rgba(92,120,85,0.06)', borderBottom: '1px solid rgba(92,120,85,0.15)' }}>
        <div className="flex flex-wrap items-center gap-2">
          <BadgeIndianRupee className="size-4" style={{ color: SAGE }} />
          <span className="text-sm font-semibold" style={{ color: INK_900 }}>
            NPRD authorization pipeline
          </span>
          <span className="text-xs" style={{ color: INK_500 }}>
            — the path from your case to a funded treatment
          </span>
          {isApproved && (
            <span className="ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(92,120,85,0.15)', color: SAGE }}>
              Approved · {consultation.mohfwAmount ? `₹${consultation.mohfwAmount.toLocaleString('en-IN')}` : 'amount pending'}
            </span>
          )}
          {isRejected && (
            <span className="ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(160,74,31,0.15)', color: RUST }}>
              Rejected · escalation pathway active
            </span>
          )}
        </div>
      </div>

      {/* Stages */}
      <div className="p-5">
        <ol className="relative">
          {STAGES.map((stage, i) => {
            const isPast = i < currentIdx;
            const isCurrent = i === currentIdx && !isApproved && !isRejected;
            const isDone = isPast || (i === currentIdx && (isApproved || isRejected));
            const isFuture = i > currentIdx;

            const event = consultation.pipelineHistory?.find(e => e.status === stage.status);

            // Special case: stage 4 (mohfw response) shows reject styling if rejected
            const stageIsRejection = i === 4 && isRejected;

            const accent = stageIsRejection ? RUST : isDone ? SAGE : isCurrent ? OCHRE : INK_400;
            const Icon = stage.icon;

            return (
              <li key={stage.status} className="relative pb-6 last:pb-0">
                {/* Connector line */}
                {i < STAGES.length - 1 && (
                  <span className="absolute left-[15px] top-8 h-[calc(100%-12px)] w-px"
                    style={{ background: isPast || (i < currentIdx) ? SAGE + '60' : INK_400 + '30' }} />
                )}

                <div className="relative flex gap-4">
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex size-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: isDone ? `${accent}18` : isCurrent ? `${accent}10` : 'transparent',
                      border: `1.5px solid ${isCurrent ? accent : isDone ? accent : accent + '50'}`,
                    }}>
                    {isDone && !stageIsRejection && <CheckCircle2 className="size-4" style={{ color: accent }} />}
                    {stageIsRejection && <XCircle className="size-4" style={{ color: accent }} />}
                    {isCurrent && <Loader2 className="size-3.5 animate-spin" style={{ color: accent }} />}
                    {isFuture && <Circle className="size-3" style={{ color: accent }} />}
                  </motion.div>

                  <div className="flex-1 pt-0.5">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-sm font-semibold" style={{ color: isFuture ? INK_500 : INK_900 }}>
                        {stage.label}
                        {stageIsRejection && ' (rejected)'}
                      </p>
                      {event && (
                        <p className="text-[10px]" style={{ color: INK_500 }}>
                          {new Date(event.at).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed"
                      style={{ color: isFuture ? INK_400 : INK_500 }}>
                      {stage.description}
                    </p>

                    {/* Stage-specific extra detail */}
                    {stage.status === 'lab_confirmed' && consultation.labResult && (
                      <p className="mt-1 inline-block rounded px-2 py-0.5 text-[10px]"
                        style={{ background: 'rgba(92,120,85,0.1)', color: SAGE }}>
                        Lab result: {consultation.labResult}
                      </p>
                    )}
                    {stage.status === 'nprd_filed' && consultation.nprdReferenceNumber && (
                      <p className="mt-1 inline-block rounded px-2 py-0.5 font-mono text-[10px]"
                        style={{ background: 'rgba(184,132,42,0.1)', color: OCHRE }}>
                        Ref: {consultation.nprdReferenceNumber}
                      </p>
                    )}
                    {event?.note && (
                      <p className="mt-1 text-[11px] italic" style={{ color: INK_500 }}>
                        &ldquo;{event.note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Rejection escalation panel */}
        {isRejected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-md p-4"
            style={{ background: 'rgba(160,74,31,0.05)', border: `1px dashed ${RUST}40` }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: RUST }}>
              Escalation pathway
            </p>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: INK_900 }}>
              MoHFW rejected this application. The Support Network panel below has the four-step
              writ-petition pathway citing <em>Master Arnesh Shaw v. Union of India</em> (Delhi HC, Oct 2024).
              ORDI&apos;s helpline (+91-77603-77767) coordinates legal-referral for stalled rare-disease cases.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}


/* ─── Compact view for patient dashboard ─────────────────── */

export function PipelineTrackerCompact({ consultation }: { consultation: StoredConsultation }) {
  const currentIdx = statusIndex(consultation.pipelineStatus);
  const isRejected = consultation.pipelineStatus === 'mohfw_rejected';
  const isApproved = consultation.pipelineStatus === 'mohfw_approved';

  return (
    <div className="rounded-md p-4"
      style={{ background: CREAM_LIGHT, border: '1px solid rgba(92,120,85,0.2)' }}>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: SAGE }}>
        Your treatment authorization · NPRD pipeline
      </p>
      <div className="flex items-center gap-1.5">
        {STAGES.map((stage, i) => {
          const isPast = i < currentIdx;
          const isCurrent = i === currentIdx && !isApproved && !isRejected;
          const isDone = isPast || (i === currentIdx && (isApproved || isRejected));
          const stageIsRejection = i === 4 && isRejected;
          const accent = stageIsRejection ? RUST : isDone ? SAGE : isCurrent ? OCHRE : INK_400;

          return (
            <div key={stage.status} className="flex flex-1 items-center gap-1.5 last:flex-none">
              <div className="flex size-5 items-center justify-center rounded-full shrink-0"
                style={{
                  background: isDone || isCurrent ? `${accent}18` : 'transparent',
                  border: `1.5px solid ${accent}${isDone || isCurrent ? '' : '50'}`,
                }}>
                {isDone && !stageIsRejection && <CheckCircle2 className="size-3" style={{ color: accent }} />}
                {stageIsRejection && <XCircle className="size-3" style={{ color: accent }} />}
                {isCurrent && <Loader2 className="size-2.5 animate-spin" style={{ color: accent }} />}
              </div>
              {i < STAGES.length - 1 && (
                <span className="h-px flex-1"
                  style={{ background: isPast ? SAGE + '60' : INK_400 + '30' }} />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {STAGES.map((s, i) => (
          <p key={i} className="text-[9px] leading-tight text-center" style={{ color: i <= currentIdx ? INK_900 : INK_500 }}>
            {s.label}
          </p>
        ))}
      </div>
      {(isApproved || isRejected) && (
        <p className="mt-3 text-xs leading-relaxed" style={{ color: INK_900 }}>
          {isApproved
            ? `✓ MoHFW approved your treatment funding${consultation.mohfwAmount ? ` — ₹${consultation.mohfwAmount.toLocaleString('en-IN')}` : ''}.`
            : `MoHFW rejected this application. Your CoE specialist + ORDI are coordinating the escalation pathway.`}
        </p>
      )}
    </div>
  );
}


export type { PipelineEvent };
