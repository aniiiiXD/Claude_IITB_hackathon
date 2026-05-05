'use client';

import Link from 'next/link';
import { Dna, BarChart3 } from 'lucide-react';
import { RoleSwitcher } from '@/components/layout/role-switcher';
import { useRequireRole } from '@/lib/mock-session';

export default function GovernmentLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useRequireRole(['government']);
  if (!ready || !user) return null;
  return (
    <div className="min-h-screen" style={{ background: '#F5EFE3' }}>
      <header
        className="fixed top-0 z-50 w-full"
        style={{
          background: 'rgba(245,239,227,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(15,24,40,0.06)',
        }}>
        <div className="flex items-center justify-between px-[5%] py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="flex size-7 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #1E2D4A, #5C7855)' }}>
                <Dna className="size-4 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold" style={{ color: '#0F1828' }}>Nidaan</span>
                <span className="text-[10px] tracking-wide" style={{ color: '#B8842A' }}>National registry</span>
              </div>
            </Link>
            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ background: 'rgba(184,132,42,0.1)' }}>
              <BarChart3 className="size-4" style={{ color: '#B8842A' }} />
              <span className="text-sm font-medium" style={{ color: '#B8842A' }}>Government Dashboard</span>
            </div>
          </div>
          <RoleSwitcher />
        </div>
      </header>
      <main className="pt-[57px]">{children}</main>
    </div>
  );
}
