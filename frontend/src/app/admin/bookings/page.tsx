'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { adminApi } from '@/lib/api';
import { Booking, Space, User } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-50 text-green-600 border-green-100',
  pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  completed: 'bg-blue-50 text-blue-600 border-blue-100',
  cancelled: 'bg-red-50 text-red-600 border-red-100',
};

export default function AdminBookingsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') { router.push('/'); return; }
      fetchBookings();
    }
  }, [user, authLoading, filterStatus]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : undefined;
      const res = await adminApi.getAllBookings(params) as { bookings: Booking[] };
      setBookings(res.bookings);
    } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await adminApi.updateBooking(id, { status });
      setBookings(bookings.map(b => b._id === id ? { ...b, status: status as Booking['status'] } : b));
    } catch (err) { console.error(err); }
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
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 transition-colors rounded-lg">
            <span className="material-symbols-outlined">logout</span><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* TopBar */}
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 z-40 border-b border-slate-200/20">
        <h2 className="font-headline font-bold text-lg">All Bookings</h2>
        <div className="flex items-center gap-3">
          {['', 'pending', 'paid', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterStatus === s ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 overflow-hidden">
            <div className="px-8 py-6">
              <h4 className="font-headline font-bold text-xl">Booking Management</h4>
              <p className="text-on-surface-variant text-sm mt-1">{bookings.length} bookings found</p>
            </div>
            {loading ? (
              <div className="p-8 space-y-4">{[1, 2, 3, 4].map(i => <div key={i} className="animate-pulse h-16 bg-surface-container-low rounded-xl" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-bold">
                      <th className="px-8 py-4">User</th>
                      <th className="px-4 py-4">Space</th>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">Time</th>
                      <th className="px-4 py-4">Amount</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((booking) => {
                      const space = booking.space as Space;
                      const bUser = booking.user as User;
                      return (
                        <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-5">
                            <p className="text-sm font-semibold">{bUser?.name}</p>
                            <p className="text-xs text-on-surface-variant">{bUser?.email}</p>
                          </td>
                          <td className="px-4 py-5">
                            <p className="text-sm font-medium">{space?.name}</p>
                            <p className="text-xs text-on-surface-variant">{space?.type}</p>
                          </td>
                          <td className="px-4 py-5 text-sm text-on-surface-variant">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td className="px-4 py-5 text-sm text-on-surface-variant">{booking.startTime} – {booking.endTime}</td>
                          <td className="px-4 py-5 text-sm font-semibold">Rp{booking.totalPrice.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-5">
                            <span className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase ${STATUS_STYLES[booking.status] || ''}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <select
                              value={booking.status}
                              onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                              className="text-xs bg-surface-container border-none rounded-lg px-3 py-1.5 font-semibold focus:ring-1 focus:ring-primary/20"
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {bookings.length === 0 && (
                  <div className="text-center py-12 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl opacity-30">event_busy</span>
                    <p className="mt-2">No bookings found for this filter.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
