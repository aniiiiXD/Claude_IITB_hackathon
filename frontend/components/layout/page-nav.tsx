'use client'
import Link from 'next/link'
import { Dna } from 'lucide-react'
import { RoleSwitcher } from './role-switcher'

export function PageNav() {
    return (
        <header
            className="fixed top-0 z-50 w-full"
            style={{
                background: 'rgba(245,239,227,0.92)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(15,24,40,0.08)',
            }}>
            <div className="w-full flex items-center justify-between px-[5%] py-3">
                <Link href="/" className="flex items-center gap-2.5">
                    <div
                        className="flex size-7 items-center justify-center rounded-lg"
                        style={{ background: 'linear-gradient(135deg, #1E2D4A, #5C7855)' }}>
                        <Dna className="size-4" style={{ color: '#F5EFE3' }} />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-sm font-bold" style={{ color: '#0F1828' }}>Nidaan</span>
                        <span className="text-[10px] tracking-wide" style={{ color: '#A04A1F' }}>Run analysis</span>
                    </div>
                </Link>

                <nav className="hidden items-center gap-8 lg:flex">
                    {[
                        { name: 'How it works', href: '/#how-it-works' },
                        { name: 'My cases', href: '/doctor/cases' },
                        { name: 'Consultations', href: '/doctor/consultations' },
                    ].map(item => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium transition-opacity hover:opacity-70"
                            style={{ color: '#1E2D4A' }}>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <RoleSwitcher />
                </div>
            </div>
        </header>
    )
}
