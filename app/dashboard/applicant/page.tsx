"use client";

import React, { useEffect, useState, useMemo } from 'react';
import RequestAdminButton from '@/components/RequestAdminButton';
import { Briefcase, ArrowRight, CheckCircle, UserCircle } from 'lucide-react';
import { api, getUser } from '@/lib/api';

type Job = {
  _id: string;
  title: string;
  createdAt: string;
  requiredSkills?: string[];
  employmentType?: string;
  location?: string;
};

export default function ApplicantDashboard() {
  const [user] = useState(() => getUser());
  const userName = useMemo(() => user?.name || 'User', [user]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
  api.get('/api/applications/jobs').then((res) => {
    console.log('jobs response:', res);
    const list = Array.isArray(res) ? res : (res.jobs as Job[]) || [];
    setJobs(list.slice(0, 6));
    setLoading(false);
  }).catch((err) => {
    console.error('jobs error:', err);
    setLoading(false);
  });
}, []);
  return (
    <div className="min-h-screen bg-[#e9f2f5] space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-accent tracking-tight">
            Applicant Dashboard.
          </h1>
          <p className="text-slate-500 font-medium">
            Welcome back, {userName}! Browse jobs and request admin access below.
          </p>
        </div>
        <RequestAdminButton />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Open Jobs</p>
          <h2 className="text-4xl font-bold mb-2 text-brand-accent">{loading ? '—' : jobs.length}</h2>
          <p className="text-xs font-medium text-slate-500">Available roles to apply</p>
        </div>
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Your Role</p>
          <h2 className="text-2xl font-bold mb-2 text-brand-accent">Applicant</h2>
          <p className="text-xs font-medium text-slate-500">Request admin to post jobs</p>
        </div>
        <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Status</p>
          <h2 className="text-2xl font-bold mb-2 text-brand-accent">Active</h2>
          <p className="text-xs font-medium text-slate-500">Your account is active</p>
        </div>
      </div>

      {/* Available jobs */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-brand-dark">Available Jobs</h3>
            <p className="text-sm text-slate-400">Browse open roles on the platform</p>
          </div>
          <a href="/dashboard/jobs" className="text-brand-blue text-sm font-bold flex items-center gap-1 hover:underline">
            View all <ArrowRight size={14} />
          </a>
        </div>
        <div className="space-y-4">
          {loading && <p className="text-slate-400 text-sm">Loading...</p>}
          {!loading && jobs.length === 0 && (
            <p className="text-slate-400 text-sm">No jobs available right now.</p>
          )}
          {jobs.map((job) => (
            <div key={job._id} className="p-4 rounded-2xl border border-[#e9f2f5] bg-[#e9f2f5]/50 hover:bg-[#e9f2f5] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-brand-dark">{job.title}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{job.location || 'Remote'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(job.requiredSkills?.slice(0, 3) || [job.employmentType || 'full-time']).map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-8">
        <h3 className="text-lg font-bold text-brand-dark mb-1">Quick Actions</h3>
        <p className="text-sm text-slate-400 mb-6">Jump to common tasks</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <a href="/dashboard/jobs" className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-[#e9f2f5] bg-[#e9f2f5]/30 hover:border-brand-blue hover:bg-blue-50/50 transition-all group">
            <Briefcase size={20} className="text-brand-blue group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-brand-dark uppercase tracking-wide">Browse Jobs</span>
          </a>
          <a href="/dashboard/account" className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-[#e9f2f5] bg-[#e9f2f5]/30 hover:border-brand-blue hover:bg-blue-50/50 transition-all group">
            <UserCircle size={20} className="text-brand-blue group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-brand-dark uppercase tracking-wide">My Account</span>
          </a>
          <a href="/dashboard/results" className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-[#e9f2f5] bg-[#e9f2f5]/30 hover:border-brand-blue hover:bg-blue-50/50 transition-all group">
            <CheckCircle size={20} className="text-brand-blue group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-brand-dark uppercase tracking-wide">My Results</span>
          </a>
        </div>
      </div>
    </div>
  );
}