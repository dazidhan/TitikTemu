'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { bookingsApi } from '@/lib/api';
import { Booking, Space } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-primary/10 text-primary',
  pending: 'bg-tertiary/10 text-tertiary',
  completed: 'bg-outline/10 text-outline',
  cancelled: 'bg-error/10 text-error',
};

const STATUS_LABEL: Record<string, string> = {
  paid: 'Confirmed',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !user) { router.push('/auth/login'); return; }
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin/spaces');
        return;
      }
      bookingsApi.getAll()
        .then((res: unknown) => setBookings((res as { bookings: Booking[] }).bookings))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Load Midtrans Snap Script dynamically
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleLogout = async () => { await logout(); router.push('/'); };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    const isPast = new Date(b.date) < new Date();
    return filter === 'past' ? isPast : !isPast;
  });

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingsApi.updateStatus(id, 'cancelled');
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) { console.error(err); }
  };

  const handlePay = async (bookingId: string) => {
    try {
      const res = await bookingsApi.getMidtransToken(bookingId) as { token: string };
      
      (window as any).snap.pay(res.token, {
        onSuccess: async function(result: any) {
          try {
            await bookingsApi.pay(bookingId, result.payment_type || 'card');
            window.location.reload();
          } catch (e) {
            console.error('Payment confirmed by Midtrans but failed to update DB.');
          }
        },
        onPending: function(result: any) {
          console.log('Payment pending', result);
        },
        onError: function(result: any) {
          console.error('Payment failed', result);
        },
        onClose: function() {
          console.log('Payment popup closed');
        }
      });
    } catch (err) {
      console.error('Failed to initialize payment', err);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin material-symbols-outlined text-4xl text-primary">progress_activity</div>
    </div>
  );

  return (
    <div className="bg-background text-on-surface min-h-screen flex overflow-x-hidden">
      {/* Sidebar */}
      <aside className="h-screen w-64 flex flex-col fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/20">
        <div className="text-xl font-bold text-on-surface px-6 py-8 font-headline tracking-tight">
          The Workspace
        </div>
        <nav className="flex flex-col flex-1 py-4">
          {[
            { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
            { href: '/dashboard/profile', icon: 'account_circle', label: 'Profile' },
            { href: '/spaces', icon: 'grid_view', label: 'Browse Spaces' },
          ].map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all duration-200 ${
                pathname === href
                  ? 'text-primary bg-white rounded-r-xl border-l-4 border-primary mr-4'
                  : 'text-slate-500 hover:text-on-surface hover:bg-white/50'
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}

          <div className="mt-auto px-6 py-8">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest shadow-blue-sm mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user?.name}</p>
                <p className="text-[10px] text-on-surface-variant truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full text-left text-sm text-slate-500 hover:text-error flex items-center gap-2 px-2 py-2">
              <span className="material-symbols-outlined text-base">logout</span> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 flex flex-col min-w-0">
        {/* TopBar */}
        <header className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-xl flex justify-between items-center h-16 px-8 border-b border-outline-variant/10 shadow-blue-sm">
          <h1 className="text-lg font-black font-headline">My Bookings</h1>
          <div className="flex items-center gap-4">
            <Link href="/spaces">
              <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-container transition-all">
                + Book a Space
              </button>
            </Link>
          </div>
        </header>

        <section className="p-8 space-y-10 pb-32">
          {/* Welcome banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-2 bg-gradient-to-br from-primary to-primary-container p-8 rounded-2xl text-on-primary relative overflow-hidden flex flex-col justify-end min-h-[200px]">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <span className="material-symbols-outlined text-[120px]">calendar_month</span>
              </div>
              <h2 className="text-3xl font-extrabold font-headline mb-2">Welcome back, {user?.name?.split(' ')[0]}.</h2>
              <p className="text-on-primary/80 font-medium max-w-md">
                You have {bookings.filter(b => b.status === 'paid' && new Date(b.date) >= new Date()).length} upcoming confirmed reservations.
              </p>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col justify-center shadow-blue-sm">
              <p className="text-xs font-bold text-primary tracking-widest uppercase mb-2">Total Bookings</p>
              <div className="text-5xl font-black font-headline mb-1">{bookings.length}</div>
              <p className="text-on-surface-variant font-medium">Reservations made</p>
            </div>
          </div>

          {/* Booking List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold font-headline">Reservation Timeline</h3>
              <div className="flex gap-2">
                {(['all', 'upcoming', 'past'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                      filter === f
                        ? 'bg-surface-container-highest text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-surface-container-low p-5 rounded-xl h-20" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-16 bg-surface-container-lowest rounded-2xl">
                <span className="material-symbols-outlined text-5xl text-outline opacity-30">event_busy</span>
                <h3 className="text-xl font-bold mt-4 text-on-surface-variant">No bookings found</h3>
                <Link href="/spaces">
                  <button className="mt-6 bg-primary text-white px-6 py-3 rounded-xl font-bold">Browse Spaces</button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const space = booking.space as Space;
                  return (
                    <div
                      key={booking._id}
                      className={`group bg-surface-container-lowest p-5 rounded-xl flex flex-wrap md:flex-nowrap items-center gap-6 transition-all duration-300 hover:shadow-blue-sm ${
                        booking.status === 'cancelled' || booking.status === 'completed' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
                        <Image
                          src={space?.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200'}
                          alt={space?.name || 'Space'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <p className="text-sm text-on-surface-variant font-medium mb-0.5">{space?.type}</p>
                        <h4 className="text-lg font-bold font-headline">{space?.name}</h4>
                      </div>
                      <div className="flex items-center gap-8 px-4 border-x border-outline-variant/20">
                        <div>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter mb-1">Date</p>
                          <p className="text-sm font-semibold">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter mb-1">Time</p>
                          <p className="text-sm font-semibold">{booking.startTime} - {booking.endTime}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter mb-1">Total</p>
                          <p className="text-sm font-semibold">Rp{booking.totalPrice.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="w-32 flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLES[booking.status] || ''}`}>
                          {STATUS_LABEL[booking.status]}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <button 
                            onClick={() => handlePay(booking._id)} 
                            className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors" 
                            title="Pay Now"
                          >
                            <span className="material-symbols-outlined text-xl">payments</span>
                          </button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'paid') && (
                          <button
                            onClick={() => handleCancel(booking._id)}
                            className="p-2 rounded-full text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
                            title="Cancel"
                          >
                            <span className="material-symbols-outlined text-xl">cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
