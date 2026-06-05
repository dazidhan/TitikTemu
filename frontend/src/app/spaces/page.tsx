'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SpaceCard from '@/components/SpaceCard';
import { spacesApi } from '@/lib/api';
import { Space } from '@/types';

const TYPES = ['All', 'Hot Desk', 'Meeting Room', 'Private Office', 'Studio', 'Event Space'];

function SpacesCatalog() {
  const searchParams = useSearchParams();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState(searchParams.get('type') || 'All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minCapacity, setMinCapacity] = useState('');

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeType !== 'All') params.type = activeType;
      if (search) params.search = search;
      if (minCapacity) params.capacity = minCapacity;

      const res = await spacesApi.getAll(params) as { spaces: Space[] };
      setSpaces(res.spaces);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSpaces(); }, [activeType, minCapacity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSpaces();
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 min-h-screen">
        {/* Header */}
        <section className="px-8 md:px-12 max-w-screen-2xl mx-auto py-12">
          <div className="space-y-2 mb-10">
            <h1 className="text-5xl font-extrabold tracking-tight">Find Your Space</h1>
            <p className="text-slate-500 text-lg">Discover {spaces.length} premium workspaces across our network</p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <form onSubmit={handleSearch} className="flex flex-1 items-center gap-3 bg-surface-container-lowest rounded-xl px-5 py-3 border border-outline-variant/20 shadow-sm">
              <span className="material-symbols-outlined text-outline">search</span>
              <input
                className="flex-1 bg-transparent border-none focus:ring-0 font-medium placeholder:text-outline"
                placeholder="Search by name, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="text-primary font-semibold text-sm">Search</button>
            </form>

            <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl px-5 py-3 border border-outline-variant/20">
              <span className="material-symbols-outlined text-outline">group</span>
              <select
                className="bg-transparent border-none focus:ring-0 font-medium text-sm"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
              >
                <option value="">Any Capacity</option>
                <option value="1">1+ Person</option>
                <option value="4">4+ People</option>
                <option value="8">8+ People</option>
                <option value="20">20+ People</option>
                <option value="50">50+ People</option>
              </select>
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-3 mb-12">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  activeType === type
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:text-primary'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-surface-container-low rounded-2xl mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-surface-container-low rounded w-1/2" />
                    <div className="h-5 bg-surface-container-low rounded w-full" />
                    <div className="h-3 bg-surface-container-low rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : spaces.length === 0 ? (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-6xl text-outline opacity-40">search_off</span>
              <h3 className="text-xl font-bold mt-4 text-on-surface-variant">No spaces found</h3>
              <p className="text-outline mt-2">Try adjusting your filters or search terms.</p>
              <button onClick={() => { setActiveType('All'); setSearch(''); setMinCapacity(''); }} className="mt-6 text-primary font-bold underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {spaces.map((space) => (
                <SpaceCard key={space._id} space={space} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function SpacesPage() {
  return (
    <Suspense>
      <SpacesCatalog />
    </Suspense>
  );
}
