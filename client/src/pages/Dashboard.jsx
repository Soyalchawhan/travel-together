import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tripsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Plus, MapPin, Calendar, Users, DollarSign, Hash, Plane, Loader } from 'lucide-react'

const STATUS_COLOR = {
  planning: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
}

const DESTINATION_EMOJIS = {
  'Goa': '🏖️', 'Paris': '🗼', 'Tokyo': '🗾', 'Bali': '🌴', 'London': '🇬🇧',
  'New York': '🗽', 'Rome': '🏛️', 'Dubai': '🏙️',
}

const getEmoji = (dest) => {
  for (const [key, emoji] of Object.entries(DESTINATION_EMOJIS)) {
    if (dest?.toLowerCase().includes(key.toLowerCase())) return emoji
  }
  return '✈️'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [createForm, setCreateForm] = useState({
    title: '', destination: '', description: '', budget: '', startDate: '', endDate: ''
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')

  useEffect(() => {
    tripsAPI.getAll()
      .then(({ data }) => setTrips(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCreateTrip = async (e) => {
    e.preventDefault()
    setCreateError(''); setCreateLoading(true)
    try {
      const { data } = await tripsAPI.create(createForm)
      setTrips([data, ...trips])
      setShowCreate(false)
      setCreateForm({ title: '', destination: '', description: '', budget: '', startDate: '', endDate: '' })
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create trip')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleJoinTrip = async (e) => {
    e.preventDefault()
    setJoinError('')
    try {
      const { data } = await tripsAPI.join(inviteCode)
      setTrips([data, ...trips])
      setShowJoin(false)
      setInviteCode('')
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Invalid invite code')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hey, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your trips and plan adventures</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowJoin(true); setShowCreate(false) }}
            className="btn-secondary flex items-center gap-2"
          >
            <Hash size={16} /> Join Trip
          </button>
          <button
            onClick={() => { setShowCreate(true); setShowJoin(false) }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> New Trip
          </button>
        </div>
      </div>

      {/* Create Trip Form */}
      {showCreate && (
        <div className="card mb-6 border-blue-200 bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-blue-600" /> Create New Trip
          </h3>
          {createError && <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-3 text-sm">{createError}</div>}
          <form onSubmit={handleCreateTrip} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Trip Title *</label>
                <input className="input bg-white" placeholder="Weekend in Goa" value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Destination *</label>
                <input className="input bg-white" placeholder="Goa, India" value={createForm.destination}
                  onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })} required />
              </div>
              <div>
                <label className="label">Total Budget (₹) *</label>
                <input type="number" className="input bg-white" placeholder="50000" value={createForm.budget}
                  onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })} required />
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input bg-white" placeholder="A fun beach trip!" value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Start Date *</label>
                <input type="date" className="input bg-white" value={createForm.startDate}
                  onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })} required />
              </div>
              <div>
                <label className="label">End Date *</label>
                <input type="date" className="input bg-white" value={createForm.endDate}
                  onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })} required />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="btn-primary" disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create Trip'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Join Trip Form */}
      {showJoin && (
        <div className="card mb-6 border-purple-200 bg-purple-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Hash size={18} className="text-purple-600" /> Join a Trip
          </h3>
          {joinError && <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-3 text-sm">{joinError}</div>}
          <form onSubmit={handleJoinTrip} className="flex gap-3">
            <input
              className="input bg-white flex-1 uppercase"
              placeholder="Enter invite code (e.g. GOA123)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              required
            />
            <button type="submit" className="btn-primary whitespace-nowrap">Join Trip</button>
            <button type="button" className="btn-secondary" onClick={() => setShowJoin(false)}>Cancel</button>
          </form>
          <p className="text-xs text-purple-600 mt-2">💡 Try invite code: <strong>GOA123</strong> or <strong>PAR456</strong></p>
        </div>
      )}

      {/* Trip Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-blue-500" size={32} />
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No trips yet</h3>
          <p className="text-gray-400 mb-6">Create your first trip or join one with an invite code</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 mx-auto">
            <Plus size={16} /> Plan your first trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map((trip) => (
            <Link key={trip._id} to={`/trips/${trip._id}`} className="card hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{getEmoji(trip.destination)}</div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[trip.status]}`}>
                  {trip.status}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors leading-tight mb-1">
                {trip.title}
              </h3>
              <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
                <MapPin size={13} /> {trip.destination}
              </p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400 shrink-0" />
                  <span>
                    {new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {' – '}
                    {new Date(trip.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-gray-400 shrink-0" />
                  <span>₹{Number(trip.budget).toLocaleString('en-IN')} budget</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-gray-400 shrink-0" />
                  <div className="flex items-center gap-1">
                    {trip.members?.slice(0, 4).map((m, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold -ml-1 first:ml-0 border-2 border-white">
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                    ))}
                    {trip.members?.length > 4 && (
                      <span className="text-xs text-gray-500">+{trip.members.length - 4}</span>
                    )}
                    <span className="text-xs text-gray-500 ml-1">{trip.members?.length} member{trip.members?.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Invite code */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">Invite code</span>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {trip.inviteCode}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
