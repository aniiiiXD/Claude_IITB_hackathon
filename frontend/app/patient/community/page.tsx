'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, MapPin, Mail, CheckCircle2, Bell } from 'lucide-react';
const COMMUNITY_DATA = {
  disease: 'Gaucher disease',
  totalIndia: 23,
  byState: [
    { state: 'Maharashtra', count: 6 },
    { state: 'Gujarat', count: 5 },
    { state: 'Karnataka', count: 4 },
    { state: 'Delhi', count: 3 },
    { state: 'Tamil Nadu', count: 3 },
    { state: 'Others', count: 2 },
  ],
};

export default function CommunityPage() {
  const [joined, setJoined] = useState(false);

  return (
    <div className="px-[5%] py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: 'rgba(92,120,85,0.1)' }}>
            <Users className="size-5" style={{ color: '#5C7855' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
              Community
            </h1>
            <p className="text-sm" style={{ color: '#6B7D93' }}>Others with {COMMUNITY_DATA.disease} on Nidaan</p>
          </div>
        </div>
      </div>

      {/* Main count card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(92,120,85,0.08) 0%, rgba(30,45,74,0.05) 100%)',
          border: '1px solid rgba(92,120,85,0.2)',
        }}>
        <p className="text-8xl font-bold" style={{ color: '#5C7855' }}>{COMMUNITY_DATA.totalIndia}</p>
        <p className="mt-2 text-lg" style={{ color: '#4A5D7A' }}>
          other patients with <span style={{ color: '#0F1828' }}>Gaucher disease</span> are registered on Nidaan in India
        </p>
        <p className="mt-3 text-sm" style={{ color: '#8B96A8' }}>
          You are not alone. Each person here found their diagnosis through the same platform.
        </p>
      </motion.div>

      {/* State breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 rounded-xl p-5"
        style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: '#8B96A8' }}>
          <MapPin className="mr-1.5 inline size-3.5" />
          Distribution across India
        </h2>
        <div className="space-y-3">
          {COMMUNITY_DATA.byState.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-24 text-sm" style={{ color: '#4A5D7A' }}>{s.state}</span>
              <div className="flex-1 overflow-hidden rounded-full" style={{ height: 6, background: 'rgba(15,24,40,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.count / COMMUNITY_DATA.totalIndia) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #5C7855, #1E2D4A)' }}
                />
              </div>
              <span className="w-6 text-right text-sm font-bold" style={{ color: '#5C7855' }}>{s.count}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Privacy note */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 rounded-xl p-4 text-sm"
        style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)', color: '#6B7D93' }}>
        These numbers show how many patients exist — never who they are. No names, contact details,
        or individual information is shared. The community is intentionally anonymous.
      </motion.div>

      {/* Join mailing list */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-6"
        style={{ background: 'rgba(30,45,74,0.06)', border: '1px solid rgba(30,45,74,0.15)' }}>
        {joined ? (
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-xl"
              style={{ background: 'rgba(92,120,85,0.12)' }}>
              <CheckCircle2 className="size-5" style={{ color: '#5C7855' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#0F1828' }}>You're on the list</p>
              <p className="text-sm" style={{ color: '#6B7D93' }}>
                You'll receive a monthly digest of Gaucher disease research news and new confirmed cases in your region.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-start gap-3">
              <Bell className="mt-0.5 size-5 shrink-0" style={{ color: '#1E2D4A' }} />
              <div>
                <p className="font-semibold" style={{ color: '#0F1828' }}>Join the Gaucher disease community mailing list</p>
                <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>
                  Receive a monthly digest: new research, confirmed cases in your region, and treatment updates.
                  No personal data is shared with others on the list.
                </p>
              </div>
            </div>
            <button
              onClick={() => setJoined(true)}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'rgba(30,45,74,0.15)', border: '1px solid rgba(30,45,74,0.3)', color: '#A04A1F' }}>
              <Mail className="size-4" />
              Join mailing list
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
