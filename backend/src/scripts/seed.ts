import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Space } from '../models/space.model';
import { Booking } from '../models/booking.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password123@localhost:27017/coworking_db?authSource=admin';

const spaces = [
  // ── MEETING ROOMS ─────────────────────────────────────────────────────
  {
    name: 'The Glass Conservatory',
    description: 'Elevate your team\'s focus in a sanctuary of precision and light. The Glass Conservatory is designed for high-stakes deliberations and fluid creative workshops. Featuring 480 square feet of acoustically dampened space, this room merges architectural transparency with total corporate privacy.',
    type: 'Meeting Room',
    capacity: 14,
    pricePerHour: 145,
    amenities: ['Fiber Optic Wi-Fi', '4K Display', 'Whiteboard', 'Coffee Machine', 'High-speed AC', 'Video Conferencing'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80',
    ],
    location: 'Manhattan TitikTemu, Floor 42',
    status: 'available',
    rating: 4.9,
    reviewCount: 124,
    featured: true,
  },
  {
    name: 'The Boardroom',
    description: 'A commanding executive boardroom finished in dark walnut and brushed brass. The Boardroom seats up to 20 and features state-of-the-art AV integration, natural ventilation, and a panoramic city view. Perfect for major client presentations and board-level decisions.',
    type: 'Meeting Room',
    capacity: 20,
    pricePerHour: 250,
    amenities: ['8K Screen', 'Fiber Optic Wi-Fi', 'Video Conferencing', 'Lounge Area', 'Dedicated Concierge', 'Whiteboard'],
    images: [
      'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a9a51?w=800&q=80',
    ],
    location: 'Manhattan TitikTemu, Floor 50',
    status: 'available',
    rating: 4.8,
    reviewCount: 87,
    featured: true,
  },
  {
    name: 'The Skyloft Seminar',
    description: 'Flooded with natural light from three sides, the Skyloft Seminar is the ideal venue for workshops, training sessions, and team off-sites. Its flexible furniture arrangement supports both classroom and collaborative formats.',
    type: 'Meeting Room',
    capacity: 30,
    pricePerHour: 175,
    amenities: ['Projector', 'Microphone System', 'Fiber Optic Wi-Fi', 'Flip Charts', 'Coffee Station', 'Air Conditioning'],
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
      'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&q=80',
    ],
    location: 'Brooklyn Hub, Floor 8',
    status: 'available',
    rating: 4.7,
    reviewCount: 56,
    featured: false,
  },
  {
    name: 'Glass-Walled Meeting Room',
    description: 'A compact, elegant meeting space for focused team sessions. Floor-to-ceiling glass panels deliver total visual openness while acoustic glass ensures complete audio privacy. Seats up to 8 in the heart of the financial district.',
    type: 'Meeting Room',
    capacity: 8,
    pricePerHour: 45,
    amenities: ['Wi-Fi', 'Projector', 'Coffee', 'HDMI Cable'],
    images: [
      'https://images.unsplash.com/photo-1497366858526-0766e2f5b8c2?w=800&q=80',
    ],
    location: 'SoHo District, Floor 3',
    status: 'available',
    rating: 4.6,
    reviewCount: 98,
    featured: true,
  },

  // ── PRIVATE OFFICES ───────────────────────────────────────────────────
  {
    name: 'The Penthouse Suite',
    description: 'Command your operations from the very top. The Penthouse Suite is a 600 sq ft private office with panoramic 360° views, finished in marble, timber, and steel. Includes a dedicated lounge, private bathroom, and 24/7 concierge service.',
    type: 'Private Office',
    capacity: 4,
    pricePerHour: 320,
    amenities: ['8K Screen', 'Fiber Optic Wi-Fi', 'Private Lounge', 'Dedicated Concierge', 'Standing Desk', 'Printer', 'Safe', 'Mini Bar'],
    images: [
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80',
      'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&q=80',
    ],
    location: 'Manhattan TitikTemu, Floor 60',
    status: 'available',
    rating: 5.0,
    reviewCount: 42,
    featured: true,
  },
  {
    name: 'Suite 402',
    description: 'A refined private office designed for the discerning professional. Dark wood panelling, premium leather seating, and curated art create an atmosphere of authority. Ideal for legal, financial, or consulting practices.',
    type: 'Private Office',
    capacity: 4,
    pricePerHour: 145,
    amenities: ['Fiber Optic Wi-Fi', '4K Display', 'Printer', 'Standing Desk', 'Locker', 'Air Conditioning'],
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    ],
    location: 'Brooklyn Hub, Floor 4',
    status: 'maintenance',
    rating: 4.7,
    reviewCount: 61,
    featured: false,
  },
  {
    name: 'The Riverside Office',
    description: 'A light-filled private office on the waterfront. Designed with biophilic principles — natural wood, plants, and river views — this space promotes deep focus and creative thinking for individuals and small teams.',
    type: 'Private Office',
    capacity: 3,
    pricePerHour: 95,
    amenities: ['Wi-Fi', 'Standing Desk', 'Plants & Biophilic Design', 'Locker', 'Printing'],
    images: [
      'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&q=80',
    ],
    location: 'Riverside Hub, Floor 2',
    status: 'available',
    rating: 4.8,
    reviewCount: 33,
    featured: false,
  },

  // ── HOT DESKS ─────────────────────────────────────────────────────────
  {
    name: 'Urban Open Desk',
    description: 'A clean, ergonomic hot desk in our open-plan urban studio. Surrounded by natural light and fellow creatives, this desk comes with height adjustment, ergonomic seating, and access to all communal amenities.',
    type: 'Hot Desk',
    capacity: 1,
    pricePerHour: 25,
    amenities: ['Wi-Fi', 'Printing', 'Kitchen Access', 'Locker (Optional)'],
    images: [
      'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800&q=80',
    ],
    location: 'SoHo District, Open Floor',
    status: 'available',
    rating: 4.5,
    reviewCount: 203,
    featured: true,
  },
  {
    name: 'Urban Desk #14',
    description: 'A premium hot desk in a vibrant open-plan environment. Desk #14 occupies a window-facing position with natural lighting — the most sought-after spot on the floor.',
    type: 'Hot Desk',
    capacity: 1,
    pricePerHour: 12,
    amenities: ['Wi-Fi', 'Monitor Available', 'Coffee & Tea', 'Printing'],
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    ],
    location: 'Brooklyn Hub, Open Floor',
    status: 'available',
    rating: 4.4,
    reviewCount: 88,
    featured: false,
  },
  {
    name: 'Quiet Library Booth',
    description: 'An acoustically isolated individual work booth designed for deep-focus sessions. Sound-dampening panels, soft task lighting, and a private environment make this the ideal choice for writers, analysts, and developers.',
    type: 'Hot Desk',
    capacity: 1,
    pricePerHour: 18,
    amenities: ['Wi-Fi', 'Soundproofing', 'Task Lighting', 'USB-C Charging'],
    images: [
      'https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&q=80',
    ],
    location: 'Manhattan TitikTemu, Quiet Zone',
    status: 'available',
    rating: 4.9,
    reviewCount: 145,
    featured: false,
  },

  // ── STUDIOS ───────────────────────────────────────────────────────────
  {
    name: 'Podcast Studio A',
    description: 'A professional-grade podcast and recording studio with acoustic treatment, condenser microphones, and a live monitoring setup. Perfect for podcasters, interviewers, and content creators looking for broadcast-quality output.',
    type: 'Studio',
    capacity: 2,
    pricePerHour: 55,
    amenities: ['Condenser Microphones', 'Acoustic Panels', 'Mixing Board', 'Live Monitoring', 'Wi-Fi', 'Recording Software'],
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
    ],
    location: 'Creative Wing, Floor 1',
    status: 'available',
    rating: 4.8,
    reviewCount: 72,
    featured: true,
  },
  {
    name: 'The Photo Studio',
    description: 'A fully equipped photography and video studio with professional lighting rigs, backdrop system, and a makeup station. Suitable for product shoots, portraits, and short-form video content.',
    type: 'Studio',
    capacity: 6,
    pricePerHour: 85,
    amenities: ['Studio Lighting', 'Cyclorama Backdrop', 'Makeup Station', 'Props Storage', 'Wi-Fi', 'Memory Card Reader'],
    images: [
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
    ],
    location: 'Creative Wing, Floor 2',
    status: 'available',
    rating: 4.7,
    reviewCount: 49,
    featured: false,
  },

  // ── EVENT SPACES ─────────────────────────────────────────────────────
  {
    name: 'The Grand Atrium',
    description: 'A breathtaking 2,000 sq ft event space with soaring ceilings, brickwork, and warm amber lighting. Host product launches, networking dinners, gallery openings, and corporate galas in a space that sets the tone before guests even arrive.',
    type: 'Event Space',
    capacity: 150,
    pricePerHour: 500,
    amenities: ['Stage', 'PA System', 'LED Lighting Rig', 'Catering Kitchen', 'Bar Setup', 'AV System', 'Wi-Fi', 'Security Staff'],
    images: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
    ],
    location: 'Manhattan TitikTemu, Ground Floor',
    status: 'available',
    rating: 4.9,
    reviewCount: 31,
    featured: true,
  },
  {
    name: 'Innovation Lab',
    description: 'A modular event and workshop space designed for hackathons, design sprints, and innovation sessions. Features writable walls, modular furniture, and a built-in makerspace with 3D printers and prototyping tools.',
    type: 'Event Space',
    capacity: 40,
    pricePerHour: 120,
    amenities: ['Writable Walls', 'Modular Furniture', '3D Printers', 'PA System', 'Projector', 'High-speed Wi-Fi', 'Catering Area'],
    images: [
      'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&q=80',
    ],
    location: 'Brooklyn Hub, Floor 6',
    status: 'available',
    rating: 4.6,
    reviewCount: 18,
    featured: false,
  },
];

const bookingStatuses = ['pending', 'paid', 'cancelled', 'completed'] as const;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Space.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'TitikTemu Admin',
      email: 'admin@ledger.com',
      password: 'Admin@1234',
      role: 'admin',
      phone: '+1 (555) 000-0001',
      company: 'TitikTemu HQ',
    });

    // Create sample users
    const users = await User.create([
      {
        name: 'Alex Sterling',
        email: 'user@ledger.com',
        password: 'User@1234',
        role: 'user',
        phone: '+1 (555) 234-8901',
        company: 'Sterling & Partners Architecture',
      },
      {
        name: 'Julian Henderson',
        email: 'julian@architecture.com',
        password: 'Julian@1234',
        role: 'user',
        phone: '+1 (555) 345-9012',
        company: 'Henderson Design Studio',
      },
      {
        name: 'Sarah Nakamura',
        email: 'sarah@startup.io',
        password: 'Sarah@1234',
        role: 'user',
        phone: '+1 (555) 456-0123',
        company: 'Nakamura Tech Ventures',
      },
      {
        name: 'Marcus de Vries',
        email: 'marcus@consulting.com',
        password: 'Marcus@1234',
        role: 'user',
        phone: '+31 6 1234 5678',
        company: 'De Vries Strategy Group',
      },
      {
        name: 'Elena Weston',
        email: 'elena@media.co',
        password: 'Elena@1234',
        role: 'user',
        phone: '+44 7700 900123',
        company: 'Weston Media Productions',
      },
    ]);

    console.log(`✅ Created ${users.length + 1} users (including admin)`);

    // Create spaces with realistic IDR prices (x 15000)
    const createdSpaces = await Space.create(spaces.map(s => ({
      ...s,
      pricePerHour: s.pricePerHour * 15000
    })));
    console.log(`✅ Created ${createdSpaces.length} spaces`);

    // Create realistic bookings (past + future + various statuses)
    const now = new Date();

    const bookingData = [
      // Past COMPLETED bookings
      {
        user: users[0]._id,
        space: createdSpaces[0]._id,
        date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        startTime: '09:00',
        endTime: '11:00',
        totalHours: 2,
        totalPrice: 290 * 1.08,
        serviceFee: 290 * 0.08,
        status: 'completed',
        paymentMethod: 'card',
      },
      {
        user: users[1]._id,
        space: createdSpaces[3]._id,
        date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        startTime: '14:00',
        endTime: '16:00',
        totalHours: 2,
        totalPrice: 45 * 2 * 1.08,
        serviceFee: 45 * 2 * 0.08,
        status: 'completed',
        paymentMethod: 'e-wallet',
      },
      {
        user: users[2]._id,
        space: createdSpaces[6]._id,
        date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        startTime: '10:00',
        endTime: '12:00',
        totalHours: 2,
        totalPrice: 95 * 2 * 1.08,
        serviceFee: 95 * 2 * 0.08,
        status: 'completed',
        paymentMethod: 'bank-transfer',
      },
      {
        user: users[3]._id,
        space: createdSpaces[1]._id,
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        startTime: '13:00',
        endTime: '16:00',
        totalHours: 3,
        totalPrice: 250 * 3 * 1.08,
        serviceFee: 250 * 3 * 0.08,
        status: 'completed',
        paymentMethod: 'card',
      },
      // CANCELLED bookings
      {
        user: users[4]._id,
        space: createdSpaces[7]._id,
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        startTime: '08:00',
        endTime: '10:00',
        totalHours: 2,
        totalPrice: 25 * 2 * 1.08,
        serviceFee: 25 * 2 * 0.08,
        status: 'cancelled',
        paymentMethod: 'card',
      },
      // PAID upcoming bookings
      {
        user: users[0]._id,
        space: createdSpaces[0]._id,
        date: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        startTime: '09:00',
        endTime: '11:00',
        totalHours: 2,
        totalPrice: 145 * 2 * 1.08,
        serviceFee: 145 * 2 * 0.08,
        status: 'paid',
        paymentMethod: 'card',
      },
      {
        user: users[1]._id,
        space: createdSpaces[4]._id,
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        startTime: '10:00',
        endTime: '14:00',
        totalHours: 4,
        totalPrice: 320 * 4 * 1.08,
        serviceFee: 320 * 4 * 0.08,
        status: 'paid',
        paymentMethod: 'e-wallet',
      },
      {
        user: users[2]._id,
        space: createdSpaces[10]._id, // Podcast Studio A
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        startTime: '13:00',
        endTime: '15:00',
        totalHours: 2,
        totalPrice: 55 * 2 * 1.08,
        serviceFee: 55 * 2 * 0.08,
        status: 'paid',
        paymentMethod: 'card',
      },
      // PENDING bookings (awaiting payment)
      {
        user: users[0]._id,
        space: createdSpaces[7]._id,
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        startTime: '14:00',
        endTime: '17:00',
        totalHours: 3,
        totalPrice: 25 * 3 * 1.08,
        serviceFee: 25 * 3 * 0.08,
        status: 'pending',
      },
      {
        user: users[3]._id,
        space: createdSpaces[2]._id,
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        startTime: '09:00',
        endTime: '12:00',
        totalHours: 3,
        totalPrice: 175 * 3 * 1.08,
        serviceFee: 175 * 3 * 0.08,
        status: 'pending',
      },
      {
        user: users[4]._id,
        space: createdSpaces[12]._id, // Grand Atrium
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        startTime: '17:00',
        endTime: '22:00',
        totalHours: 5,
        totalPrice: 500 * 5 * 1.08,
        serviceFee: 500 * 5 * 0.08,
        status: 'pending',
      },
    ];

    // Normalize dates and adjust prices to realistic IDR
    bookingData.forEach(b => {
      b.date.setHours(0, 0, 0, 0);
      b.totalPrice = Math.round(b.totalPrice * 15000);
      b.serviceFee = Math.round(b.serviceFee * 15000);
    });

    const createdBookings = await Booking.create(bookingData);
    console.log(`✅ Created ${createdBookings.length} bookings`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────────');
    console.log('📧 Admin:   admin@ledger.com  / Admin@1234');
    console.log('📧 User:    user@ledger.com   / User@1234');
    console.log(`🏢 Spaces:  ${createdSpaces.length}`);
    console.log(`📅 Bookings: ${createdBookings.length}`);
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
};

seed();
