'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { bookingsApi } from '@/lib/api';
import { Booking, Space } from '@/types';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'e-wallet' | 'bank-transfer'>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) { router.push('/spaces'); return; }

    bookingsApi.getById(bookingId)
      .then((res: unknown) => setBooking((res as { booking: Booking }).booking))
      .catch(() => router.push('/spaces'))
      .finally(() => setLoading(false));

    // Load Midtrans Snap Script
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
  }, [bookingId, router]);

  const handlePay = async () => {
    if (!bookingId) return;
    setProcessing(true);
    setError('');
    try {
      const res = await bookingsApi.getMidtransToken(bookingId) as { token: string };
      
      (window as any).snap.pay(res.token, {
        onSuccess: async function(result: any) {
          try {
            await bookingsApi.pay(bookingId, paymentMethod);
            setSuccess(true);
          } catch (e) {
            setError('Payment confirmed by Midtrans but failed to update local database.');
          } finally {
            setProcessing(false);
          }
        },
        onPending: function(result: any) {
          setError('Payment is pending. Please complete the transaction.');
          setProcessing(false);
        },
        onError: function(result: any) {
          setError('Payment failed according to Midtrans.');
          setProcessing(false);
        },
        onClose: function() {
          setError('Payment popup was closed without finishing payment.');
          setProcessing(false);
        }
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen flex items-center justify-center">
        <div className="animate-spin material-symbols-outlined text-4xl text-primary">progress_activity</div>
      </main>
    </>
  );

  if (success) return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen flex items-center justify-center px-8">
        <div className="text-center max-w-md space-y-6">
          <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-5xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Booking Confirmed!</h1>
          <p className="text-on-surface-variant text-lg">
            Your reservation at <strong>{(booking?.space as Space)?.name}</strong> has been confirmed.
            A confirmation will be sent to your email.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-container transition-all">
                View My Bookings
              </button>
            </Link>
            <Link href="/spaces">
              <button className="px-8 py-4 bg-surface-container border border-outline-variant/30 rounded-xl font-bold hover:bg-surface-container-high transition-all">
                Browse Spaces
              </button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );

  const space = booking?.space as Space;
  const bookingDate = booking?.date ? new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left: Payment */}
            <div className="flex-1 space-y-10">
              <header className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">Complete your booking</h1>
                <p className="text-on-surface-variant max-w-md">Securely complete your reservation using our architectural payment portal.</p>
              </header>

              {/* Payment Methods */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight">Payment Method</h2>
                  <span className="text-xs font-medium uppercase tracking-widest text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">lock</span>Encrypted
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {([
                    { id: 'card', icon: 'credit_card', label: 'Payment Card', sub: 'Visa, Mastercard, Amex' },
                    { id: 'e-wallet', icon: 'account_balance_wallet', label: 'E-Wallet', sub: 'GoPay, OVO, PayPal' },
                    { id: 'bank-transfer', icon: 'account_balance', label: 'Bank Transfer', sub: 'Direct or SWIFT wire' },
                  ] as const).map(({ id, icon, label, sub }) => (
                    <button
                      key={id}
                      onClick={() => setPaymentMethod(id)}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === id
                          ? 'border-primary bg-surface-container-lowest'
                          : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`material-symbols-outlined text-3xl ${paymentMethod === id ? 'text-primary' : 'text-on-surface-variant'}`}>{icon}</span>
                        <div className={`w-5 h-5 rounded-full border-4 ${paymentMethod === id ? 'border-primary bg-white' : 'border-outline-variant/30'}`} />
                      </div>
                      <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface">{label}</h3>
                      <p className="text-xs text-on-surface-variant mt-1">{sub}</p>
                    </button>
                  ))}
                </div>

                {/* Card Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 p-8 bg-surface-container-low rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Cardholder Name</label>
                      <input className="w-full bg-surface-container-lowest rounded-lg px-4 py-3 text-sm border-none focus:ring-1 focus:ring-primary/20" placeholder="ALEXANDER VANDEROHE" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Card Number</label>
                      <input className="w-full bg-surface-container-lowest rounded-lg px-4 py-3 text-sm border-none focus:ring-1 focus:ring-primary/20" placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Expiry Date</label>
                        <input className="w-full bg-surface-container-lowest rounded-lg px-4 py-3 text-sm border-none focus:ring-1 focus:ring-primary/20" placeholder="MM / YY" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">CVC</label>
                        <input className="w-full bg-surface-container-lowest rounded-lg px-4 py-3 text-sm border-none focus:ring-1 focus:ring-primary/20" placeholder="•••" type="password" />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-8 items-center pt-2 opacity-60">
                {[
                  { icon: 'verified_user', label: 'PCI-DSS Compliant' },
                  { icon: 'shield', label: '256-bit SSL Secure' },
                  { icon: 'encrypted', label: 'Encrypted Vault' },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">{icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:w-96">
              <div className="sticky top-32 space-y-6">
                <div className="bg-surface-container-lowest rounded-4xl p-8 shadow-blue-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                  <h2 className="text-xl font-extrabold tracking-tight mb-6">Order Summary</h2>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
                        <Image
                          src={space?.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200'}
                          alt={space?.name || 'Space'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Reserved Space</span>
                        <h3 className="font-bold text-on-surface text-lg">{space?.name}</h3>
                        <p className="text-xs text-outline">{space?.location}</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-outline-variant/10">
                      <div className="flex items-center gap-3 text-on-surface-variant">
                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                        <span className="text-sm font-medium">{bookingDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <span className="material-symbols-outlined text-lg">schedule</span>
                          <span className="text-sm font-medium">{booking?.startTime} - {booking?.endTime} ({booking?.totalHours} hrs)</span>
                        </div>
                        <span className="text-sm font-bold">Rp{((booking?.totalPrice || 0) - (booking?.serviceFee || 0)).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-outline-variant/10">
                      <div className="flex justify-between text-sm text-on-surface-variant">
                        <span>Subtotal</span>
                        <span>Rp{((booking?.totalPrice || 0) - (booking?.serviceFee || 0)).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-sm text-on-surface-variant">
                        <span>Service Tax (8%)</span>
                        <span>Rp{(booking?.serviceFee || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between pt-4">
                        <span className="text-lg font-extrabold tracking-tight">Total Amount</span>
                        <span className="text-lg font-extrabold text-primary tracking-tight">Rp{(booking?.totalPrice || 0).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">{error}</div>
                  )}

                  <button
                    onClick={handlePay}
                    disabled={processing}
                    className="w-full mt-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <span className="animate-spin material-symbols-outlined">progress_activity</span>
                    ) : (
                      <>Pay Now <span className="material-symbols-outlined">arrow_forward</span></>
                    )}
                  </button>
                  <p className="mt-4 text-center text-[10px] text-on-surface-variant px-4 leading-relaxed">
                    By clicking Pay Now, you agree to our <Link href="#" className="text-primary underline">Terms of Use</Link> & <Link href="#" className="text-primary underline">Privacy Policy</Link>
                  </p>
                </div>

                {/* Help */}
                <div className="bg-surface-container-low rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary">support_agent</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">Need assistance?</h4>
                    <p className="text-[11px] text-on-surface-variant">Our concierge is available 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
