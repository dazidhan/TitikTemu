'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authApi } from '@/lib/api';

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return; }
    if (user && user.role === 'admin') { router.push('/admin/spaces'); }
  }, [user, authLoading, router]);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', company: user?.company || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile(form);
      await refreshUser();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => { await logout(); router.push('/'); };

  return (
    <div className="bg-background text-on-surface min-h-screen flex overflow-x-hidden">
      {/* Sidebar */}
      <aside className="h-screen w-64 flex flex-col fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/20">
        <div className="text-xl font-bold text-on-surface px-6 py-8 font-headline tracking-tight">The Workspace</div>
        <nav className="flex flex-col flex-1 py-4">
          {[
            { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
            { href: '/dashboard/profile', icon: 'account_circle', label: 'Profile' },
            { href: '/spaces', icon: 'grid_view', label: 'Browse Spaces' },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all ${pathname === href ? 'text-primary bg-white rounded-r-xl border-l-4 border-primary mr-4' : 'text-slate-500 hover:text-on-surface hover:bg-white/50'}`}>
              <span className="material-symbols-outlined">{icon}</span><span>{label}</span>
            </Link>
          ))}
          <div className="mt-auto px-6 py-8">
            <button onClick={handleLogout} className="w-full text-left text-sm text-slate-500 hover:text-error flex items-center gap-2 px-2 py-2">
              <span className="material-symbols-outlined text-base">logout</span> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 ml-64 p-12 bg-surface">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Profile Header */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 flex items-center justify-between shadow-blue-sm border border-outline-variant/10">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl bg-primary flex items-center justify-center text-white text-4xl font-black overflow-hidden">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-headline font-extrabold tracking-tight">{user?.name}</h1>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {user?.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>
                <p className="text-on-surface-variant font-medium">{user?.email}</p>
                {user?.company && <p className="text-sm text-outline mt-1 flex items-center gap-2"><span className="material-symbols-outlined text-base">business</span>{user.company}</p>}
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-blue-sm hover:bg-primary-container transition-all"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {saved && (
            <div className="bg-green-50 text-green-700 rounded-xl px-6 py-4 font-medium flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Profile updated successfully!
            </div>
          )}

          {/* Form */}
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-blue-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-headline font-bold">Personal Information</h3>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+1 (555) 234-8901' },
                { label: 'Company', key: 'company', type: 'text', placeholder: 'Company name' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">{label}</label>
                  {editing ? (
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface font-medium focus:ring-1 focus:ring-primary/20"
                      placeholder={placeholder}
                    />
                  ) : (
                    <div className="bg-surface-container-low px-4 py-3 rounded-xl text-on-surface font-medium">
                      {form[key as keyof typeof form] || <span className="text-outline italic">Not provided</span>}
                    </div>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-2">Email Address</label>
                <div className="bg-surface-container-low px-4 py-3 rounded-xl text-on-surface-variant font-medium flex items-center gap-2">
                  {user?.email}
                  <span className="ml-auto text-[10px] text-outline uppercase tracking-widest px-2 py-0.5 bg-surface-container rounded">Verified</span>
                </div>
              </div>

              {editing && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-container transition-all disabled:opacity-60 mt-4"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/dashboard">
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-blue-sm hover:shadow-blue-md transition-all cursor-pointer flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <div>
                  <h4 className="font-bold">My Bookings</h4>
                  <p className="text-sm text-on-surface-variant">View all reservations</p>
                </div>
              </div>
            </Link>
            <Link href="/spaces">
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-blue-sm hover:shadow-blue-md transition-all cursor-pointer flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">grid_view</span>
                </div>
                <div>
                  <h4 className="font-bold">Browse Spaces</h4>
                  <p className="text-sm text-on-surface-variant">Find your next workspace</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
