"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Briefcase, FileText, Sparkles, Upload, X } from 'lucide-react';
import { api, getUser } from '@/lib/api';

export default function ScreeningPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = getUser();
  const isAdmin = user?.role === 'admin';

  const [jobs, setJobs] = useState<{ _id: string; title: string }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; msg: string }>({
    type: '',
    msg: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultJobId = useMemo(() => {
    const requestedJobId = searchParams.get('jobId');
    if (requestedJobId && jobs.some((job) => job._id === requestedJobId)) {
      return requestedJobId;
    }

    return jobs[0]?._id || '';
  }, [jobs, searchParams]);
  const currentJobId = selectedJobId || defaultJobId;
  const selectedJob = jobs.find((job) => job._id === currentJobId);

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace('/dashboard');
      return;
    }

    api.get('/api/admin/jobs').then((data) => {
      if (!Array.isArray(data)) return;

      const list = data as { _id: string; title: string }[];
      setJobs(list);
    });
  }, [isAdmin, router, user]);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const pdfs = Array.from(incoming).filter((f) => f.type === 'application/pdf');
    setFiles((prev) => [...prev, ...pdfs].slice(0, 50));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpload = async () => {
    if (!currentJobId) {
      setStatus({ type: 'error', msg: 'Please select a job.' });
      return;
    }
    if (!candidateName.trim()) {
      setStatus({ type: 'error', msg: 'Candidate name is required.' });
      return;
    }
    if (!candidateEmail.trim()) {
      setStatus({ type: 'error', msg: 'Candidate email is required.' });
      return;
    }
    if (files.length === 0) {
      setStatus({ type: 'error', msg: 'Please select at least one PDF file.' });
      return;
    }

    setUploading(true);
    setStatus({ type: '', msg: '' });

    const formData = new FormData();
    formData.append('jobId', currentJobId);
    formData.append('candidateName', candidateName.trim());
    formData.append('candidateEmail', candidateEmail.trim());
    files.forEach((file) => formData.append('cvs', file));

    const res = await api.upload('/api/applications/apply', formData);
    setUploading(false);

    if (res.message) {
      setStatus({
        type: 'success',
        msg: `✅ ${res.message} — AI screening started!`,
      });
      setFiles([]);
      setCandidateName('');
      setCandidateEmail('');
    } else {
      setStatus({
        type: 'error',
        msg: `❌ ${(res.error as string) || 'Upload failed. Try again.'}`,
      });
    }
  };

  if (user && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-3xl font-black text-brand-accent">Admin-only screening</h2>
        <p className="text-slate-500 font-medium">
          Screening CVs is restricted to admins. You will be redirected to the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-10 space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-brand-accent tracking-tight">
          Apply CVs with AI Screening.
        </h2>
        <p className="text-slate-500 font-medium text-sm md:text-base px-4">
          Search a job, then upload CVs to analyze candidate-job compatibility
        </p>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-brand-dark">1. Select Job & Candidate</h3>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Job Posting</label>
          {jobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              No jobs yet - create one first
            </div>
          ) : (
            <div className="relative">
              <select
                value={currentJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full appearance-none cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-brand-dark outline-none transition-colors hover:border-brand-blue/30 focus:border-brand-blue dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-brand-blue/40"
              >
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Candidate Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Candidate Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-blue"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-brand-dark">2. Upload CV(s)</h3>
        <div
          className="border-4 border-dashed border-[#e9f2f5] rounded-[32px] p-8 md:p-16 flex flex-col items-center gap-6 cursor-pointer hover:border-brand-blue/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          <div className="w-16 h-16 bg-[#e9f2f5] rounded-3xl flex items-center justify-center text-[#0369a1]">
            <Upload size={32} />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-lg md:text-xl font-bold text-[#1e293b]">Click or drag files here</p>
            <p className="text-xs md:text-sm text-slate-400 font-medium">
              PDF only · Max 50 files per batch
            </p>
          </div>
          <button
            type="button"
            className="bg-[#1e293b] text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-black/10 active:scale-95 transition-transform"
          >
            {files.length > 0 ? `${files.length} file(s) selected` : 'Select Files'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {files.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-[#e9f2f5]/50 rounded-xl px-4 py-2"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-brand-dark">
                  <FileText size={16} className="text-[#0369a1]" /> {file.name}
                </div>
                <button type="button" onClick={() => removeFile(index)}>
                  <X size={16} className="text-slate-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {status.msg && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium text-center ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {status.msg}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className="w-full bg-brand-blue text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-blue/20 hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-5 h-5 inline-block" />
            Uploading &amp; Queuing...
          </>
        ) : (
          <>
            <Sparkles size={22} /> Screen {files.length > 0 ? `${files.length} CV(s)` : 'CVs'} for {selectedJob?.title || 'the selected job'}
          </>
        )}
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-2">
        <StepCard icon={<FileText size={20} />} label="1. Parse CV Data" />
        <StepCard icon={<Sparkles size={20} />} label="2. AI Matching" />
        <StepCard icon={<Briefcase size={20} />} label="3. Rank Talent" />
      </div>
    </div>
  );
}

function StepCard({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="bg-white/60 p-5 rounded-[24px] border border-white flex flex-row sm:flex-col items-center justify-center gap-3">
      <div className="text-[#0369a1] bg-white p-2 rounded-xl shadow-sm">{icon}</div>
      <span className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest">{label}</span>
    </div>
  );
}
