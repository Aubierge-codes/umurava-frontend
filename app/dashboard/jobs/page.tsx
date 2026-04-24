"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, MapPin, Clock, Briefcase, Trash2, X, Search, ArrowRight, AlertTriangle } from 'lucide-react';
import { api, getUser } from '@/lib/api';

type Job = {
  _id: string;
  title: string;
  location?: string;
  employmentType: string;
  experienceLevel: string;
  requiredSkills: string[];
  description: string;
  shortlistLimit: number;
  educationRequired?: string;
  applicantCount?: number;
  createdAt: string;
  isActive: boolean;
};

const emptyForm = {
  title: '',
  description: '',
  location: '',
  employmentType: 'full-time',
  experienceLevel: 'mid',
  requiredSkills: '',
  educationRequired: '',
  shortlistLimit: 10,
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [pendingDeactivate, setPendingDeactivate] = useState<Job | null>(null);
  const user = getUser();
  const isAdmin = user?.role === 'admin';

  const fetchJobs = async () => {
    setLoading(true);
    const data = await api.get('/api/admin/jobs');
    if (Array.isArray(data)) setJobs(data as unknown as Job[]);
    setLoading(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchJobs();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [
      job.title,
      job.location,
      job.employmentType,
      job.experienceLevel,
      ...(job.requiredSkills || []),
    ].some((value) => String(value || '').toLowerCase().includes(q));
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const body = {
      ...form,
      requiredSkills: form.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const res = await api.post('/api/admin/job', body);
    setSaving(false);

    if (res._id) {
      setShowForm(false);
      setForm(emptyForm);
      fetchJobs();
    } else {
      setFormError((res.error as string) || (res.message as string) || 'Failed to create job');
    }
  };

  const handleDeactivate = async (id: string) => {
    await api.del(`/api/admin/job/${id}`);
    fetchJobs();
    setPendingDeactivate(null);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-brand-accent tracking-tight">
            {isAdmin ? 'Job Postings.' : 'Available Jobs.'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {isAdmin
              ? 'Create, update, and deactivate roles for your hiring pipeline.'
              : 'Search open roles and jump into CV submission.'}
          </p>
        </div>
        {isAdmin ? (
          <button
            onClick={() => { setShowForm(true); setFormError(''); }}
            className="bg-[#0369a1] text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0369a1]/20 active:scale-95 transition-transform"
          >
            <Plus size={20} /> New Job
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="bg-[#0369a1] text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0369a1]/20 active:scale-95 transition-transform"
          >
            Back to Dashboard <ArrowRight size={20} />
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-4 md:p-5 border border-white dark:border-slate-700 shadow-sm dark:shadow-none flex items-center gap-3 transition-colors">
        <Search size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs by title, skill, type, or location..."
          className="w-full bg-transparent outline-none text-sm font-medium text-brand-dark dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      {/* Create Job Modal */}
      {isAdmin && showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-brand-dark">Create New Job</h3>
              <button onClick={() => setShowForm(false)}>
                <X size={22} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1">Job Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Senior UX Designer"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1">Description *</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Job responsibilities and requirements..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-blue resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Remote / Kigali"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1">Type</label>
                  <select
                    value={form.employmentType}
                    onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-blue"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1">Experience Level</label>
                  <select
                    value={form.experienceLevel}
                    onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-blue"
                  >
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-dark mb-1">Shortlist Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.shortlistLimit}
                    onChange={(e) => setForm({ ...form, shortlistLimit: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1">Education Required</label>
                <input
                  value={form.educationRequired}
                  onChange={(e) => setForm({ ...form, educationRequired: e.target.value })}
                  placeholder="e.g. Bachelor's in CS"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-1">
                  Required Skills <span className="text-slate-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  value={form.requiredSkills}
                  onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
                  placeholder="e.g. Figma, React, User Research"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-blue"
                />
              </div>

              {formError && (
                <p className="text-red-500 text-sm font-medium text-center">{formError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-brand-blue text-white py-3 rounded-xl font-bold text-sm disabled:opacity-60"
                >
                  {saving ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdmin && pendingDeactivate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[32px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-2xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-brand-dark dark:text-slate-100">Deactivate this job?</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  <span className="font-semibold text-brand-dark dark:text-slate-200">{pendingDeactivate.title}</span> will no longer appear publicly once it is deactivated.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPendingDeactivate(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close deactivate dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDeactivate(null)}
                className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeactivate(pendingDeactivate._id)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-200/40 dark:shadow-none"
              >
                Deactivate Job
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading && <p className="text-slate-400">Loading jobs...</p>}
        {!loading && filteredJobs.length === 0 && (
          <div className="bg-white rounded-[32px] p-12 text-center shadow-sm">
            <Briefcase size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              {query.trim()
                ? 'No jobs match your search.'
                : isAdmin
                  ? 'No jobs yet. Create your first posting!'
                  : 'No public jobs are available right now.'}
            </p>
          </div>
        )}
        {filteredJobs.map((job) => (
          <JobCard
            key={job._id}
            title={job.title}
            location={job.location || 'Remote'}
            employmentType={job.employmentType}
            applicants={String(job.applicantCount || 0)}
            date={new Date(job.createdAt).toLocaleDateString()}
            status={job.isActive ? 'Active' : 'Closed'}
            onRequestDeactivate={() => setPendingDeactivate(job)}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  );
}

function JobCard({
  title, location, employmentType, applicants, date, status, onRequestDeactivate,
  isAdmin,
}: {
  title: string;
  location: string;
  employmentType: string;
  applicants: string;
  date: string;
  status: string;
  onRequestDeactivate: () => void;
  isAdmin: boolean;
}) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-[32px] shadow-sm border border-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#0369a1]/30 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#e9f2f5] rounded-2xl flex items-center justify-center text-[#0369a1] shrink-0">
          <Briefcase size={22} />
        </div>
        <div>
          <h4 className="font-bold text-[#1e293b] leading-tight">{title}</h4>
          <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase mt-1">
            <span className="flex items-center gap-1"><MapPin size={12} /> {location}</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {date}</span>
            <span className="capitalize">{employmentType}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
        <div className="text-left md:text-right">
          <p className="text-xl font-black text-[#1e293b] leading-none">{applicants}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Applicants</p>
        </div>
        <div
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {status}
        </div>
        {isAdmin && status === 'Active' && (
          <button
            onClick={onRequestDeactivate}
            title="Deactivate job"
            className="p-2 hover:bg-red-50 rounded-xl transition-colors text-slate-300 hover:text-red-500"
          >
            <Trash2 size={18} />
          </button>
        )}
        {!isAdmin && status === 'Active' && (
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-[#0369a1] text-white text-[10px] font-black uppercase tracking-wider hover:opacity-90 transition-all"
          >
            View Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
