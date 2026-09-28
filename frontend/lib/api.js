const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),

  listCenters: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/centers${qs ? `?${qs}` : ''}`);
  },
  getCenter: (id, date) => request(`/centers/${id}${date ? `?date=${date}` : ''}`),
  myCenters: (token) => request('/centers/mine', { token }),
  createCenter: (payload, token) => request('/centers', { method: 'POST', body: payload, token }),
  updateCenter: (id, payload, token) => request(`/centers/${id}`, { method: 'PATCH', body: payload, token }),
  requestVerification: (id, payload, token) =>
    request(`/centers/${id}/request-verification`, { method: 'POST', body: payload, token }),

  addCaregiver: (payload, token) => request('/caregivers', { method: 'POST', body: payload, token }),
  listCaregivers: (centerId) => request(`/caregivers?center=${centerId}`),

  createBooking: (payload, token) => request('/bookings', { method: 'POST', body: payload, token }),
  myBookings: (token) => request('/bookings/mine', { token }),
  bookingsForMyCenters: (token) => request('/bookings/for-my-centers', { token }),
  respondBooking: (id, status, token) => request(`/bookings/${id}/respond`, { method: 'PATCH', body: { status }, token }),
  checkIn: (id, token) => request(`/bookings/${id}/check-in`, { method: 'PATCH', token }),
  checkOut: (id, token) => request(`/bookings/${id}/check-out`, { method: 'PATCH', token }),

  createSubscription: (payload, token) => request('/subscriptions', { method: 'POST', body: payload, token }),
  mySubscriptions: (token) => request('/subscriptions/mine', { token }),

  adminQueue: (token) => request('/admin/queue', { token }),
  reviewCenter: (id, payload, token) => request(`/admin/centers/${id}/review`, { method: 'PATCH', body: payload, token }),
  reviewCaregiver: (id, payload, token) => request(`/admin/caregivers/${id}/review`, { method: 'PATCH', body: payload, token }),
  adminOverview: (token) => request('/admin/overview', { token }),
};
