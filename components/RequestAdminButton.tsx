'use client';

import { useState } from 'react';
import { getToken } from '@/lib/auth';

export default function RequestAdminButton() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      setMessage({ text: 'Please write at least 10 characters.', success: false });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const token = getToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: '✅ Request sent! You will be notified by email.', success: true });
        setReason('');
        setTimeout(() => setOpen(false), 2000);
      } else {
        setMessage({ text: data.message || 'Something went wrong.', success: false });
      }
    } catch {
      setMessage({ text: 'Network error. Please try again.', success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
      >
        Request Admin Access
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Request Admin Access</h2>
            <p className="text-sm text-gray-500 mb-4">
              Explain why you need admin privileges. The admin will review and notify you by email.
            </p>

            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. I want to post jobs for my company..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {message && (
              <p className={`text-sm mt-2 ${message.success ? 'text-green-600' : 'text-red-500'}`}>
                {message.text}
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {loading ? 'Sending...' : 'Submit Request'}
              </button>
              <button
                onClick={() => { setOpen(false); setMessage(null); setReason(''); }}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}