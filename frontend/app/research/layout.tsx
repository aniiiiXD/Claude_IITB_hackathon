'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dna, Search, FileText } from 'lucide-react';
import { RoleSwitcher } from '@/components/layout/role-switcher';
import { useRequireRole } from '@/lib/mock-session';

const NAV = [
  { href: '/research/query', label: 'Cohort Query', icon: Search },
  { href: '/research/requests', label: 'My Requests', icon: FileText },
];

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user, ready } = useRequireRole(['researcher']);
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
                <span className="text-[10px] tracking-wide" style={{ color: '#A04A1F' }}>Research console</span>
              </div>
            </Link>
            <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
              style={{ background: 'rgba(160,74,31,0.08)' }}>
              <span className="size-2 rounded-full" style={{ background: '#A04A1F' }} />
              <span className="text-xs font-semibold" style={{ color: '#A04A1F' }}>Research & Labs</span>
            </div>
            <nav className="flex items-center gap-1">
              {NAV.map(item => {
                const active = path === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                    style={{
                      background: active ? 'rgba(160,74,31,0.1)' : 'transparent',
                      color: active ? '#A04A1F' : '#6B7D93',
                    }}>
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <RoleSwitcher />
        </div>
      </header>
      <main className="pt-[57px]">{children}</main>
    </div>
  );
}
