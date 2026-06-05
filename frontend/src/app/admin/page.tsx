'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { adminApi, spacesApi } from '@/lib/api';
import { AdminStats, Space, Booking, User } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-green-50 text-green-600 border-green-100',
  pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  completed: 'bg-blue-50 text-blue-600 border-blue-100',
  cancelled: 'bg-red-50 text-red-600 border-red-100',
};

function AdminSidebar({ activeHref }: { activeHref: string }) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => { await logout(); router.push('/'); };

  return (
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
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 transition-colors rounded-lg ${
              activeHref === href
                ? 'text-blue-600 font-bold border-r-4 border-blue-600 bg-blue-50 rounded-r-none'
                : 'text-slate-500 font-medium hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-1 pt-6 border-t border-slate-200/50">
        <Link href="/">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 transition-colors rounded-lg mb-2">
            <span className="material-symbols-outlined">public</span><span>Back to Website</span>
          </button>
        </Link>
        <Link href="/admin/spaces">
          <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-xl font-bold text-xs mb-4 shadow-sm shadow-primary/20">
            <span className="material-symbols-outlined text-sm">add</span> New Resource
          </button>
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 transition-colors rounded-lg">
          <span className="material-symbols-outlined">logout</span><span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') { router.push('/'); return; }
      Promise.all([
        adminApi.getStats() as Promise<{ stats: AdminStats }>,
        adminApi.getAllBookings() as Promise<{ bookings: Booking[] }>,
      ]).then(([statsRes, bookingsRes]) => {
        setStats(statsRes.stats);
        setRecentBookings(bookingsRes.bookings.slice(0, 5));
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin material-symbols-outlined text-4xl text-primary">progress_activity</div>
    </div>
  );

  return (
    <div className="text-on-surface min-h-screen bg-surface">
      <AdminSidebar activeHref={pathname} />

      {/* TopBar */}
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 z-40 border-b border-slate-200/20">
        <h2 className="font-headline font-bold text-lg">Overview Dashboard</h2>
      </header>

      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Today\'s Revenue', value: `Rp${stats?.todayRevenue?.toLocaleString('id-ID') || '0'}`, icon: 'payments', trend: '↑ 12.4%', trendColor: 'text-green-600' },
              { label: 'Active Bookings', value: stats?.activeBookings || 0, icon: 'event_seat', sub: `${stats?.pendingBookings || 0} pending` },
              { label: 'Total Spaces', value: stats?.totalSpaces || 0, icon: 'grid_view', sub: `${stats?.availableSpaces || 0} available` },
              { label: 'Total Users', value: stats?.totalUsers || 0, icon: 'group', sub: 'registered members' },
            ].map(({ label, value, icon, trend, trendColor, sub }) => (
              <div key={label} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs font-semibold tracking-wide uppercase">{label}</p>
                  <h3 className="text-2xl font-bold font-headline mt-1">{value}</h3>
                  {trend && <p className={`text-xs font-medium mt-1 ${trendColor}`}>{trend}</p>}
                  {sub && <p className="text-xs text-on-surface-variant font-medium mt-1">{sub}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Occupancy Rate */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-on-surface-variant text-xs font-semibold tracking-wide uppercase">Occupancy Rate</p>
                <h3 className="text-3xl font-bold font-headline mt-1">{stats?.occupancyRate || 0}%</h3>
              </div>
              <span className="material-symbols-outlined text-primary text-4xl">leaderboard</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${stats?.occupancyRate || 0}%` }} />
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 overflow-hidden">
            <div className="px-8 py-6 flex items-center justify-between">
              <h4 className="font-headline font-bold text-xl">Recent Bookings</h4>
              <Link href="/admin/bookings">
                <button className="text-xs font-bold px-4 py-2 bg-surface-container hover:bg-surface-container-high transition-colors rounded-lg text-primary">VIEW ALL</button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-8 py-4">User</th>
                    <th className="px-4 py-4">Space</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Time</th>
                    <th className="px-4 py-4">Amount</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((booking) => {
                    const space = booking.space as Space;
                    const bUser = booking.user as User;
                    return (
                      <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5 text-sm font-semibold">{bUser?.name}</td>
                        <td className="px-4 py-5 text-sm text-on-surface-variant">{space?.name}</td>
                        <td className="px-4 py-5 text-sm text-on-surface-variant">{new Date(booking.date).toLocaleDateString()}</td>
                        <td className="px-4 py-5 text-sm text-on-surface-variant">{booking.startTime} - {booking.endTime}</td>
                        <td className="px-4 py-5 text-sm font-semibold">${booking.totalPrice.toFixed(2)}</td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${STATUS_STYLES[booking.status] || ''}`}>
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
