'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { adminApi, spacesApi } from '@/lib/api';
import { Space, AdminStats, Booking } from '@/types';

const STATUS_BADGE: Record<string, string> = {
  available: 'bg-green-50 text-green-600 border border-green-100',
  maintenance: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  unavailable: 'bg-red-50 text-red-600 border border-red-100',
};

const DEFAULT_FORM: Partial<Space> = {
  name: '', description: '', type: 'Meeting Room', capacity: 1,
  pricePerHour: 0, location: '', status: 'available',
  amenities: [], images: [], featured: false,
};

export default function AdminSpacesPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [form, setForm] = useState<Partial<Space>>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [amenityInput, setAmenityInput] = useState('');
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') { router.push('/'); return; }
      fetchSpaces();
    }
  }, [user, authLoading]);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const [spacesRes, statsRes, bookingsRes] = await Promise.all([
        spacesApi.getAll() as Promise<{ spaces: Space[] }>,
        adminApi.getStats() as Promise<{ stats: AdminStats }>,
        adminApi.getAllBookings() as Promise<{ bookings: Booking[] }>,
      ]);
      setSpaces(spacesRes.spaces);
      setStats(statsRes.stats);
      setRecentBookings(bookingsRes.bookings.slice(0, 4)); // Get 4 for the activity feed
    } catch (err) {
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  };

  const openCreate = () => { setEditingSpace(null); setForm(DEFAULT_FORM); setAmenityInput(''); setImageInput(''); setShowForm(true); };
  const openEdit = (space: Space) => { setEditingSpace(space); setForm({ ...space }); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingSpace) {
        await spacesApi.update(editingSpace._id, form);
      } else {
        await spacesApi.create(form);
      }
      await fetchSpaces();
      setShowForm(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this space permanently?')) return;
    try {
      await spacesApi.delete(id);
      setSpaces(spaces.filter(s => s._id !== id));
    } catch (err) { console.error(err); }
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setForm({ ...form, amenities: [...(form.amenities || []), amenityInput.trim()] });
      setAmenityInput('');
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setForm({ ...form, images: [...(form.images || []), imageInput.trim()] });
      setImageInput('');
    }
  };

  const handleLogout = async () => { await logout(); router.push('/'); };

  return (
    <div className="text-on-surface min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="h-screen w-64 flex flex-col fixed left-0 top-0 bg-slate-50 border-r border-slate-200/50 py-8 px-4 z-50 font-headline text-sm tracking-tight">
        <div className="mb-10 px-4">
          <h1 className="text-xl font-bold tracking-tighter text-slate-900">TitikTemu</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold mt-1">Admin Console</p>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { href: '/admin', icon: 'dashboard', label: 'Overview' },
            { href: '/admin/spaces', icon: 'inventory_2', label: 'Resource Management' },
            { href: '/admin/bookings', icon: 'event_available', label: 'Bookings' },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-3 transition-colors rounded-lg ${pathname === href ? 'text-blue-600 font-bold border-r-4 border-blue-600 bg-blue-50 rounded-r-none' : 'text-slate-500 font-medium hover:bg-slate-100'}`}>
              <span className="material-symbols-outlined">{icon}</span><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-200/50 space-y-2">
          <Link href="/">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 transition-colors rounded-lg">
              <span className="material-symbols-outlined">public</span><span>Back to Website</span>
            </button>
          </Link>
          <button onClick={openCreate} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-xl font-bold text-xs shadow-sm shadow-primary/20">
            <span className="material-symbols-outlined text-sm">add</span> New Resource
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 transition-colors rounded-lg">
            <span className="material-symbols-outlined">logout</span><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* TopBar */}
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 z-40 border-b border-slate-200/20">
        <h2 className="font-headline font-bold text-lg">Resource Management</h2>
        <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-container transition-all">
          <span className="material-symbols-outlined text-sm">add</span> Add Space
        </button>
      </header>

      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Statistics Row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Today's Revenue</p>
                <h3 className="text-2xl font-bold font-headline mt-1">Rp{stats?.todayRevenue?.toLocaleString('id-ID') || '0'}</h3>
                <p className="text-xs text-green-600 font-medium mt-1">↑ 12.4% from yesterday</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">event_seat</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs font-semibold tracking-wide uppercase">Active Bookings</p>
                <h3 className="text-2xl font-bold font-headline mt-1">{stats?.activeBookings || 0}</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-1">{stats?.pendingBookings || 0} pending payment</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">leaderboard</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs font-semibold tracking-wide uppercase">Occupancy Rate</p>
                <h3 className="text-2xl font-bold font-headline mt-1">{stats?.occupancyRate || 0}%</h3>
                <div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${stats?.occupancyRate || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Split */}
          <div className="flex gap-8 items-start">
            {/* Main Section: Resource Management */}
            <section className="flex-[2] bg-surface-container-lowest rounded-xl border border-outline-variant/15 overflow-hidden">
              <div className="px-8 py-6 flex items-center justify-between">
                <div>
                  <h4 className="font-headline font-bold text-xl">Resource Management</h4>
                  <p className="text-on-surface-variant text-sm mt-1">Managing {spaces.length} total units</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs font-bold px-4 py-2 bg-surface-container hover:bg-surface-container-high transition-colors rounded-lg text-primary">
                      EXPORT CSV
                  </button>
                  <button className="text-xs font-bold px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">filter_list</span> FILTER
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-16 bg-surface-container-low rounded-xl" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-bold">
                        <th className="px-8 py-4">Room Name</th>
                        <th className="px-4 py-4">Type</th>
                        <th className="px-4 py-4">Capacity</th>
                        <th className="px-4 py-4">Price/hr</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {spaces.map((space) => (
                        <tr key={space._id} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                                <Image
                                  src={space.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200'}
                                  alt={space.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="font-semibold text-sm block">{space.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-5 text-sm text-on-surface-variant">{space.type}</td>
                          <td className="px-4 py-5 text-sm text-on-surface-variant">{space.capacity} Pax</td>
                          <td className="px-4 py-5 text-sm font-semibold">Rp{space.pricePerHour.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-5">
                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${STATUS_BADGE[space.status]}`}>
                              {space.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEdit(space)} className="text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button onClick={() => handleDelete(space._id)} className="text-slate-400 hover:text-error transition-colors">
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Right Sidebar: Activity Feed */}
            <aside className="flex-1 space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-headline font-bold text-lg">Real-time Activity</h4>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </div>
                <div className="space-y-6">
                  {recentBookings.map((b, i) => {
                    const userName = typeof b.user === 'object' ? (b.user as any).name : 'A User';
                    const icon = b.status === 'paid' ? 'check_circle' : b.status === 'cancelled' ? 'cancel' : 'add_circle';
                    const color = b.status === 'paid' ? 'bg-green-50 text-green-600' : b.status === 'cancelled' ? 'bg-error-container text-error' : 'bg-blue-50 text-primary';
                    const times = ['2 mins ago', '15 mins ago', '42 mins ago', '1 hour ago'];
                    return (
                      <div key={b._id} className="flex gap-4 group">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${color}`}>
                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant">{times[i] || 'Just now'}</p>
                          <h4 className="font-bold text-sm text-slate-800">{b.space ? (b.space as any).name : 'Workspace'}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{b.status === 'paid' ? `Amount: Rp${b.totalPrice.toLocaleString('id-ID')}` : `by ${userName} • ${b.startTime} - ${b.endTime}`}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link href="/admin/bookings">
                  <button className="w-full mt-8 py-3 text-xs font-bold bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant rounded-lg">
                      VIEW FULL HISTORY
                  </button>
                </Link>
              </div>

              {/* Promotional Card */}
              <div className="bg-primary text-white p-6 rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h5 className="font-headline font-bold text-lg leading-tight">Generate Weekly Report</h5>
                  <p className="text-xs text-blue-100 mt-2">Analytical insights for stakeholders are ready for export.</p>
                  <button className="mt-4 px-4 py-2 bg-white text-primary text-[11px] font-bold rounded-lg hover:bg-slate-100 transition-colors">DOWNLOAD PDF</button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-20 pointer-events-none">
                  <span className="material-symbols-outlined text-[80px]">auto_graph</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-headline font-bold">{editingSpace ? 'Edit Space' : 'Add New Space'}</h3>
              <button onClick={() => setShowForm(false)} className="material-symbols-outlined text-outline hover:text-on-surface">close</button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Name', key: 'name', type: 'text', required: true },
                { label: 'Location', key: 'location', type: 'text', required: true },
              ].map(({ label, key, type, required }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{label}</label>
                  <input
                    type={type}
                    required={required}
                    value={String(form[key as keyof Space] || '')}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-surface-container border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              ))}

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Description</label>
                <textarea
                  rows={3}
                  value={String(form.description || '')}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-surface-container border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Type</label>
                  <select className="w-full bg-surface-container border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary/20"
                    value={String(form.type || '')} onChange={(e) => setForm({ ...form, type: e.target.value as Space['type'] })}>
                    {['Hot Desk', 'Meeting Room', 'Private Office', 'Studio', 'Event Space'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</label>
                  <select className="w-full bg-surface-container border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary/20"
                    value={String(form.status || '')} onChange={(e) => setForm({ ...form, status: e.target.value as Space['status'] })}>
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Capacity (pax)</label>
                  <input type="number" min={1} value={Number(form.capacity) || 1}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className="w-full bg-surface-container border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Price / Hour (Rp)</label>
                  <input type="number" min={0} step={0.01} value={Number(form.pricePerHour) || 0}
                    onChange={(e) => setForm({ ...form, pricePerHour: Number(e.target.value) })}
                    className="w-full bg-surface-container border-none rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary/20" />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Amenities</label>
                <div className="flex gap-2">
                  <input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    placeholder="e.g. Wi-Fi" className="flex-1 bg-surface-container border-none rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary/20" />
                  <button type="button" onClick={addAmenity} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(form.amenities || []).map((a, i) => (
                    <span key={i} className="flex items-center gap-1 bg-surface-container px-3 py-1 rounded-full text-xs font-medium">
                      {a}
                      <button onClick={() => setForm({ ...form, amenities: form.amenities?.filter((_, j) => j !== i) })} className="text-outline hover:text-error ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Image URLs</label>
                <div className="flex gap-2">
                  <input value={imageInput} onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                    placeholder="https://..." className="flex-1 bg-surface-container border-none rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary/20" />
                  <button type="button" onClick={addImage} className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold">Add</button>
                </div>
                <div className="space-y-1">
                  {(form.images || []).map((url, i) => (
                    <div key={i} className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-lg text-xs">
                      <span className="flex-1 truncate">{url}</span>
                      <button onClick={() => setForm({ ...form, images: form.images?.filter((_, j) => j !== i) })} className="text-outline hover:text-error">×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20" />
                <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Show as Featured Space on homepage</label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-outline-variant/30 font-semibold hover:bg-surface-container transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all disabled:opacity-60">
                {saving ? 'Saving...' : editingSpace ? 'Update Space' : 'Create Space'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
