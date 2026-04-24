"use client";

import React, { useEffect, useState, useMemo } from 'react';
import RequestAdminButton from '@/components/RequestAdminButton';
import {
  Briefcase,
  Users,
  Sparkles,
  BarChart3,
  ArrowRight,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { api, getUser } from '@/lib/api';

type Stats = {
  totalCandidates: number;
  openPositions: number;
  topRanked: number;
  avgScore: number;
};

type Job = {
  _id: string;
  title: string;
  createdAt: string;
  requiredSkills?: string[];
  employmentType?: string;
};

type Candidate = {
  _id: string;
  name: string;
  email: string;
  score: number | null;
  rank: number | null;
};

export default function DashboardHome() {
  const [user] = useState(() => getUser());
  const userName = user?.name || 'User';
  const isAdmin = useMemo(() => user?.role === 'admin', [user]);

  const [stats, setStats] = useState<Stats>({
    totalCandidates: 0,
    openPositions: 0,
    topRanked: 0,
    avgScore: 0,
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requests = isAdmin
      ? [
          api.get('/api/admin/dashboard'),
          api.get('/api/admin/jobs'),
          api.get('/api/admin/top-candidates'),
        ]
      : [api.get('/api/admin/jobs'), api.get('/api/admin/top-candidates')];

    Promise.allSettled(requests).then((results) => {
      if (isAdmin) {
        const [dashResult, jobsResult, candResult] = results;

        if (dashResult.status === 'fulfilled') {
          const d = dashResult.value;
          if (!d.error) {
            setStats({
              totalCandidates: (d.totalCandidates as number) || 0,
              openPositions: (d.openPositions as number) || 0,
              topRanked: (d.topRanked as number) || 0,
              avgScore: (d.avgScore as number) || 0,
            });
          }
        }

        if (jobsResult.status === 'fulfilled' && Array.isArray(jobsResult.value)) {
          setJobs((jobsResult.value as Job[]).slice(0, 3));
        }

        if (candResult.status === 'fulfilled') {
          const cd = candResult.value;
          if (cd.candidates && Array.isArray(cd.candidates)) {
            setCandidates((cd.candidates as Candidate[]).slice(0, 4));
          }
        }
      } else {
        const [jobsResult, candResult] = results;

        if (jobsResult.status === 'fulfilled' && Array.isArray(jobsResult.value)) {
          setJobs((jobsResult.value as Job[]).slice(0, 6));
        }

        if (candResult.status === 'fulfilled') {
          const cd = candResult.value;
          if (cd.candidates && Array.isArray(cd.candidates)) {
            setCandidates((cd.candidates as Candidate[]).slice(0, 4));
          }
        }
      }

      setLoading(false);
    });
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-[#e9f2f5] space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-brand-accent tracking-tight">
          {isAdmin ? 'Dashboard.' : 'Applicant Dashboard.'}
        </h1>
        <p className="text-slate-500 font-medium">
          Welcome back, {userName}!{' '}
          {isAdmin
            ? 'You can manage jobs and review screening performance.'
            : 'You can search jobs, upload CVs, and review results.'}
        </p>
      </div>
       {!isAdmin && (
          <div className="flex justify-end">
          <RequestAdminButton />
         </div>
         )}

      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Jobs"
            value={loading ? '—' : String(stats.openPositions)}
            detail="Open positions"
            icon={<Briefcase size={20} />}
            color="bg-[#1e293b]"
          />
          <StatCard
            title="Total Candidates"
            value={loading ? '—' : String(stats.totalCandidates)}
            detail="Ready for screening"
            icon={<Users size={20} />}
            color="bg-[#0369a1]"
          />
          <StatCard
            title="Top Ranked"
            value={loading ? '—' : String(stats.topRanked)}
            detail="Score >= 80%"
            icon={<Sparkles size={20} />}
            color="bg-[#334155]"
          />
          <StatCard
            title="Avg. Score"
            value={loading ? '—' : String(stats.avgScore)}
            detail="Match score"
            icon={<BarChart3 size={20} />}
            color="bg-[#38bdf8]"
            isProgress
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickStat title="Open Jobs" value={String(jobs.length)} detail="Search available roles" />
          <QuickStat title="Upload CVs" value="1" detail="Apply to a job from the Jobs page" />
          <QuickStat title="Results" value={candidates.length ? 'Live' : 'Ready'} detail="View AI screening outcomes" />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-brand-dark">
                {isAdmin ? 'Recent Jobs' : 'Available Jobs'}
              </h3>
              <p className="text-sm text-slate-400">
                {isAdmin
                  ? 'Your latest job postings'
                  : 'Search open roles and submit CVs when you are ready'}
              </p>
            </div>
            <a
              href="/dashboard/jobs"
              className="text-brand-blue text-sm font-bold flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight size={14} />
            </a>
          </div>
          <div className="space-y-4">
            {loading && <p className="text-slate-400 text-sm">Loading...</p>}
            {!loading && jobs.length === 0 && (
              <p className="text-slate-400 text-sm">
                {isAdmin ? 'No jobs yet. Create your first job!' : 'No jobs available right now.'}
              </p>
            )}
            {jobs.map((job) => (
              <JobItem
                key={job._id}
                title={job.title}
                date={new Date(job.createdAt).toLocaleDateString()}
                tags={job.requiredSkills?.slice(0, 3) || [job.employmentType || 'full-time']}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-brand-dark">
                {isAdmin ? 'Top Candidates' : 'Latest Results'}
              </h3>
              <p className="text-sm text-slate-400">
                {isAdmin
                  ? 'Highest scoring from AI screening'
                  : 'Your most recent screening outcomes'}
              </p>
            </div>
            <a
              href="/dashboard/results"
              className="text-brand-blue text-sm font-bold flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight size={14} />
            </a>
          </div>
          <div className="space-y-3">
            {loading && <p className="text-slate-400 text-sm">Loading...</p>}
            {!loading && candidates.length === 0 && (
              <p className="text-slate-400 text-sm">
                {isAdmin ? 'No screened candidates yet.' : 'No results yet. Upload CVs to see matches.'}
              </p>
            )}
            {candidates.map((c, i) => (
              <CandidateItem
                key={c._id}
                rank={c.rank ?? i + 1}
                name={c.name}
                email={c.email}
                score={c.score ?? 0}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8">
        <h3 className="text-lg font-bold text-brand-dark mb-1">Quick Actions</h3>
        <p className="text-sm text-slate-400 mb-6">
          {isAdmin ? 'Jump to common tasks' : 'Jump to search, upload, and results'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isAdmin ? (
            <>
              <ActionButton icon={<Briefcase size={20} />} label="Create Job" href="/dashboard/jobs" />
              <ActionButton icon={<Users size={20} />} label="Candidates" href="/dashboard/candidates" />
              <ActionButton icon={<Sparkles size={20} />} label="Run Screening" href="/dashboard/screening" />
              <ActionButton icon={<CheckCircle size={20} />} label="View Results" href="/dashboard/results" />
            </>
          ) : (
            <>
              <ActionButton icon={<Briefcase size={20} />} label="Search Jobs" href="/dashboard/jobs" />
              <ActionButton icon={<Sparkles size={20} />} label="Open Jobs" href="/dashboard/jobs" />
              <ActionButton icon={<CheckCircle size={20} />} label="Account" href="/dashboard/account" />
              <ActionButton icon={<ArrowRight size={20} />} label="Dashboard" href="/dashboard" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  detail,
  icon,
  color,
  isProgress = false,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  color: string;
  isProgress?: boolean;
}) {
  return (
    <div className={`${color} rounded-[20px] p-6 text-white relative overflow-hidden shadow-lg`}>
      <div className="relative z-10">
        <p className="text-xs font-medium opacity-80 uppercase tracking-wider mb-1">{title}</p>
        <h2 className="text-4xl font-bold mb-4">{value}</h2>
        {isProgress ? (
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-white h-full"
              style={{ width: `${Math.min(parseInt(value) || 0, 100)}%` }}
            />
          </div>
        ) : (
          <p className="text-xs font-medium opacity-90">{detail}</p>
        )}
      </div>
      <div className="absolute right-4 top-6 opacity-20 bg-white/20 p-3 rounded-xl">{icon}</div>
    </div>
  );
}

function QuickStat({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <h2 className="text-4xl font-bold mb-2 text-brand-accent">{value}</h2>
      <p className="text-xs font-medium text-slate-500">{detail}</p>
    </div>
  );
}

function JobItem({ title, date, tags }: { title: string; date: string; tags: string[] }) {
  return (
    
    <div className="p-4 rounded-2xl border border-[#e9f2f5] bg-[#e9f2f5]/50 hover:bg-[#e9f2f5] transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-brand-dark group-hover:text-brand-blue transition-colors">
          {title}
        </h4>
        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
          <Calendar size={12} /> {date}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-tight"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function CandidateItem({
  rank,
  name,
  email,
  score,
}: {
  rank: number;
  name: string;
  email: string;
  score: number;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#e9f2f5] transition-all border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-[#e9f2f5] flex items-center justify-center text-xs font-bold text-slate-500">
          {rank}
        </div>
        <div>
          <p className="font-bold text-brand-dark text-sm">{name}</p>
          <p className="text-xs text-slate-400">{email}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-brand-blue font-black text-lg leading-none">{score}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{score}% match</p>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-[#e9f2f5] bg-[#e9f2f5]/30 hover:border-brand-blue hover:bg-blue-50/50 transition-all group"
    >
      <div className="text-brand-blue group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-xs font-bold text-brand-dark uppercase tracking-wide">{label}</span>
    </a>
  );
}
