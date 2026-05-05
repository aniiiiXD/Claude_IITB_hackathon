'use client';

import { useState, useEffect } from 'react';
import { type MockUser, MOCK_USERS, type Role } from './mock-data';

const SESSION_KEY = 'rc_demo_user_id';

export function getMockSession(): MockUser | null {
  if (typeof window === 'undefined') return null;
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return MOCK_USERS.find(u => u.id === id) ?? null;
}

export function setMockSession(userId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, userId);
  window.dispatchEvent(new Event('rc_session_change'));
}

export function clearMockSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('rc_session_change'));
}

export function useMockSession() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getMockSession());
    setReady(true);

    const handler = () => setUser(getMockSession());
    window.addEventListener('rc_session_change', handler);
    return () => window.removeEventListener('rc_session_change', handler);
  }, []);

  return { user, ready };
}

/**
 * Guard hook — redirects to /auth/login if the user is not signed in
 * or their role isn't in `allowedRoles`. Use inside role-specific layouts.
 */
export function useRequireRole(allowedRoles?: Role[]) {
  const { user, ready } = useMockSession();

  useEffect(() => {
    if (typeof window === 'undefined' || !ready) return;
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      window.location.href = '/auth/login';
    }
  }, [user, ready, allowedRoles]);

  return { user, ready };
}

export const ROLE_LABELS: Record<Role, string> = {
  gp: 'GP / Doctor',
  specialist: 'Specialist',
  patient: 'Patient',
  government: 'Government',
  researcher: 'Researcher',
  admin: 'Admin',
};

export const ROLE_COLORS: Record<Role, string> = {
  gp: '#1E2D4A',          // ink — primary clinical role
  specialist: '#8B6C9C',  // muted purple — specialist
  patient: '#5C7855',     // sage — patient (calm, life)
  government: '#B8842A',  // ochre — government (warm warning)
  researcher: '#A04A1F',  // rust — researcher
  admin: '#8B96A8',       // muted ink — admin
};
