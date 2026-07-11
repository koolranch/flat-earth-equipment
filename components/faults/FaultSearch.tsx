'use client';
import { useState } from 'react';

interface FaultSearchProps {
  brand: string;
}

interface FaultItem {
  id: string;
  code: string;
  title?: string;
  meaning?: string;
  severity: 'info' | 'warn' | 'fault' | 'stop';
  likely_causes?: string[];
  checks?: string[];
  fixes?: string[];
  model_pattern?: string;
  provenance?: string;
}

interface FaultSearchResponse {
  brand: string;
  query: {
    code: string | null;
    model: string | null;
    limit: number;
  };
  retrieval: {
    brand: string;
    steps: string;
    model_pattern: string | null;
  } | null;
  count: number;
  items: FaultItem[];
  disclaimer: string;
}

const PLACEHOLDERS: Record<string, { code: string; model: string }> = {
  jcb: { code: 'Fault code (e.g., P0087, E485)', model: 'Model (optional, e.g., 3CX, 535-95)' },
  jlg: { code: 'Fault code (e.g., 223, E045)', model: 'Model (optional, e.g., E450AJ)' },
  genie: { code: 'Fault code (e.g., 23, LF01)', model: 'Model (optional, e.g., GS-1930)' },
};

export default function FaultSearch({ brand }: FaultSearchProps) {
  const [code, setCode] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FaultSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const placeholders = PLACEHOLDERS[brand] ?? {
    code: 'Fault code (e.g., 223, E045)',
    model: 'Model (optional)',
  };

  async function run() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ brand, limit: '100' });
      if (code) params.set('code', code);
      if (model) params.set('model', model);
      const res = await fetch(`/api/fault-codes/search?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Search failed');
      setData(json);
      try {
        (window as any).va?.('fault_search', {
          brand,
          code: code || null,
          model: model || null,
          count: json.count,
        });
      } catch {}
    } catch (e: any) {
      setError(e.message);
      try {
        (window as any).va?.('fault_search_error', {
          brand,
          error: e.message,
          code: code || null,
          model: model || null,
        });
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') run();
          }}
          placeholder={placeholders.code}
          className="border rounded-lg px-3 py-2 bg-white"
          aria-label="Fault code"
        />
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') run();
          }}
          placeholder={placeholders.model}
          className="border rounded-lg px-3 py-2 bg-white"
          aria-label="Model"
        />
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="rounded-lg bg-primary text-primary-foreground px-3 py-2 hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Search Faults'}
        </button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {data && (
        <div className="space-y-4">
          {data.retrieval?.steps && (
            <div className="rounded-xl border p-3 bg-card">
              <div className="font-semibold mb-1">How to read codes on {brand.toUpperCase()}</div>
              <p className="text-sm whitespace-pre-wrap">{data.retrieval.steps}</p>
            </div>
          )}
          <FaultTable items={data.items} brand={brand} />
          {data.disclaimer && (
            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <strong>Disclaimer:</strong> {data.disclaimer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  tone: 'info' | 'warn' | 'fault' | 'stop';
}

function Badge({ children, tone }: BadgeProps) {
  const cls =
    tone === 'info'
      ? 'bg-blue-100 text-blue-800'
      : tone === 'warn'
        ? 'bg-yellow-100 text-yellow-800'
        : tone === 'stop'
          ? 'bg-red-100 text-red-800'
          : 'bg-orange-100 text-orange-800';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${cls}`}>{children}</span>;
}

interface FaultTableProps {
  items: FaultItem[];
  brand: string;
}

function ListBlock({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{label}</div>
      <ul className="list-disc pl-4 space-y-0.5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function FaultTable({ items, brand }: FaultTableProps) {
  if (!items?.length) {
    return (
      <div className="text-sm text-muted-foreground rounded-xl border bg-white p-4">
        No matching faults found. Try a shorter code fragment, or browse the common codes list below.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{items.length} result{items.length === 1 ? '' : 's'}</p>
      {items.map((r) => (
        <article key={r.id} className="rounded-xl border bg-white p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-base font-semibold text-slate-900">{r.code}</span>
                <Badge tone={r.severity || 'fault'}>{r.severity || 'fault'}</Badge>
              </div>
              <h3 className="font-medium text-slate-900 mt-1">{r.title || 'Fault code'}</h3>
              {r.meaning ? <p className="text-sm text-muted-foreground mt-1">{r.meaning}</p> : null}
            </div>
            <button
              type="button"
              className="underline hover:no-underline text-primary text-sm"
              onClick={() => {
                navigator.clipboard.writeText(r.code);
                try {
                  (window as any).va?.('fault_copy_code', { brand, code: r.code });
                } catch {}
              }}
            >
              Copy code
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <ListBlock label="Likely causes" items={r.likely_causes} />
            <ListBlock label="Checks" items={r.checks} />
            <ListBlock label="Fixes" items={r.fixes} />
          </div>
        </article>
      ))}
    </div>
  );
}
