import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Plane } from 'lucide-react'

const INTERESTS = ['beaches', 'mountains', 'adventure', 'food', 'history', 'art', 'nightlife', 'wildlife', 'sports', 'cities']

export default function Signup() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    preferences: { budget: 'moderate', interests: [], travelStyle: 'leisure' }
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const toggleInterest = (interest) => {
    const current = form.preferences.interests
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest]
    setForm({ ...form, preferences: { ...form.preferences, interests: updated } })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await authAPI.signup(form)
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-lg mb-3">
            <Plane className="text-blue-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">Join TravelTogether</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Create your account</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="label">Full name</label>
                <input className="input" placeholder="Jane Doe" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="jane@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="At least 6 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>

            {/* Travel Preferences */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
              <p className="text-sm font-semibold text-gray-700">🎒 Travel Preferences</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Budget Style</label>
                  <select className="input" value={form.preferences.budget}
                    onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, budget: e.target.value } })}>
                    <option value="budget">💰 Budget</option>
                    <option value="moderate">💳 Moderate</option>
                    <option value="luxury">💎 Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="label">Travel Style</label>
                  <select className="input" value={form.preferences.travelStyle}
                    onChange={(e) => setForm({ ...form, preferences: { ...form.preferences, travelStyle: e.target.value } })}>
                    <option value="adventure">🏔️ Adventure</option>
                    <option value="leisure">🌴 Leisure</option>
                    <option value="cultural">🏛️ Cultural</option>
                    <option value="business">💼 Business</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Interests (pick any)</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        form.preferences.interests.includes(i)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-600 hover:border-blue-400'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-base" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
