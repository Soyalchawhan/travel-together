import axios from 'axios'

const api = axios.create({
  baseURL:'https://travel-together-api.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(


  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

// ── Trips ─────────────────────────────────────────────
export const tripsAPI = {
  create: (data) => api.post('/trips', data),
  join: (inviteCode) => api.post('/trips/join', { inviteCode }),
  getAll: () => api.get('/trips'),
  getById: (id) => api.get(`/trips/${id}`),
  addItinerary: (tripId, data) => api.post(`/trips/${tripId}/itinerary`, data),
}

// ── Expenses ──────────────────────────────────────────
export const expensesAPI = {
  add: (data) => api.post('/expenses', data),
  getByTrip: (tripId) => api.get(`/expenses/trip/${tripId}`),
  getBalances: (tripId) => api.get(`/expenses/trip/${tripId}/balances`),
}

// ── Match ─────────────────────────────────────────────
export const matchAPI = {
  getMatches: () => api.get('/match'),
}

// ── Messages ──────────────────────────────────────────
export const messagesAPI = {
  get: (tripId) => api.get(`/messages/${tripId}`),
  send: (tripId, content) => api.post(`/messages/${tripId}`, { content }),
}

export default api
