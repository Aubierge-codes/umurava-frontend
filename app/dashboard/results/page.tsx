"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, BarChart3, Cpu, ShieldCheck, Star } from 'lucide-react';
import { api, getUser } from '@/lib/api';
import GwizaLogo from '@/components/GwizaLogo';

type Job = { _id: string; title: string };

type Candidate = {
  _id: string;
  name: string;
  score: number | null;
  rank: number | null;
  strengths: string[];
  recommendation: 'Shortlist' | 'Consider' | 'Reject' | null;
};

export default function ResultsPage() {
  const router = useRouter();
  const user = getUser();
  const isAdmin = user?.role === 'admin';

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace('/dashboard');
      return;
    }

    api.get('/api/admin/jobs').then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const list = data as Job[];
        setJobs(list);
        setSelectedJobId(list[0]._id);
      }
    });
  }, [isAdmin, router, user]);

  useEffect(() => {
    if (!selectedJobId) return;
    api.get(`/api/applications/top/${selectedJobId}`).then((data) => {
      if (data.candidates && Array.isArray(data.candidates)) {
        setCandidates(data.candidates as Candidate[]);
      } else {
        setCandidates([]);
      }
    });
  }, [selectedJobId]);

  if (user && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-3xl font-black text-brand-accent">Admin-only results</h2>
        <p className="text-slate-500 font-medium">
          AI screening results are only available to admins.
        </p>
      </div>
    );
  }

  const avgScore = candidates.length
    ? Math.round(candidates.reduce((sum, candidate) => sum + (candidate.score || 0), 0) / candidates.length)
    : 0;
  const quality = avgScore > 80 ? 'High' : avgScore > 60 ? 'Medium' : avgScore > 0 ? 'Low' : '—';
  const topCandidate = candidates[0];
  const selectedJob = jobs.find((job) => job._id === selectedJobId);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#0369a1] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Live Analysis
            </span>
          </div>
          <h2 className="text-4xl font-black text-brand-accent tracking-tight">AI Insights.</h2>
          <p className="text-slate-500 font-medium">Ranked candidates for the selected job</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] shadow-sm border border-white">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-4 py-2 bg-[#e9f2f5] rounded-xl text-[10px] font-black text-[#0369a1] uppercase outline-none"
          >
            {jobs.length === 0 && <option value="">No jobs yet</option>}
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>
          <button className="bg-[#1e293b] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#0369a1] transition-all">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-brand-blue flex items-center gap-3">
                <Star className="text-amber-400 fill-amber-400" size={24} /> Top Performers
              </h3>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Sorted by Match Score
              </span>
            </div>

            {candidates.length === 0 && (
              <p className="text-slate-400 text-center py-8">
                No screened candidates for this job yet.
                <br />
                <span className="text-brand-blue font-bold">Admins can start screening from the screening page.</span>
              </p>
            )}
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <LeaderboardRow
                  key={candidate._id}
                  rank={candidate.rank ?? 0}
                  name={candidate.name}
                  score={candidate.score ?? 0}
                  tags={candidate.strengths?.slice(0, 2) || []}
                  recommendation={candidate.recommendation}
                  highlight={candidate.rank === 1}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-[#1e293b] rounded-[40px] p-8 text-white relative overflow-hidden group">
            <Cpu className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#38bdf8] rounded-2xl flex items-center justify-center">
                <GwizaLogo size={20} />
              </div>
              <h4 className="font-bold text-lg">AI Recommendation</h4>
            </div>
            {topCandidate ? (
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Based on this batch, <span className="text-white font-bold">{topCandidate.name}</span>{' '}
                scored highest at <span className="text-white font-bold">{topCandidate.score}%</span>.
                {topCandidate.recommendation === 'Shortlist' && ' Recommend for immediate technical screening.'}
              </p>
            ) : (
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Upload CVs for <strong className="text-white">{selectedJob?.title || 'this job'}</strong> to see AI recommendations here.
              </p>
            )}
            <a href="/dashboard/screening">
              <button className="w-full bg-[#38bdf8] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform">
                {candidates.length > 0 ? 'Screen More CVs' : 'Start Screening'}
              </button>
            </a>
          </div>

          <div className="bg-white rounded-[40px] p-8 border border-white shadow-sm">
            <h4 className="font-black text-[#1e293b] mb-6 flex items-center gap-2">
              <BarChart3 size={18} className="text-[#0369a1]" /> Batch Breakdown
            </h4>
            <div className="space-y-6">
              <StatMini label="Avg. Match Score" value={candidates.length ? `${avgScore}%` : '—'} color="bg-[#38bdf8]" />
              <StatMini label="Candidate Quality" value={quality} color="bg-emerald-400" />
              <StatMini label="Total Screened" value={String(candidates.length)} color="bg-amber-400" />
            </div>
          </div>

          <div className="bg-[#e9f2f5] rounded-[40px] p-8 border border-white/50">
            <div className="flex items-center gap-3 text-[#0369a1] mb-2">
              <ShieldCheck size={20} />
              <span className="font-black text-xs uppercase tracking-widest">AI Audit Ready</span>
            </div>
            <p className="text-[#0369a1]/70 text-[11px] font-bold leading-relaxed">
              All scores are generated by the AI queue and verified against job requirements. Results are bias-checked and auditable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({
  rank,
  name,
  score,
  tags,
  recommendation,
  highlight = false,
}: {
  rank: number;
  name: string;
  score: number;
  tags: string[];
  recommendation: string | null;
  highlight?: boolean;
}) {
  const recColor: Record<string, string> = {
    Shortlist: 'bg-emerald-100 text-emerald-700',
    Consider: 'bg-amber-100 text-amber-700',
    Reject: 'bg-red-100 text-red-600',
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-[24px] transition-all border ${
        highlight
          ? 'bg-[#0369a1] border-transparent shadow-xl shadow-[#0369a1]/20'
          : 'bg-[#e9f2f5]/30 border-transparent hover:bg-[#e9f2f5]/60'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
            highlight ? 'bg-white text-[#0369a1]' : 'bg-white text-slate-400 shadow-sm'
          }`}
        >
          {rank}
        </div>
        <div>
          <p className={`font-bold text-sm ${highlight ? 'text-white' : 'text-[#1e293b]'}`}>{name}</p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                  highlight
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-slate-400 border border-slate-100'
                }`}
              >
                {tag}
              </span>
            ))}
            {recommendation && (
              <span
                className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                  highlight
                    ? 'bg-white/20 text-white'
                    : recColor[recommendation] || 'bg-slate-100 text-slate-500'
                }`}
              >
                {recommendation}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`text-xl font-black leading-none ${highlight ? 'text-white' : 'text-[#0369a1]'}`}>
            {score}
          </p>
          <p className={`text-[8px] font-black uppercase ${highlight ? 'text-white/60' : 'text-slate-400'}`}>
            Score
          </p>
        </div>
        <button
          className={`p-2 rounded-xl transition-all ${
            highlight
              ? 'bg-white/20 text-white hover:bg-white/30'
              : 'bg-white text-slate-300 hover:text-[#0369a1]'
          }`}
        >
          <ArrowUpRight size={18} />
        </button>
      </div>
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-sm font-black text-[#1e293b]">{value}</span>
    </div>
  );
}
