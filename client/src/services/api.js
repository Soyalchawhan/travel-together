import axios from 'axios'

const api = axios.create({
  baseURL: 'https://travel-together-api.onrender.com',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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

export const authAPI = {
  signup: (data)  => api.post('/auth/signup', data),
  login:  (data)  => api.post('/auth/login',  data),
  getMe:  ()      => api.get('/auth/me'),
}

export const tripsAPI = {
  create:      (data)   => api.post('/trips', data),
  join:        (code)   => api.post('/trips/join', { inviteCode: code }),
  getAll:      ()       => api.get('/trips'),
  getById:     (id)     => api.get(`/trips/${id}`),
  addItinerary:(id, data) => api.post(`/trips/${id}/itinerary`, data),
  cancel:      (id)     => api.patch(`/trips/${id}/cancel`),
  complete:    (id)     => api.patch(`/trips/${id}/complete`),
  leave:       (id)     => api.post(`/trips/${id}/leave`),
  delete:      (id)     => api.delete(`/trips/${id}`),
}

export const expensesAPI = {
  add:         (data)   => api.post('/expenses', data),
  getByTrip:   (tripId) => api.get(`/expenses/trip/${tripId}`),
  getBalances: (tripId) => api.get(`/expenses/trip/${tripId}/balances`),
}

export const matchAPI = {
  getMatches: () => api.get('/match'),
}

export const messagesAPI = {
  get:  (tripId)          => api.get(`/messages/${tripId}`),
  send: (tripId, content) => api.post(`/messages/${tripId}`, { content }),
}

export default api
