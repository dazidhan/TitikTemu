'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SpaceCard from '@/components/SpaceCard';
import { spacesApi } from '@/lib/api';
import { Space } from '@/types';

export default function HomePage() {
  const [featuredSpaces, setFeaturedSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchType, setSearchType] = useState('');
  const router = useRouter();

  useEffect(() => {
    spacesApi.getAll({ featured: 'true' })
      .then((res: unknown) => {
        const r = res as { spaces: Space[] };
        setFeaturedSpaces(r.spaces.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchType) params.set('type', searchType);
    if (searchLocation) params.set('search', searchLocation);
    router.push(`/spaces?${params.toString()}`);
  };

  return (
    <>
      <Navbar />
      <main className="pt-0">
        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative min-h-[870px] flex items-center justify-center px-8 md:px-12 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=90"
              alt="Modern sunlit architectural coworking space"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-slate-900/30" />
          </div>

          <div className="relative z-10 max-w-4xl w-full text-center space-y-8 mt-24">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white drop-shadow-sm">
                Find Your Perfect Workspace
              </h1>
              <p className="text-xl md:text-2xl text-white font-medium opacity-95 max-w-2xl mx-auto">
                Book flexible desks, private offices, and meeting rooms by the hour or day
              </p>
            </div>

            {/* Glassmorphic search bar */}
            <form
              onSubmit={handleSearch}
              className="bg-white/80 backdrop-blur-2xl p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2 max-w-3xl mx-auto"
            >
              <div className="flex-1 flex items-center px-6 gap-3 w-full border-b md:border-b-0 md:border-r border-slate-200/50 py-3">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full font-medium placeholder:text-slate-400 text-slate-800"
                  placeholder="Where are you going?"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <div className="flex-1 flex items-center px-6 gap-3 w-full border-b md:border-b-0 md:border-r border-slate-200/50 py-3">
                <span className="material-symbols-outlined text-primary">meeting_room</span>
                <select
                  className="bg-transparent border-none focus:ring-0 w-full font-medium text-slate-800 appearance-none"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Hot Desk">Hot Desk</option>
                  <option value="Meeting Room">Meeting Room</option>
                  <option value="Private Office">Private Office</option>
                  <option value="Studio">Studio</option>
                  <option value="Event Space">Event Space</option>
                </select>
              </div>
              <div className="flex-1 flex items-center px-6 gap-3 w-full py-3">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full font-medium text-slate-800"
                  placeholder="Select Date"
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white px-8 py-4 rounded-full font-bold w-full md:w-auto hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/30"
              >
                Find Workspace
              </button>
            </form>
          </div>
        </section>

        {/* ── FEATURED SPACES ──────────────────────────────── */}
        <section className="py-24 px-8 md:px-12 max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Featured Spaces</h2>
              <p className="text-slate-500 font-medium max-w-xl text-lg">
                Curated premium workspaces designed to inspire productivity and professional growth
              </p>
            </div>
            <Link href="/spaces">
              <button className="px-6 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all">
                View All Spaces
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-surface-container-low rounded-2xl mb-5" />
                  <div className="space-y-3">
                    <div className="h-4 bg-surface-container-low rounded w-3/4" />
                    <div className="h-6 bg-surface-container-low rounded w-full" />
                    <div className="h-4 bg-surface-container-low rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {featuredSpaces.map((space) => (
                <SpaceCard key={space._id} space={space} featured />
              ))}
            </div>
          )}
        </section>

        {/* ── SPACE TYPES ──────────────────────────────────── */}
        <section className="py-16 px-8 md:px-12 max-w-screen-2xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight mb-10">Browse by Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { type: 'Hot Desk', icon: 'computer', color: 'bg-blue-50 text-blue-600' },
              { type: 'Meeting Room', icon: 'groups', color: 'bg-purple-50 text-purple-600' },
              { type: 'Private Office', icon: 'door_front', color: 'bg-green-50 text-green-600' },
              { type: 'Studio', icon: 'mic', color: 'bg-orange-50 text-orange-600' },
              { type: 'Event Space', icon: 'celebration', color: 'bg-pink-50 text-pink-600' },
            ].map(({ type, icon, color }) => (
              <Link key={type} href={`/spaces?type=${encodeURIComponent(type)}`}>
                <div className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/40 hover:shadow-blue-sm transition-all cursor-pointer">
                  <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-2xl">{icon}</span>
                  </div>
                  <span className="font-bold text-sm text-center">{type}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── NEWSLETTER ───────────────────────────────────── */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-screen-2xl mx-auto px-8 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl font-extrabold tracking-tight leading-tight">Elevate Your Work Day</h2>
              <p className="text-slate-500 text-lg">
                Join our exclusive network of architectural-led workspaces and get weekly updates on new locations and member-only events
              </p>
              <div className="flex gap-4">
                <input
                  className="flex-1 bg-white border-none rounded-xl px-6 py-4 shadow-sm focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter your business email"
                  type="email"
                />
                <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-container transition-all">
                  Join Now
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl -rotate-2" />
              <Image
                src="https://images.unsplash.com/photo-1605152276897-4f618f831968?w=800&q=80"
                alt="Team collaborating in modern office"
                width={800}
                height={320}
                className="relative rounded-2xl w-full h-80 object-cover shadow-xl"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
