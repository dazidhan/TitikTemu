import Image from 'next/image';
import Link from 'next/link';
import { Space } from '@/types';

const AMENITY_ICONS: Record<string, string> = {
  'Wi-Fi': 'wifi', 'Fiber Optic Wi-Fi': 'wifi', 'Projector': 'videocam',
  'Coffee': 'coffee', 'Coffee Machine': 'coffee_maker', 'Whiteboard': 'edit_note',
  'Printing': 'print', 'Kitchen Access': 'kitchen', 'High-speed AC': 'airwave',
  '4K Display': 'tv', '8K Screen': 'tv', 'Lounge Area': 'local_bar',
  'Video Conferencing': 'video_call', 'Soundproofing': 'hearing_disabled',
  'Standing Desk': 'table_restaurant', 'Locker (Optional)': 'lock',
  'USB-C Charging': 'power', 'PA System': 'speaker', 'Stage': 'theater_comedy',
};

interface SpaceCardProps {
  space: Space;
  featured?: boolean;
}

export default function SpaceCard({ space }: SpaceCardProps) {
  const imgSrc = space.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';

  return (
    /* ── Outer card wrapper: fixed height (500px), flex column, clear border & drop-shadow ── */
    <div className="group h-[500px] flex flex-col rounded-2xl bg-white border border-slate-300 shadow-md hover:shadow-2xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">

      {/* ── Image (fixed height 180px) ── */}
      <div className="relative h-[180px] w-full flex-shrink-0 overflow-hidden bg-slate-100 border-b border-slate-200">
        <Image
          src={imgSrc}
          alt={space.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-bold text-primary shadow-sm border border-slate-200/50">
          Rp{space.pricePerHour.toLocaleString('id-ID')}<span className="text-xs font-medium text-slate-500">/hr</span>
        </div>

        {/* Status / Featured badge */}
        {space.status === 'maintenance' && (
          <div className="absolute top-3 left-3 bg-tertiary text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm">
            Maintenance
          </div>
        )}
        {space.featured && space.status === 'available' && (
          <div className="absolute top-3 left-3 bg-primary text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm">
            Featured
          </div>
        )}

        {/* Hover gradient tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* ── Scrollable content body ── */}
      <div className="flex flex-col flex-1 min-h-0 bg-white">
        {/* Middle section with independent vertical scroll if content is too long */}
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">

          {/* Type + Capacity chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-blue-50 text-primary border border-blue-100 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
              {space.type}
            </span>
            <span className="flex items-center gap-1 text-slate-500 text-xs font-medium">
              <span className="material-symbols-outlined text-xs">
                {space.capacity === 1 ? 'person' : 'group'}
              </span>
              {space.capacity === 1 ? 'Single User' : `Up to ${space.capacity} people`}
            </span>
          </div>

          {/* Name */}
          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {space.name}
          </h3>

          {/* Location */}
          <div className="flex items-start gap-1.5 text-slate-500 text-xs">
            <span className="material-symbols-outlined text-sm mt-0.5 flex-shrink-0">location_on</span>
            <span className="leading-tight">{space.location}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: `'FILL' ${i < Math.floor(space.rating) ? 1 : 0}` }}
                >
                  star
                </span>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {space.rating} <span className="font-normal text-slate-400">({space.reviewCount} reviews)</span>
            </span>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-x-3 gap-y-2 pt-2">
            {space.amenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-1.5 text-slate-500">
                <span className="material-symbols-outlined text-[14px]">
                  {AMENITY_ICONS[amenity] || 'check_circle'}
                </span>
                <span className="text-xs font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Fixed CTA always pinned at the bottom ── */}
        <div className="flex-shrink-0 p-5 bg-slate-50 border-t border-slate-200">
          <Link href={`/spaces/${space._id}`} className="block">
            <button
              className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.98] ${
                space.status === 'available'
                  ? 'bg-primary text-white hover:bg-primary-container shadow-md shadow-primary/20 hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              disabled={space.status !== 'available'}
            >
              {space.status === 'available' ? 'Book Now' : 'Unavailable'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
