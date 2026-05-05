'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { HowItWorksSection } from '@/components/landing/topology';

const CREAM = '#F5EFE3';
const INK_500 = '#6B7D93';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen w-full" style={{ background: CREAM }}>
      <header className="px-[5%] py-6">
        <Link href="/"
          className="inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
          style={{ color: INK_500 }}>
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </header>

      <HowItWorksSection />
    </div>
  );
}
