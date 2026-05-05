'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { useMockSession } from '@/lib/mock-session';

interface ConsentToggle {
  key: 'epidemiology' | 'researchCohort' | 'researchContact';
  title: string;
  description: string;
  detail: string;
  color: string;
  requires?: string;
}

const CONSENTS: ConsentToggle[] = [
  {
    key: 'epidemiology',
    title: 'Epidemiology reporting to government',
    description: 'Your anonymised case (disease name, your state) will be included in aggregate statistics shared with the Ministry of Health.',
    detail: 'The government sees only counts — never your name, age, or contact details. This data helps justify budget for rare disease treatments nationally.',
    color: '#B8842A',
  },
  {
    key: 'researchCohort',
    title: 'Research cohort inclusion',
    description: 'Biology research labs can search for patients with your condition for natural history studies.',
    detail: 'They will only see that N patients with your diagnosis exist — never your identity. You will be asked separately before any data about you is shared with a specific researcher.',
    color: '#1E2D4A',
    requires: undefined,
  },
  {
    key: 'researchContact',
    title: 'Research contact pathway',
    description: 'If a research lab is approved to contact patients with your condition, your treating doctor will reach out to re-confirm your consent.',
    detail: 'You are never contacted directly by researchers. Every contact goes through your treating doctor first. You can say no at any point.',
    color: '#8B6C9C',
    requires: 'researchCohort',
  },
];

type ConsentState = { epidemiology: boolean; researchCohort: boolean; researchContact: boolean };

export default function ConsentPage() {
  const { user, ready } = useMockSession();
  const [consents, setConsents] = useState<ConsentState>({
    epidemiology: false,
    researchCohort: false,
    researchContact: false,
  });
  const [history, setHistory] = useState<{ type: string; granted: boolean; date: string; label: string }[]>([]);
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    const patientUserId = user?.id ?? 'u3';
    fetch(`/api/consent?patientUserId=${patientUserId}`)
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setConsents({
            epidemiology: data.epidemiology,
            researchCohort: data.researchCohort,
            researchContact: data.researchContact,
          });
          setHistory([
            { type: 'epidemiology', granted: data.epidemiology, date: data.updatedAt, label: 'Epidemiology reporting' },
            { type: 'researchCohort', granted: data.researchCohort, date: data.updatedAt, label: 'Research cohort' },
            { type: 'researchContact', granted: data.researchContact, date: data.updatedAt, label: 'Research contact' },
          ]);
        }
      })
      .finally(() => setLoading(false));
  }, [ready, user]);

  const persistConsent = async (next: ConsentState) => {
    const patientUserId = user?.id ?? 'u3';
    await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientUserId, ...next }),
    });
  };

  const toggle = async (key: keyof ConsentState) => {
    const newVal = !consents[key];
    const next: ConsentState = { ...consents, [key]: newVal };
    // Cascade: turning off researchCohort also turns off researchContact
    if (key === 'researchCohort' && !newVal) next.researchContact = false;

    setSavingKey(key);
    setConsents(next);

    const label = CONSENTS.find(c => c.key === key)!.title.split(' ').slice(0, 3).join(' ');
    setHistory(h => [
      { type: key, granted: newVal, date: new Date().toISOString(), label },
      ...h,
    ]);

    try {
      await persistConsent(next);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      // Roll back optimistic update on failure
      setConsents(consents);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="px-[5%] py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: 'rgba(30,45,74,0.1)' }}>
            <Shield className="size-5" style={{ color: '#1E2D4A' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#0F1828', fontFamily: 'Instrument Serif, serif' }}>
              Data consent
            </h1>
            <p className="text-sm" style={{ color: '#6B7D93' }}>Control how your anonymised data is used</p>
          </div>
        </div>
      </div>

      <div
        className="mb-6 rounded-xl p-4 text-sm"
        style={{ background: 'rgba(30,45,74,0.06)', border: '1px solid rgba(30,45,74,0.15)', color: '#6B7D93' }}>
        <Info className="mr-2 inline size-4" style={{ color: '#1E2D4A' }} />
        Your identity is never shared. All three options use anonymised or aggregate data only.
        You can change your consent at any time.
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin" style={{ color: '#1E2D4A' }} />
        </div>
      ) : (
        <div className="space-y-4">
          {CONSENTS.map(c => {
            const granted = consents[c.key];
            const blocked = c.requires && !consents[c.requires as keyof ConsentState];
            const isSaving = savingKey === c.key;

            return (
              <motion.div
                key={c.key}
                layout
                className="rounded-xl p-5"
                style={{
                  background: granted ? `${c.color}08` : 'rgba(15,24,40,0.02)',
                  border: `1px solid ${granted ? c.color + '30' : 'rgba(15,24,40,0.07)'}`,
                  opacity: blocked ? 0.5 : 1,
                }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: '#0F1828' }}>{c.title}</p>
                    <p className="mt-1 text-sm" style={{ color: '#6B7D93' }}>{c.description}</p>
                    <p className="mt-2 text-xs" style={{ color: '#8B96A8' }}>{c.detail}</p>
                    {blocked && (
                      <p className="mt-2 text-xs" style={{ color: '#B8842A' }}>
                        Requires Research cohort consent to be enabled first.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => !blocked && !isSaving && toggle(c.key)}
                    disabled={!!blocked || isSaving}
                    className="relative shrink-0 rounded-full transition-all duration-300"
                    style={{
                      width: 44,
                      height: 24,
                      background: granted ? c.color : 'rgba(15,24,40,0.1)',
                      opacity: blocked || isSaving ? 0.5 : 1,
                    }}>
                    <motion.div
                      animate={{ x: granted ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="absolute top-1 size-4 rounded-full bg-white shadow"
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {saved === c.key && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 flex items-center gap-1.5 text-xs"
                      style={{ color: '#5C7855' }}>
                      <CheckCircle2 className="size-3.5" />
                      Saved
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Consent history */}
      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: '#8B96A8' }}>
            Consent history
          </h2>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(15,24,40,0.07)' }}>
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 text-sm"
                style={{
                  borderBottom: i < history.length - 1 ? '1px solid rgba(15,24,40,0.05)' : 'none',
                  background: i % 2 === 0 ? 'rgba(15,24,40,0.01)' : 'transparent',
                }}>
                <span style={{ color: '#4A5D7A' }}>{h.label}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{
                    background: h.granted ? 'rgba(92,120,85,0.1)' : 'rgba(15,24,40,0.05)',
                    color: h.granted ? '#5C7855' : '#8B96A8',
                  }}>
                  {h.granted ? 'Granted' : 'Withdrawn'}
                </span>
                <span className="text-xs" style={{ color: '#A0AAB8' }}>
                  {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
