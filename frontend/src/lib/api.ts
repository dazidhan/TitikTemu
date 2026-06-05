const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  data?: unknown;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, ...rest } = options;

  const config: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...rest,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Something went wrong');
  }

  return json;
}

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; company?: string }) =>
    apiFetch('/auth/register', { method: 'POST', data }),

  login: (data: { email: string; password: string }) =>
    apiFetch('/auth/login', { method: 'POST', data }),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),

  getMe: () =>
    apiFetch('/auth/me'),

  updateProfile: (data: { name?: string; phone?: string; company?: string; avatar?: string }) =>
    apiFetch('/auth/profile', { method: 'PUT', data }),
};

// Spaces
export const spacesApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/spaces${query}`);
  },

  getById: (id: string) =>
    apiFetch(`/spaces/${id}`),

  create: (data: unknown) =>
    apiFetch('/spaces', { method: 'POST', data }),

  update: (id: string, data: unknown) =>
    apiFetch(`/spaces/${id}`, { method: 'PUT', data }),

  delete: (id: string) =>
    apiFetch(`/spaces/${id}`, { method: 'DELETE' }),

  getBookedSlots: (id: string, date: string) =>
    apiFetch(`/spaces/${id}/bookings?date=${date}`),
};

// Bookings
export const bookingsApi = {
  getAll: () =>
    apiFetch('/bookings'),

  getById: (id: string) =>
    apiFetch(`/bookings/${id}`),

  create: (data: {
    spaceId: string;
    date: string;
    startTime: string;
    endTime: string;
    paymentMethod?: string;
    notes?: string;
  }) => apiFetch('/bookings', { method: 'POST', data }),

  updateStatus: (id: string, status: string, paymentMethod?: string) =>
    apiFetch(`/bookings/${id}/status`, { method: 'PATCH', data: { status, paymentMethod } }),

  pay: (id: string, paymentMethod: string) =>
    apiFetch(`/bookings/${id}/pay`, { method: 'POST', data: { paymentMethod } }),

  getMidtransToken: (id: string) =>
    apiFetch(`/bookings/${id}/midtrans-token`),
};

// Admin
export const adminApi = {
  getStats: () =>
    apiFetch('/admin/stats'),

  getAllBookings: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiFetch(`/admin/bookings${query}`);
  },

  updateBooking: (id: string, data: unknown) =>
    apiFetch(`/admin/bookings/${id}`, { method: 'PATCH', data }),

  getAllUsers: () =>
    apiFetch('/admin/users'),
};

export default apiFetch;
