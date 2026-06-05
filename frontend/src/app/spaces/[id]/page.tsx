'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { spacesApi, bookingsApi } from '@/lib/api';
import { Space } from '@/types';
import { useAuth } from '@/lib/auth-context';

const AMENITY_ICONS: Record<string, string> = {
  'Wi-Fi': 'wifi', 'Fiber Optic Wi-Fi': 'wifi', 'Projector': 'videocam',
  'Coffee': 'coffee', 'Coffee Machine': 'coffee_maker', 'Whiteboard': 'edit_note',
  'Printing': 'print', 'Kitchen Access': 'kitchen', 'High-speed AC': 'airwave',
  '4K Display': 'tv', '8K Screen': 'tv', 'Lounge Area': 'local_bar',
  'Video Conferencing': 'video_call', 'Soundproofing': 'hearing_disabled',
  'Standing Desk': 'table_restaurant', 'Locker (Optional)': 'lock',
};

// Generate time slots from 08:00 to 21:00
const generateSlots = () => {
  const slots = [];
  for (let h = 8; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
};

const ALL_SLOTS = generateSlots();
const MORNING = ALL_SLOTS.filter((s) => parseInt(s) < 13);
const AFTERNOON = ALL_SLOTS.filter((s) => parseInt(s) >= 13);

const formatDate = (d: Date) => d.toISOString().split('T')[0];

export default function SpaceDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'select' | 'confirming' | 'success'>('select');
  const [error, setError] = useState('');
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<{startTime: string, endTime: string}[]>([]);

  useEffect(() => {
    if (!id) return;
    spacesApi.getById(id as string)
      .then((res: unknown) => setSpace((res as { space: Space }).space))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !selectedDate) return;
    spacesApi.getBookedSlots(id as string, selectedDate)
      .then((res: unknown) => setBookedSlots((res as { bookings: {startTime: string, endTime: string}[] }).bookings))
      .catch(console.error);
  }, [id, selectedDate]);

  useEffect(() => {
    // Load Midtrans Snap Script dynamically on the Space Detail page
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

  const totalHours = () => {
    if (!selectedStart || !selectedEnd) return 0;
    const [sh, sm] = selectedStart.split(':').map(Number);
    const [eh, em] = selectedEnd.split(':').map(Number);
    return (eh * 60 + em - sh * 60 - sm) / 60;
  };

  const subtotal = () => space ? totalHours() * space.pricePerHour : 0;
  const serviceFee = () => Math.round(subtotal() * 0.08 * 100) / 100;
  const total = () => Math.round((subtotal() + serviceFee()) * 100) / 100;

  const isSlotBooked = (slot: string) => {
    return bookedSlots.some(b => slot >= b.startTime && slot < b.endTime);
  };

  const handleTimeSelect = (slot: string) => {
    if (isSlotBooked(slot)) return;

    if (!selectedStart) {
      setSelectedStart(slot);
      setSelectedEnd(null);
      setError('');
    } else if (!selectedEnd && slot > selectedStart) {
      const hasOverlap = bookedSlots.some(b => 
        (selectedStart <= b.startTime && slot >= b.endTime) ||
        (selectedStart >= b.startTime && selectedStart < b.endTime)
      );

      if (hasOverlap) {
        setError('Selected time range overlaps with an existing booking.');
        setSelectedStart(slot);
        setSelectedEnd(null);
      } else {
        setSelectedEnd(slot);
        setError('');
      }
    } else {
      setSelectedStart(slot);
      setSelectedEnd(null);
      setError('');
    }
  };

  const isSlotInRange = (slot: string) => {
    if (!selectedStart || !selectedEnd) return false;
    return slot >= selectedStart && slot < selectedEnd;
  };

  const handleConfirm = async () => {
    if (!user) { router.push('/auth/login'); return; }
    if (!selectedStart || !selectedEnd) { setError('Please select a start and end time.'); return; }
    if (totalHours() < 1) { setError('Booking must be at least 1 hour.'); return; }

    setBookingStep('confirming');
    setError('');

    try {
      // 1. Create the pending booking
      const res = await bookingsApi.create({
        spaceId: id as string,
        date: selectedDate,
        startTime: selectedStart,
        endTime: selectedEnd,
      }) as { booking: { _id: string } };

      const bookingId = res.booking._id;
      setCreatedBookingId(bookingId);

      // 2. Fetch the Midtrans Snap Token
      const tokenRes = await bookingsApi.getMidtransToken(bookingId) as { token: string };

      // 3. Trigger Midtrans Snap Popup
      (window as any).snap.pay(tokenRes.token, {
        onSuccess: async function(result: any) {
          try {
            await bookingsApi.pay(bookingId, result.payment_type || 'card');
            setBookingStep('success');
            router.push('/dashboard');
          } catch (e) {
            setError('Payment confirmed by Midtrans but failed to update local database.');
            setBookingStep('select');
          }
        },
        onPending: function(result: any) {
          router.push('/dashboard');
        },
        onError: function(result: any) {
          setError('Payment failed according to Midtrans.');
          setBookingStep('select');
        },
        onClose: function() {
          setError('Payment popup was closed without finishing payment.');
          setBookingStep('select');
        }
      });
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create booking.');
      setBookingStep('select');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 max-w-screen-2xl mx-auto px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-[500px] bg-surface-container-low rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-surface-container-low rounded w-3/4" />
              <div className="h-4 bg-surface-container-low rounded w-full" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!space) return (
    <>
      <Navbar />
      <main className="pt-24 text-center py-24">
        <p className="text-xl text-outline">Space not found.</p>
        <Link href="/spaces" className="text-primary font-bold mt-4 inline-block">← Back to spaces</Link>
      </main>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="pt-24 max-w-screen-2xl mx-auto px-8 md:px-12 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-24">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-12">
          {/* Gallery */}
          <section className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px]">
            <div className="col-span-3 row-span-2 relative rounded-2xl overflow-hidden group">
              <Image
                src={space.images[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200'}
                alt={space.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            {space.images[1] && (
              <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden">
                <Image src={space.images[1]} alt={space.name} fill className="object-cover" />
              </div>
            )}
            <div className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden bg-surface-container-low">
              {space.images[2] ? (
                <Image src={space.images[2]} alt={space.name} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer">
                  <span className="text-white font-bold text-sm">+{space.images.length - 2} photos</span>
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-surface-container-highest text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{space.location}</span>
              <span className="text-on-surface-variant text-sm">• {space.type}</span>
              <span className="text-on-surface-variant text-sm">• Up to {space.capacity} people</span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface leading-tight">{space.name}</h1>
            <p className="text-xl text-on-surface-variant leading-relaxed">{space.description}</p>
          </section>

          {/* Amenities */}
          <section className="space-y-8">
            <h3 className="text-2xl font-bold tracking-tight">Premium Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {space.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low transition-colors hover:bg-surface-container-high">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{AMENITY_ICONS[amenity] || 'check_circle'}</span>
                  </div>
                  <span className="font-medium text-on-surface">{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="border-t border-outline-variant/20 pt-12 pb-8">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="flex-shrink-0">
                <div className="text-6xl font-black text-primary">{space.rating}</div>
                <div className="flex text-tertiary mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${i < Math.floor(space.rating) ? 1 : 0}` }}>star</span>
                  ))}
                </div>
                <div className="text-on-surface-variant text-sm mt-1">Based on {space.reviewCount} reviews</div>
              </div>
              <blockquote className="italic text-xl text-on-surface-variant border-l-4 border-surface-container-high pl-8">
                "The space is impeccably maintained and the amenities are top-notch. Our team felt the difference in productivity immediately. This is our go-to venue for client meetings."
                <footer className="not-italic text-sm font-bold text-on-surface mt-4">— Julian Sterling, Henderson Design Studio</footer>
              </blockquote>
            </div>
          </section>
        </div>

        {/* Right Column: Booking Engine */}
        <div className="lg:col-span-4">
          <aside className="sticky top-28 bg-surface-container-lowest rounded-4xl p-8 shadow-blue-xl border border-outline-variant/10 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-sm text-on-surface-variant font-bold uppercase tracking-wider">Rate</span>
                <div className="text-4xl font-black text-on-surface tracking-tighter">
                  Rp{space.pricePerHour.toLocaleString('id-ID')}<span className="text-lg font-medium text-on-surface-variant">/hr</span>
                </div>
              </div>
              <div className={`flex items-center gap-1 font-bold text-sm ${space.status === 'available' ? 'text-green-600' : 'text-tertiary'}`}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {space.status === 'available' ? 'check_circle' : 'warning'}
                </span>
                {space.status === 'available' ? 'Available' : space.status}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Select Date</label>
              <input
                type="date"
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 border-none focus:ring-1 focus:ring-primary/20 font-medium"
                value={selectedDate}
                min={formatDate(new Date())}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedStart(null); setSelectedEnd(null); }}
              />
            </div>

            {/* Time Slots */}
            <div className="space-y-5">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant block mb-3">Morning Slots</label>
                <div className="grid grid-cols-3 gap-2">
                  {MORNING.map((slot) => {
                    const booked = isSlotBooked(slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => handleTimeSelect(slot)}
                        disabled={booked}
                        className={`py-2 text-xs rounded-lg font-bold transition-all ${
                          booked
                            ? 'border border-outline-variant/10 bg-surface-container-lowest text-outline-variant/40 cursor-not-allowed line-through'
                            : slot === selectedStart || slot === selectedEnd
                            ? 'border-2 border-primary bg-primary text-white'
                            : isSlotInRange(slot)
                            ? 'border-2 border-primary/40 bg-primary/10 text-primary'
                            : 'border border-outline-variant/30 bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant block mb-3">Afternoon Slots</label>
                <div className="grid grid-cols-3 gap-2">
                  {AFTERNOON.map((slot) => {
                    const booked = isSlotBooked(slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => handleTimeSelect(slot)}
                        disabled={booked}
                        className={`py-2 text-xs rounded-lg font-bold transition-all ${
                          booked
                            ? 'border border-outline-variant/10 bg-surface-container-lowest text-outline-variant/40 cursor-not-allowed line-through'
                            : slot === selectedStart || slot === selectedEnd
                            ? 'border-2 border-primary bg-primary text-white'
                            : isSlotInRange(slot)
                            ? 'border-2 border-primary/40 bg-primary/10 text-primary'
                            : 'border border-outline-variant/30 bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
              {selectedStart && (
                <p className="text-xs text-on-surface-variant">
                  {selectedEnd
                    ? `Selected: ${selectedStart} → ${selectedEnd} (${totalHours()} hrs)`
                    : `Start: ${selectedStart} — now select end time`}
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            {selectedStart && selectedEnd && totalHours() > 0 && (
              <div className="pt-6 border-t border-outline-variant/20 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">{totalHours()} hrs × Rp{space.pricePerHour.toLocaleString('id-ID')}</span>
                  <span className="font-bold">Rp{subtotal().toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Service fee (8%)</span>
                  <span className="font-bold">Rp{serviceFee().toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-xl pt-2">
                  <span className="font-black tracking-tight">Total</span>
                  <span className="font-black text-primary tracking-tight">Rp{total().toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-error/10 text-error rounded-xl px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={bookingStep === 'confirming' || space.status !== 'available'}
              className="w-full py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {bookingStep === 'confirming' ? (
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
              ) : (
                <>Confirm Reservation <span className="material-symbols-outlined">arrow_forward</span></>
              )}
            </button>

            <p className="text-[10px] text-center text-on-surface-variant px-4">
              Free cancellation until 24 hours before check-in. Professional conduct guidelines apply
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
