export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  company?: string;
  avatar?: string;
  createdAt?: string;
}

export interface Space {
  _id: string;
  name: string;
  description: string;
  type: 'Hot Desk' | 'Meeting Room' | 'Private Office' | 'Studio' | 'Event Space';
  capacity: number;
  pricePerHour: number;
  amenities: string[];
  images: string[];
  location: string;
  status: 'available' | 'maintenance' | 'unavailable';
  rating: number;
  reviewCount: number;
  featured: boolean;
  createdAt: string;
}

export interface Booking {
  _id: string;
  user: User | string;
  space: Space | string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalPrice: number;
  serviceFee: number;
  status: 'pending' | 'paid' | 'cancelled' | 'completed';
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalSpaces: number;
  totalBookings: number;
  activeBookings: number;
  pendingBookings: number;
  todayRevenue: number;
  occupancyRate: number;
  availableSpaces: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
