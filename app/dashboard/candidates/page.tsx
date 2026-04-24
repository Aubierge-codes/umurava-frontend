"use client";
import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { api } from '@/lib/api';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/api/admin/top-candidates').then(data => {
      const list = (data.candidates as any[]) || [];
      setCandidates(list);
      setFiltered(list);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(candidates.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.jobId?.title?.toLowerCase().includes(q)
    ));
  }, [query, candidates]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 px-1 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-brand-accent tracking-tight">Talent Pool.</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex-1 md:w-64 bg-white px-4 py-3 rounded-2xl flex items-center gap-3 border border-white shadow-sm focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input type="text" placeholder="Quick search..." value={query} onChange={e => setQuery(e.target.value)}
              className="bg-transparent outline-none text-sm font-bold w-full text-brand-dark" />
          </div>
          <button className="bg-white p-3 rounded-2xl border border-white shadow-sm text-[#1e293b] hover:bg-slate-50 transition-colors shrink-0">
            <Filter size={20}/>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] md:rounded-[32px] overflow-hidden shadow-sm border border-white">
        {loading && <p className="px-8 py-10 text-slate-400 text-sm">Loading candidates...</p>}

        {!loading && filtered.length === 0 && (
          <p className="px-8 py-10 text-center text-slate-400">
            {candidates.length === 0
              ? 'No screened candidates yet. Upload CVs in the Screening page.'
              : 'No results match your search.'}
          </p>
        )}

        {!loading && filtered.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="px-8 py-5">Candidate</th>
                    <th className="px-8 py-5">Role Match</th>
                    <th className="px-8 py-5">AI Score</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(c => (
                    <CandidateDesktopRow
                      key={c._id}
                      name={c.name}
                      email={c.email}
                      role={c.jobId?.title || 'N/A'}
                      score={String(c.score ?? '—')}
                      status={c.recommendation || c.screeningStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-50">
              {filtered.map(c => (
                <CandidateMobileCard
                  key={c._id}
                  name={c.name}
                  email={c.email}
                  role={c.jobId?.title || 'N/A'}
                  score={String(c.score ?? '—')}
                  status={c.recommendation || c.screeningStatus}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CandidateDesktopRow({ name, email, role, score, status }: any) {
  return (
    <tr className="hover:bg-[#e9f2f5]/40 transition-colors group cursor-pointer">
      <td className="px-8 py-5">
        <p className="font-bold text-[#1e293b] text-sm">{name}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{email}</p>
      </td>
      <td className="px-8 py-5">
        <span className="px-3 py-1 bg-[#e9f2f5] text-[#0369a1] text-[10px] font-black rounded-lg uppercase">{role}</span>
      </td>
      <td className="px-8 py-5">
        <span className="text-xl font-black text-[#1e293b]">{score}</span>
        {score !== '—' && <span className="text-[10px] font-bold text-slate-400 ml-1">%</span>}
      </td>
      <td className="px-8 py-5">
        <StatusBadge status={status} />
      </td>
      <td className="px-8 py-5 text-right">
        <button className="p-2 hover:bg-white rounded-xl transition-all">
          <MoreHorizontal className="text-slate-300 group-hover:text-slate-500" />
        </button>
      </td>
    </tr>
  );
}

function CandidateMobileCard({ name, email, role, score, status }: any) {
  return (
    <div className="p-5 active:bg-[#e9f2f5]/40 transition-colors flex items-center justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-[#1e293b] text-base">{name}</p>
          <StatusBadge status={status} />
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-2">{email}</p>
        <span className="px-2 py-1 bg-[#e9f2f5] text-[#0369a1] text-[9px] font-black rounded-md uppercase w-fit">{role}</span>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-2xl font-black text-[#1e293b]">{score}</span>
        <button><MoreHorizontal size={20} className="text-slate-300" /></button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Shortlist: 'bg-emerald-100 text-emerald-600',
    Consider: 'bg-amber-100 text-amber-600',
    Reject: 'bg-red-100 text-red-500',
    done: 'bg-blue-100 text-blue-600',
    pending: 'bg-slate-100 text-slate-500',
    processing: 'bg-yellow-100 text-yellow-600',
  };
  const cls = map[status] || 'bg-slate-100 text-slate-500';
  return (
    <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg ${cls}`}>{status}</span>
  );
}
