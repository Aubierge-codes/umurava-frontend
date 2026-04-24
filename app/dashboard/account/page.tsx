"use client";
import React, { useState } from 'react';
import { Camera, Mail, Shield, User } from 'lucide-react';
import { getUser } from '@/lib/api';
import { getRoleLabel } from '@/lib/auth';

export default function AccountPage() {
  const user = getUser();
  const [profile, setProfile] = useState({
    name: user?.name || 'User',
    email: user?.email || '',
    role: getRoleLabel(user?.role),
    location: 'Kigali, RW',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl font-black text-brand-accent tracking-tight">Account.</h2>

      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-brand-blue rounded-2xl flex items-center justify-center text-white text-3xl font-black">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm hover:bg-slate-50">
              <Camera size={14} className="text-slate-500" />
            </button>
          </div>
          <div>
            <h3 className="text-xl font-black text-brand-dark">{profile.name}</h3>
            <p className="text-slate-500 text-sm">{profile.role}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue text-brand-dark" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" value={profile.email} disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed" />
            </div>
            <p className="text-xs text-slate-400 mt-1 ml-1">Email cannot be changed after signup.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-2">Role</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" value={profile.role} disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed" />
            </div>
          </div>
          <button className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <h3 className="font-black text-brand-dark mb-6">Security</h3>
        <a href="/login">
          <button className="w-full border border-slate-200 text-brand-dark py-4 rounded-xl font-bold hover:bg-slate-50 transition-all text-left px-4">
            Change Password →
          </button>
        </a>
      </div>
    </div>
  );
}
