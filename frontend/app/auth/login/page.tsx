'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Dna, ArrowRight, Stethoscope, MessageSquarePlus, FlaskConical, BarChart3, Search, Building2, Shield } from 'lucide-react';
import { MOCK_USERS, type Role } from '@/lib/mock-data';
import { setMockSession } from '@/lib/mock-session';

const ROLE_HOME: Record<Role, string> = {
  gp: '/doctor/cases',
  specialist: '/doctor/consultations',
  patient: '/patient/dashboard',
  government: '/government/dashboard',
  researcher: '/research/query',
  admin: '/admin/users',
};

interface RoleCard {
  userId: string;
  name: string;
  designation: string;
  org: string;
  city: string;
  role: Role;
  icon: React.ElementType;
  accent: string;
  whatTheySee: string;
}

const ROLE_CARDS: RoleCard[] = [
  {
    userId: 'u1',
    name: 'Dr. Priya Sharma',
    designation: 'General Practitioner',
    org: 'Nashik District Hospital',
    city: 'Nashik · Maharashtra',
    role: 'gp',
    icon: Stethoscope,
    accent: '#1E2D4A',
    whatTheySee: 'Patient inbox · Run AI analysis · Confirm diagnoses · Route to CoE',
  },
  {
    userId: 'u3',
    name: 'Aarav Patel',
    designation: 'Patient',
    org: '39 yrs · Confirmed Gaucher type 1',
    city: 'Ahmedabad · Gujarat',
    role: 'patient',
    icon: MessageSquarePlus,
    accent: '#5C7855',
    whatTheySee: 'Submit symptoms · See diagnosis · Treatment centres · Funding status',
  },
  {
    userId: 'u7',
    name: 'Meera Iyer',
    designation: 'Patient (new)',
    org: 'No case on file',
    city: 'Kerala',
    role: 'patient',
    icon: MessageSquarePlus,
    accent: '#5C7855',
    whatTheySee: 'Empty state · Submit your symptoms in plain language',
  },
  {
    userId: 'u2',
    name: 'Dr. Rajesh Mehra',
    designation: 'Metabolic Geneticist · CoE specialist',
    org: 'AIIMS New Delhi',
    city: 'Delhi',
    role: 'specialist',
    icon: Building2,
    accent: '#8B6C9C',
    whatTheySee: 'Inbound CoE referrals · Advance NPRD pipeline · Lab + funding actions',
  },
  {
    userId: 'u5',
    name: 'Dr. S. Krishnaswamy',
    designation: 'Researcher',
    org: 'CSIR-CCMB Hyderabad',
    city: 'Hyderabad · Telangana',
    role: 'researcher',
    icon: Search,
    accent: '#A04A1F',
    whatTheySee: 'Cohort queries (consent-gated) · Submit research data requests',
  },
  {
    userId: 'u4',
    name: 'Dr. Anitha Krishnan',
    designation: 'Joint Secretary',
    org: 'National Health Mission · MoHFW',
    city: 'Delhi',
    role: 'government',
    icon: BarChart3,
    accent: '#B8842A',
    whatTheySee: 'National rare-disease registry · Aggregate epidemiology · CSV export',
  },
  {
    userId: 'u6',
    name: 'Admin',
    designation: 'Platform admin',
    org: 'Nidaan ops',
    city: '',
    role: 'admin',
    icon: Shield,
    accent: '#6B7D93',
    whatTheySee: 'Approve research requests · User management',
  },
];


const CREAM = '#F5EFE3';
const CREAM_LIGHT = '#FBF8F0';
const INK_900 = '#0F1828';
const INK_500 = '#6B7D93';
const RUST = '#A04A1F';


export default function LoginPage() {
  const router = useRouter();

  const enterAs = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) return;
    setMockSession(userId);
    router.push(ROLE_HOME[user.role] ?? '/');
  };

  return (
    <div className="min-h-screen w-full" style={{ background: CREAM }}>
      <div className="mx-auto max-w-6xl px-[5%] py-10">

        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex size-8 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #1E2D4A, #5C7855)' }}>
              <Dna className="size-4" style={{ color: CREAM }} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold" style={{ color: INK_900 }}>Nidaan</span>
              <span className="text-[10px] tracking-wide" style={{ color: RUST }}>Demo entry</span>
            </div>
          </Link>
          <Link href="/" className="text-sm transition-opacity hover:opacity-70" style={{ color: INK_500 }}>
            ← Back to landing
          </Link>
        </div>

        {/* Pitch */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: RUST }}>
            One-click demo entry · no auth, no setup
          </p>
          <h1 className="text-3xl leading-tight md:text-4xl"
            style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
            Pick a role. Enter the workspace.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: INK_500 }}>
            Each role sees a different slice of the same case. Switch between them using the role-switcher in the header
            after you&apos;re in. The realistic demo is to walk a case through Patient → Doctor → Specialist → Government.
          </p>
        </motion.div>

        {/* Role grid */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ROLE_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.userId}
                onClick={() => enterAs(card.userId)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group rounded-md p-5 text-left transition-shadow"
                style={{
                  background: CREAM_LIGHT,
                  border: `1px solid ${card.accent}30`,
                  boxShadow: `2px 2px 0 ${card.accent}25`,
                }}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md"
                    style={{ background: `${card.accent}15`, color: card.accent }}>
                    <Icon className="size-5" />
                  </div>
                  <ArrowRight className="size-4 opacity-30 transition-opacity group-hover:opacity-100"
                    style={{ color: card.accent }} />
                </div>
                <p className="text-base font-semibold leading-tight" style={{ color: INK_900 }}>
                  {card.name}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: card.accent }}>
                  {card.designation}
                </p>
                <p className="mt-1 text-xs" style={{ color: INK_500 }}>
                  {card.org}
                </p>
                {card.city && (
                  <p className="text-[10px]" style={{ color: INK_500 }}>{card.city}</p>
                )}
                <p className="mt-3 border-t pt-3 text-[11px] leading-relaxed"
                  style={{ borderColor: `${card.accent}20`, color: INK_500 }}>
                  {card.whatTheySee}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Demo flow hint */}
        <div className="mx-auto mt-10 max-w-3xl rounded-md p-4 text-xs leading-relaxed text-center"
          style={{ background: CREAM_LIGHT, border: `1px dashed ${INK_900}25`, color: INK_500 }}>
          <span className="font-semibold" style={{ color: INK_900 }}>Suggested demo path: </span>
          Meera (submit Fabry symptoms) → Dr. Priya (review + Run AI analysis + Confirm + Route to CoE) →
          Dr. Mehra (accept referral + advance pipeline) → Dr. Anitha (see the case roll into aggregate stats) →
          back to Meera (see live status + funding approval).
        </div>

        <p className="mt-8 text-center text-[11px]" style={{ color: INK_500 }}>
          This is a demo · no real authentication · session persisted in localStorage and cleared on logout
        </p>
      </div>
    </div>
  );
}
