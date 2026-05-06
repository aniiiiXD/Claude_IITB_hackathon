'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Activity, AlertCircle, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const CREAM = '#F5EFE3';
const CREAM_LIGHT = '#FBF8F0';
const INK_900 = '#0F1828';
const INK_500 = '#6B7D93';
const RUST = '#A04A1F';
const SAGE = '#5C7855';

type Status = 'idle' | 'warming' | 'ready' | 'error';

type PingLog = {
  at: string;
  ms: number;
  status: 'ok' | 'fail';
  detail: string;
};

export default function WarmupPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [response, setResponse] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<PingLog[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ping = useCallback(async () => {
    setStatus('warming');
    setErrorMsg(null);
    setResponse(null);
    setElapsed(0);

    const start = performance.now();
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setElapsed((performance.now() - start) / 1000);
    }, 100);

    try {
      const res = await fetch(`${API_URL}/health`, {
        method: 'GET',
        cache: 'no-store',
      });
      const text = await res.text();
      const ms = performance.now() - start;
      if (tickRef.current) clearInterval(tickRef.current);
      setElapsed(ms / 1000);

      if (!res.ok) {
        const detail = `HTTP ${res.status}`;
        setStatus('error');
        setErrorMsg(detail);
        setHistory((h) => [{ at: new Date().toLocaleTimeString(), ms, status: 'fail', detail }, ...h].slice(0, 6));
        return;
      }

      setResponse(text);
      setStatus('ready');
      setHistory((h) => [{ at: new Date().toLocaleTimeString(), ms, status: 'ok', detail: text.slice(0, 80) }, ...h].slice(0, 6));
    } catch (err) {
      const ms = performance.now() - start;
      if (tickRef.current) clearInterval(tickRef.current);
      setElapsed(ms / 1000);
      const detail = err instanceof Error ? err.message : String(err);
      setStatus('error');
      setErrorMsg(detail);
      setHistory((h) => [{ at: new Date().toLocaleTimeString(), ms, status: 'fail', detail }, ...h].slice(0, 6));
    }
  }, []);

  useEffect(() => {
    ping();
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [ping]);

  return (
    <div className="min-h-screen px-6 py-16 md:py-24" style={{ background: CREAM }}>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
          style={{ color: INK_500 }}>
          <ArrowLeft className="size-3" />
          Back to home
        </Link>

        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: RUST }}>
          Backend warm-up
        </p>
        <h1
          className="text-3xl leading-tight md:text-5xl"
          style={{ color: INK_900, fontFamily: 'Instrument Serif, serif', fontWeight: 400 }}>
          Wake the agent pipeline.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed md:text-base" style={{ color: INK_500 }}>
          The backend runs on Render&apos;s free tier — it sleeps after 15 minutes of inactivity. This page
          pings <code className="font-mono text-xs" style={{ color: INK_900 }}>/health</code> only.{' '}
          <span style={{ color: INK_900 }}>No AI calls, no Anthropic API credits used.</span> Hit it before
          a live demo and the container will be warm by the time you click <em>Run analysis</em>.
        </p>

        {/* Status card */}
        <div
          className="mt-10 rounded-md p-6"
          style={{
            background: CREAM_LIGHT,
            border: `1px solid ${INK_900}15`,
            boxShadow: `2px 2px 0 ${INK_900}10`,
          }}>
          {status === 'warming' && (
            <>
              <div className="mb-2 flex items-center gap-3">
                <Activity className="size-5 animate-pulse" style={{ color: RUST }} strokeWidth={1.5} />
                <span className="text-base" style={{ color: INK_900 }}>
                  Pinging backend…
                </span>
              </div>
              <p className="text-xs" style={{ color: INK_500 }}>
                {elapsed.toFixed(1)}s elapsed · cold starts can take 30–50s
              </p>
              <div
                className="mt-4 h-1 w-full overflow-hidden rounded-full"
                style={{ background: `${INK_900}10` }}>
                <div
                  className="h-full transition-all duration-100 ease-linear"
                  style={{
                    width: `${Math.min(100, (elapsed / 50) * 100)}%`,
                    background: RUST,
                  }}
                />
              </div>
            </>
          )}

          {status === 'ready' && (
            <>
              <div className="mb-2 flex items-center gap-3">
                <CheckCircle2 className="size-5" style={{ color: SAGE }} strokeWidth={1.5} />
                <span className="text-base font-semibold" style={{ color: INK_900 }}>
                  Backend is awake.
                </span>
              </div>
              <p className="text-xs" style={{ color: INK_500 }}>
                Responded in {elapsed.toFixed(2)}s
              </p>
              {response && (
                <pre
                  className="mt-3 overflow-auto rounded p-3 font-mono text-xs"
                  style={{ background: CREAM, color: INK_900 }}>
                  {response}
                </pre>
              )}
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-2 flex items-center gap-3">
                <AlertCircle className="size-5" style={{ color: RUST }} strokeWidth={1.5} />
                <span className="text-base font-semibold" style={{ color: INK_900 }}>
                  Couldn&apos;t reach backend.
                </span>
              </div>
              <p className="text-xs" style={{ color: INK_500 }}>
                {errorMsg} · {elapsed.toFixed(1)}s elapsed
              </p>
              <p className="mt-3 text-xs" style={{ color: INK_500 }}>
                If this is the first request after a long idle, Render may still be spinning the container up. Try again
                in a few seconds.
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={ping}
            disabled={status === 'warming'}
            className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: INK_900,
              color: CREAM,
              boxShadow: `2px 2px 0 ${RUST}30`,
            }}>
            <RefreshCw className={`size-3.5 ${status === 'warming' ? 'animate-spin' : ''}`} />
            {status === 'warming' ? 'Pinging…' : 'Ping again'}
          </button>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: RUST }}>
            Open /analyze →
          </Link>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-12">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: INK_500 }}>
              Recent pings
            </p>
            <ul className="space-y-1.5 font-mono text-xs">
              {history.map((h, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 border-l-2 px-3 py-1.5"
                  style={{
                    borderColor: h.status === 'ok' ? SAGE : RUST,
                    color: INK_500,
                    background: i === 0 ? `${INK_900}05` : 'transparent',
                  }}>
                  <span style={{ color: INK_900 }}>{h.at}</span>
                  <span className="flex-1 truncate px-3">{h.detail}</span>
                  <span
                    className="tabular-nums"
                    style={{ color: h.status === 'ok' ? SAGE : RUST }}>
                    {(h.ms / 1000).toFixed(2)}s
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Endpoint info */}
        <div
          className="mt-12 rounded-md p-4 text-xs"
          style={{ background: CREAM_LIGHT, border: `1px dashed ${INK_900}25`, color: INK_500 }}>
          <p className="mb-1">
            <span style={{ color: INK_900 }}>Endpoint:</span>{' '}
            <code className="font-mono" style={{ color: INK_900 }}>
              {API_URL}/health
            </code>
          </p>
          <p>
            What gets pinged: a single <code className="font-mono">GET /health</code> returning{' '}
            <code className="font-mono">{`{"status":"ok"}`}</code>. The 6-agent pipeline, the Anthropic API,
            and any model calls are <span style={{ color: INK_900 }}>not</span> invoked from this page.
          </p>
        </div>
      </div>
    </div>
  );
}
