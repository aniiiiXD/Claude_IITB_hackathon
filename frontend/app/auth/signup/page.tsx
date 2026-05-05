'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dna, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MOCK_USERS } from '@/lib/mock-data';
import { setMockSession } from '@/lib/mock-session';

const INDIA_STATES = [
  'Andhra Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
];

export default function SignupPage() {
  const [role, setRole] = useState<'gp' | 'specialist'>('gp');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: just log in as the GP demo user
    const gpUser = MOCK_USERS.find(u => u.role === 'gp')!;
    setMockSession(gpUser.id);
    setSubmitted(true);
    setTimeout(() => router.push('/doctor/cases'), 1500);
  };

  if (submitted) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center"
        style={{ background: '#F5EFE3' }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="flex size-16 items-center justify-center rounded-full"
            style={{ background: 'rgba(92,120,85,0.12)', border: '1px solid rgba(92,120,85,0.3)' }}>
            <CheckCircle2 className="size-8" style={{ color: '#5C7855' }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#0F1828' }}>Account created</h2>
          <p className="text-sm" style={{ color: '#6B7D93' }}>Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={{ background: '#F5EFE3' }}>
      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <div
            className="flex size-12 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #1E2D4A, #5C7855)' }}>
            <Dna className="size-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F1828' }}>Create your account</h1>
          <p className="text-sm" style={{ color: '#6B7D93' }}>For registered medical practitioners only</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8"
          style={{ background: 'rgba(15,24,40,0.03)', border: '1px solid rgba(15,24,40,0.07)' }}>

          {/* Role selector */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium" style={{ color: '#4A5D7A' }}>I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {(['gp', 'specialist'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="rounded-xl py-2.5 text-sm font-medium transition-all"
                  style={{
                    background: role === r ? 'rgba(30,45,74,0.15)' : 'rgba(15,24,40,0.03)',
                    border: `1px solid ${role === r ? 'rgba(30,45,74,0.4)' : 'rgba(15,24,40,0.07)'}`,
                    color: role === r ? '#A04A1F' : '#6B7D93',
                  }}>
                  {r === 'gp' ? 'GP / Physician' : 'Specialist'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Full name', placeholder: 'Dr. Priya Sharma', type: 'text' },
              { label: 'Email address', placeholder: 'you@hospital.in', type: 'email' },
              { label: role === 'gp' ? 'MCI Registration Number' : 'Specialty / Department', placeholder: role === 'gp' ? 'MH-12345' : 'Clinical Genetics', type: 'text' },
              { label: 'Institution / Hospital', placeholder: 'Nashik District Hospital', type: 'text' },
            ].map(f => (
              <div key={f.label}>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: '#4A5D7A' }}>{f.label}</label>
                <input
                  type={f.type}
                  required
                  placeholder={f.placeholder}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:opacity-40"
                  style={{ background: 'rgba(15,24,40,0.05)', border: '1px solid rgba(30,45,74,0.15)', color: '#0F1828' }}
                />
              </div>
            ))}

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#4A5D7A' }}>State of practice</label>
              <select
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: '#FBF8F0', border: '1px solid rgba(30,45,74,0.15)', color: '#0F1828' }}>
                <option value="">Select state…</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#4A5D7A' }}>Password</label>
              <input
                type="password"
                required
                placeholder="Create a password"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:opacity-40"
                style={{ background: 'rgba(15,24,40,0.05)', border: '1px solid rgba(30,45,74,0.15)', color: '#0F1828' }}
              />
            </div>
          </div>

          <p className="mt-5 text-xs leading-relaxed" style={{ color: '#A0AAB8' }}>
            By creating an account you agree that Nidaan outputs are decision-support tools, not diagnoses.
            Clinical judgment remains solely with the treating physician.
          </p>

          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1E2D4A, #5C7855)', color: '#F5EFE3' }}>
            Create account
            <ArrowRight className="size-4" />
          </button>

          <p className="mt-5 text-center text-sm" style={{ color: '#8B96A8' }}>
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium" style={{ color: '#A04A1F' }}>Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
