'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dna, FolderOpen, MessageSquare, FlaskConical } from 'lucide-react';
import { RoleSwitcher } from '@/components/layout/role-switcher';
import { useRequireRole } from '@/lib/mock-session';

const NAV = [
  { href: '/doctor/cases', label: 'My Cases', icon: FolderOpen },
  { href: '/doctor/consultations', label: 'Consultations', icon: MessageSquare },
  { href: '/analyze', label: 'Run Analysis', icon: FlaskConical },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { user, ready } = useRequireRole(['gp', 'specialist']);
  if (!ready || !user) return null;

  return (
    <div className="min-h-screen" style={{ background: '#F5EFE3' }}>
      {/* Top bar */}
      <header
        className="fixed top-0 z-50 w-full"
        style={{
          background: 'rgba(245,239,227,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(15,24,40,0.06)',
        }}>
        <div className="flex items-center justify-between px-[5%] py-3">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="flex size-7 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #1E2D4A, #5C7855)' }}>
                <Dna className="size-4 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold" style={{ color: '#0F1828' }}>Nidaan</span>
                <span className="text-[10px] tracking-wide" style={{ color: '#A04A1F' }}>Doctor workspace</span>
              </div>
            </Link>
            <nav className="flex items-center gap-1">
              {NAV.map(item => {
                const active = path === item.href || path.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                    style={{
                      background: active ? 'rgba(30,45,74,0.12)' : 'transparent',
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
