'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Send, Loader2, CheckCircle2, MessageSquarePlus, AlertCircle } from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';

const INDIA_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

export default function PatientSubmitPage() {
  const router = useRouter();
  const { user } = useMockSession();

  const [form, setForm] = useState({
    symptoms: '',
    onsetDate: '',
    state: 'Gujarat',
    age: '',
    sex: '',
    familyHistory: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.symptoms.trim()) return;
    setSubmitting(true);
    setError(null);

    const composedText = [
      form.age && `Age: ${form.age}`,
      form.sex && `Sex: ${form.sex}`,
      form.state && `State: ${form.state}`,
      form.onsetDate && `Symptom onset: ${form.onsetDate}`,
      form.familyHistory && `Family history: ${form.familyHistory}`,
      '',
      'Symptoms (in patient\'s own words):',
      form.symptoms,
    ].filter(Boolean).join('\n');

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submittedBy: 'patient',
          patientId: user?.id ?? 'u3',
          assignedDoctorId: 'u1',
          patientSubmittedText: composedText,
          patientSummary: form.symptoms.split('\n')[0]?.slice(0, 120) ?? 'Patient submission',
          symptomOnsetDate: form.onsetDate || null,
          doctorState: form.state,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setSubmitted(true);
      setTimeout(() => router.push('/patient/dashboard'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="px-[5%] py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-xl rounded-2xl p-10 text-center"
          style={{ background: 'rgba(92,120,85,0.06)', border: '1px solid rgba(92,120,85,0.25)' }}>
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full"
            style={{ background: 'rgba(92,120,85,0.12)' }}>
            <CheckCircle2 className="size-7" style={{ color: '#5C7855' }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
            Submitted to your doctor
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#6B7D93' }}>
            Your doctor will review your symptoms and add their clinical observations.
            Once analysis is complete, you'll see the results on your dashboard.
          </p>
          <p className="mt-4 text-xs" style={{ color: '#8B96A8' }}>Redirecting to your dashboard…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-[5%] py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl"
              style={{ background: 'rgba(92,120,85,0.1)' }}>
              <MessageSquarePlus className="size-5" style={{ color: '#5C7855' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
                Tell your doctor what you're experiencing
              </h1>
              <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>
                Describe your symptoms in your own words. Your doctor will review and run AI analysis.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Privacy note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-6 flex items-start gap-3 rounded-xl p-4 text-sm"
          style={{ background: 'rgba(30,45,74,0.05)', border: '1px solid rgba(30,45,74,0.15)', color: '#6B7D93' }}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" style={{ color: '#1E2D4A' }} />
          <div>
            Only your treating doctor will see what you submit here. Be as detailed as you can —
            even small things matter for rare diseases. You can write in plain language; your doctor will translate.
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 space-y-5 rounded-2xl p-6"
          style={{ background: 'rgba(15,24,40,0.02)', border: '1px solid rgba(15,24,40,0.07)' }}>

          {/* Demographics row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#4A5D7A' }}>Age</label>
              <input
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                placeholder="e.g. 39"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none placeholder:opacity-30"
                style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(92,120,85,0.15)', color: '#0F1828' }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#4A5D7A' }}>Sex</label>
              <select
                value={form.sex}
                onChange={e => setForm(f => ({ ...f, sex: e.target.value }))}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: '#FBF8F0', border: '1px solid rgba(92,120,85,0.15)', color: '#0F1828' }}>
                <option value="">Select…</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" style={{ color: '#4A5D7A' }}>State</label>
              <select
                value={form.state}
                onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ background: '#FBF8F0', border: '1px solid rgba(92,120,85,0.15)', color: '#0F1828' }}>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Onset */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#4A5D7A' }}>
              When did your symptoms start?
            </label>
            <input
              type="date"
              value={form.onsetDate}
              onChange={e => setForm(f => ({ ...f, onsetDate: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(92,120,85,0.15)', color: '#0F1828' }}
            />
          </div>

          {/* Symptoms — main field */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#4A5D7A' }}>
              What are you experiencing? <span style={{ color: '#A04A1F' }}>*</span>
            </label>
            <textarea
              value={form.symptoms}
              onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))}
              rows={10}
              placeholder="Describe everything — even things that seem unrelated. Examples:
• Tired all the time, can't carry groceries upstairs anymore
• Belly feels swollen on the left side
• Bruises appear without bumping into anything
• Bone pain in my legs at night"
              className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none placeholder:opacity-30"
              style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(92,120,85,0.15)', color: '#0F1828' }}
            />
          </div>

          {/* Family history */}
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#4A5D7A' }}>
              Family history (optional)
            </label>
            <textarea
              value={form.familyHistory}
              onChange={e => setForm(f => ({ ...f, familyHistory: e.target.value }))}
              rows={3}
              placeholder="Any family members with similar symptoms? Are your parents related (e.g. cousins)?"
              className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none placeholder:opacity-30"
              style={{ background: 'rgba(15,24,40,0.04)', border: '1px solid rgba(92,120,85,0.15)', color: '#0F1828' }}
            />
          </div>

          {error && (
            <div className="rounded-xl p-3 text-sm"
              style={{ background: 'rgba(160,74,31,0.08)', border: '1px solid rgba(160,74,31,0.25)', color: '#A04A1F' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!form.symptoms.trim() || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #5C7855, #1E2D4A)', color: '#F5EFE3' }}>
            {submitting ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
            {submitting ? 'Submitting…' : 'Submit to my doctor'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
