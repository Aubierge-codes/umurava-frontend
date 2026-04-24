'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';

type AdminRequest = {
  _id: string;
  userId: {
    name: string;
    email: string;
    companyName?: string;
    createdAt: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    const token = getToken();
    const url =
      filter === 'all'
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin-requests`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin-requests?status=${filter}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setRequests(data.requests || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleDecision = async (id: string, decision: 'approved' | 'rejected') => {
    setActionLoading(id);
    setMessage(null);
    const token = getToken();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-requests/${id}/review`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ decision }),
      }
    );

    const data = await res.json();

    if (res.ok) {
      setMessage({ text: `✅ Request ${decision} successfully!`, success: true });
      fetchRequests();
    } else {
      setMessage({ text: data.message || 'Something went wrong.', success: false });
    }

    setActionLoading(null);
  };

  return (
    <div className="min-h-screen bg-[#e9f2f5] space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-brand-accent tracking-tight">Admin Requests</h1>
        <p className="text-slate-500 font-medium">Review and manage admin access requests.</p>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium ${
            message.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition ${
              filter === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Requests list */}
      <div className="space-y-4">
        {loading && <p className="text-slate-400 text-sm">Loading...</p>}
        {!loading && requests.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-400 text-sm border border-slate-100">
            No {filter === 'all' ? '' : filter} requests found.
          </div>
        )}
        {requests.map((req) => (
          <div
            key={req._id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-brand-dark text-base">{req.userId?.name}</p>
                <p className="text-sm text-slate-400">{req.userId?.email}</p>
                {req.userId?.companyName && (
                  <p className="text-xs text-slate-400">Company: {req.userId.companyName}</p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  req.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : req.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {req.status}
              </span>
            </div>

            <div className="bg-[#e9f2f5] rounded-xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Reason</p>
              <p className="text-sm text-slate-600">{req.reason}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-xs text-slate-400">
                Submitted: {new Date(req.createdAt).toLocaleDateString()}
              </p>

              {req.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecision(req._id, 'approved')}
                    disabled={actionLoading === req._id}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    {actionLoading === req._id ? '...' : '✅ Approve'}
                  </button>
                  <button
                    onClick={() => handleDecision(req._id, 'rejected')}
                    disabled={actionLoading === req._id}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
                  >
                    {actionLoading === req._id ? '...' : '❌ Reject'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}