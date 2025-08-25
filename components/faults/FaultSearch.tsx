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

export default function FaultSearch({ brand }: FaultSearchProps) {
  const [code, setCode] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FaultSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          count: json.count 
        }); 
      } catch {}
    } catch (e: any) {
      setError(e.message);
      try { 
        (window as any).va?.('fault_search_error', { 
          brand, 
          error: e.message,
          code: code || null, 
          model: model || null 
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
          placeholder="Fault code (e.g., 223, E045)" 
          className="border rounded-lg px-3 py-2" 
        />
        <input 
          value={model} 
          onChange={(e) => setModel(e.target.value)} 
          placeholder="Model (optional, e.g., E450AJ, GS-1930)" 
          className="border rounded-lg px-3 py-2" 
        />
        <button 
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
  const cls = tone === 'info' 
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

export function FaultTable({ items, brand }: FaultTableProps) {
  if (!items?.length) return <div className="text-sm text-muted-foreground">No matching faults found.</div>;
  
  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-2">Code</th>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Meaning</th>
            <th className="text-left p-2">Severity</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2 font-mono">{r.code}</td>
              <td className="p-2">{r.title || '—'}</td>
              <td className="p-2 text-muted-foreground">{r.meaning || '—'}</td>
              <td className="p-2">
                <Badge tone={r.severity || 'fault'}>{r.severity || 'fault'}</Badge>
              </td>
              <td className="p-2">
                <button 
                  className="underline hover:no-underline text-primary" 
                  onClick={() => { 
                    navigator.clipboard.writeText(r.code); 
                    try { 
                      (window as any).va?.('fault_copy_code', { brand, code: r.code }); 
                    } catch {} 
                  }}
                >
                  Copy code
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
