'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, CheckCircle2, X } from 'lucide-react';
import { MOCK_USERS, type Role } from '@/lib/mock-data';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/mock-session';

export default function AdminUsersPage() {
  const [showProvision, setShowProvision] = useState(false);
  const [provisionRole, setProvisionRole] = useState<'government' | 'researcher'>('government');
  const [provisioned, setProvisioned] = useState(false);

  return (
    <div className="px-[5%] py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
            Users
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>
            {MOCK_USERS.length} registered users · Provision government and researcher accounts here
          </p>
        </div>
        <button
          onClick={() => setShowProvision(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'rgba(107,114,128,0.15)', border: '1px solid rgba(107,114,128,0.3)', color: '#9CA3AF' }}>
          <Plus className="size-4" />
          Provision account
        </button>
      </div>

      {/* Users table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(15,24,40,0.07)' }}>
        <div
          className="grid grid-cols-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
          style={{ background: 'rgba(15,24,40,0.03)', color: '#8B96A8', gridTemplateColumns: '2fr 2fr 1fr 1fr' }}>
          <span>Name</span>
          <span>Email · Institution</span>
          <span>Role</span>
          <span>State</span>
        </div>

        {MOCK_USERS.map((u, i) => (
          <div
            key={u.id}
            className="grid items-center px-4 py-3.5 text-sm"
            style={{
              gridTemplateColumns: '2fr 2fr 1fr 1fr',
              borderTop: '1px solid rgba(15,24,40,0.05)',
              background: i % 2 === 0 ? 'rgba(15,24,40,0.01)' : 'transparent',
            }}>
            <span style={{ color: '#1E2D4A' }}>{u.name}</span>
            <div>
              <p style={{ color: '#4A5D7A' }}>{u.email}</p>
              {u.institution && <p className="text-xs" style={{ color: '#A0AAB8' }}>{u.institution}</p>}
            </div>
            <span
              className="w-fit rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                background: `${ROLE_COLORS[u.role as Role]}18`,
                color: ROLE_COLORS[u.role as Role],
                border: `1px solid ${ROLE_COLORS[u.role as Role]}30`,
              }}>
              {ROLE_LABELS[u.role as Role]}
            </span>
            <span style={{ color: '#8B96A8' }}>{u.stateIndia ?? '—'}</span>
          </div>
        ))}
      </div>

      {/* Provision modal */}
      <AnimatePresence>
        {showProvision && !provisioned && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ background: 'rgba(3,11,24,0.75)', backdropFilter: 'blur(8px)' }}
              onClick={() => setShowProvision(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl p-6"
              style={{ background: '#FBF8F0', border: '1px solid rgba(107,114,128,0.3)', boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: '#0F1828' }}>Provision account</h3>
                <button onClick={() => setShowProvision(false)} style={{ color: '#8B96A8' }}>
                  <X className="size-5" />
                </button>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium" style={{ color: '#4A5D7A' }}>Account type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['government', 'researcher'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setProvisionRole(r)}
                      className="rounded-xl py-2.5 text-sm font-medium transition-all"
                      style={{
                        background: provisionRole === r ? `${ROLE_COLORS[r]}18` : 'rgba(15,24,40,0.03)',
                        border: `1px solid ${provisionRole === r ? ROLE_COLORS[r] + '40' : 'rgba(15,24,40,0.07)'}`,
                        color: provisionRole === r ? ROLE_COLORS[r] : '#6B7D93',
                      }}>
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Full name', placeholder: 'Dr. Anitha Krishnan' },
                  { label: 'Email address', placeholder: 'anitha@nhm.gov.in' },
                  { label: provisionRole === 'government' ? 'Ministry / Department' : 'Institution', placeholder: provisionRole === 'government' ? 'NHM, MoHFW' : 'CSIR-CCMB' },
                  ...(provisionRole === 'researcher' ? [{ label: 'IRB reference (required)', placeholder: 'CCMB/IEC/2026/XX' }] : []),
                ].map(f => (
                  <div key={f.label}>
                    <label className="mb-1 block text-xs font-medium" style={{ color: '#6B7D93' }}>{f.label}</label>
                    <input
                      placeholder={f.placeholder}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                      style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(15,24,40,0.1)', color: '#0F1828' }}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => setProvisioned(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'rgba(107,114,128,0.2)', border: '1px solid rgba(107,114,128,0.35)', color: '#9CA3AF' }}>
                Create account and send login email
              </button>
            </motion.div>
          </div>
        )}

        {provisioned && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0"
              style={{ background: 'rgba(3,11,24,0.75)' }}
              onClick={() => { setShowProvision(false); setProvisioned(false); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex flex-col items-center gap-4 rounded-2xl p-8 text-center"
              style={{ background: '#FBF8F0', border: '1px solid rgba(92,120,85,0.25)' }}>
              <CheckCircle2 className="size-10" style={{ color: '#5C7855' }} />
              <p className="text-lg font-semibold" style={{ color: '#0F1828' }}>Account provisioned</p>
              <p className="text-sm" style={{ color: '#6B7D93' }}>Login credentials sent to their email.</p>
              <button
                onClick={() => { setShowProvision(false); setProvisioned(false); }}
                className="rounded-xl px-5 py-2 text-sm font-medium"
                style={{ background: 'rgba(92,120,85,0.1)', color: '#5C7855' }}>
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
