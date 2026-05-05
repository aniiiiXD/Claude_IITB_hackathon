'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, LogOut, Users } from 'lucide-react';
import {
  useMockSession,
  setMockSession,
  clearMockSession,
  ROLE_LABELS,
  ROLE_COLORS,
} from '@/lib/mock-session';
import { MOCK_USERS } from '@/lib/mock-data';

const ROLE_HOME: Record<string, string> = {
  gp: '/doctor/cases',
  specialist: '/doctor/consultations',
  patient: '/patient/dashboard',
  government: '/government/dashboard',
  researcher: '/research/query',
  admin: '/admin/users',
};

export function RoleSwitcher() {
  const { user, ready } = useMockSession();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!ready) return null;

  const switchTo = (userId: string, role: string) => {
    setMockSession(userId);
    setOpen(false);
    router.push(ROLE_HOME[role] ?? '/');
  };

  const logout = () => {
    clearMockSession();
    setOpen(false);
    router.push('/');
  };

  const color = user ? ROLE_COLORS[user.role] : '#1E2D4A';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all"
        style={{
          background: user ? `${color}18` : 'rgba(30,45,74,0.1)',
          border: `1px solid ${user ? color : '#1E2D4A'}40`,
          color: user ? color : '#A04A1F',
        }}>
        <span className="size-2 rounded-full" style={{ background: user ? color : '#A0AAB8' }} />
        {user ? (
          <span className="max-w-[140px] truncate">{user.name.replace('Dr. ', '')}</span>
        ) : (
          <span>Demo Login</span>
        )}
        <ChevronDown
          className="size-3.5 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl p-2"
              style={{
                background: '#FBF8F0',
                border: '1px solid rgba(30,45,74,0.15)',
                boxShadow: '0 12px 32px rgba(15,24,40,0.12)',
              }}>
              <div className="mb-2 px-2 pb-2" style={{ borderBottom: '1px solid rgba(15,24,40,0.06)' }}>
                <p className="text-xs font-medium" style={{ color: '#8B96A8' }}>
                  <Users className="mr-1 inline size-3" />
                  DEMO — switch role
                </p>
              </div>

              {MOCK_USERS.filter(u => u.role !== 'admin').map(u => (
                <button
                  key={u.id}
                  onClick={() => switchTo(u.id, u.role)}
                  className="flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-black/[0.04]"
                  style={{ opacity: user?.id === u.id ? 1 : 0.85 }}>
                  <span
                    className="mt-0.5 size-2 shrink-0 rounded-full"
                    style={{ background: ROLE_COLORS[u.role] }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#0F1828' }}>{u.name}</p>
                    <p className="text-xs" style={{ color: '#8B96A8' }}>
                      {ROLE_LABELS[u.role]}
                      {u.institution ? ` · ${u.institution}` : ''}
                    </p>
                  </div>
                  {user?.id === u.id && (
                    <span className="ml-auto shrink-0 text-xs" style={{ color: ROLE_COLORS[u.role] }}>active</span>
                  )}
                </button>
              ))}

              {user && (
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(15,24,40,0.06)' }}>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-black/[0.04]"
                    style={{ color: '#8B96A8' }}>
                    <LogOut className="size-3.5" />
                    Exit demo session
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
