import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tripsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Plus, MapPin, Calendar, Users, DollarSign, Hash,
  Loader, Trash2, XCircle, LogOut, CheckCircle,
  Clock, AlertTriangle, ChevronDown, History, Globe
} from 'lucide-react'

const DESTINATION_EMOJIS = {
  'Goa': '🏖️', 'Paris': '🗼', 'Tokyo': '🗾', 'Bali': '🌴',
  'London': '🇬🇧', 'New York': '🗽', 'Rome': '🏛️', 'Dubai': '🏙️',
  'Manali': '🏔️', 'Kerala': '🌿', 'Rajasthan': '🏰', 'Coorg': '☕',
  'Rishikesh': '🏄', 'Andaman': '🐠', 'Hampi': '🗿', 'Udaipur': '🏰',
}
const getEmoji = (dest) => {
  for (const [k, v] of Object.entries(DESTINATION_EMOJIS))
    if (dest?.toLowerCase().includes(k.toLowerCase())) return v
  return '✈️'
}

const STATUS_STYLE = {
  planning:  { badge: 'bg-amber-100 text-amber-700',  icon: <Clock size={12} />,         label: 'Planning'  },
  active:    { badge: 'bg-green-100 text-green-700',  icon: <CheckCircle size={12} />,    label: 'Active'    },
  completed: { badge: 'bg-blue-100 text-blue-700',    icon: <History size={12} />,        label: 'Completed' },
  cancelled: { badge: 'bg-red-100 text-red-600',      icon: <XCircle size={12} />,        label: 'Cancelled' },
}

// ── Confirm Dialog ─────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Go Back</button>
          <button onClick={onConfirm} className={`flex-1 font-semibold py-2 px-4 rounded-lg text-white transition-colors ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Trip Card ──────────────────────────────────────────
function TripCard({ trip, currentUserId, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isOrganizer = trip.createdBy?._id === currentUserId || trip.createdBy === currentUserId
  const isCancelled = trip.status === 'cancelled'
  const isCompleted = trip.status === 'completed'
  const st = STATUS_STYLE[trip.status] || STATUS_STYLE.planning

  return (
    <div className={`card relative group transition-all hover:shadow-md ${isCancelled ? 'opacity-70' : 'hover:-translate-y-0.5'}`}>
      {/* Status badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{getEmoji(trip.destination)}</div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${st.badge}`}>
            {st.icon} {st.label}
          </span>
          {/* Action menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.preventDefault(); setMenuOpen(!menuOpen) }}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ChevronDown size={14} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-48 py-1 overflow-hidden">
                  {/* Organizer actions */}
                  {isOrganizer && !isCancelled && !isCompleted && (
                    <button
                      onClick={() => { setMenuOpen(false); onAction('complete', trip) }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 transition-colors"
                    >
                      <CheckCircle size={15} /> Mark as Completed
                    </button>
                  )}
                  {isOrganizer && !isCancelled && !isCompleted && (
                    <button
                      onClick={() => { setMenuOpen(false); onAction('cancel', trip) }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <XCircle size={15} /> Cancel Trip
                    </button>
                  )}
                  {isOrganizer && (
                    <button
                      onClick={() => { setMenuOpen(false); onAction('delete', trip) }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} /> Delete Trip
                    </button>
                  )}
                  {/* Member (non-organizer) actions */}
                  {!isOrganizer && !isCancelled && (
                    <button
                      onClick={() => { setMenuOpen(false); onAction('leave', trip) }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} /> Leave Trip
                    </button>
                  )}
                  {/* If no actions available */}
                  {!isOrganizer && isCancelled && (
                    <div className="px-4 py-2.5 text-sm text-gray-400">No actions available</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Trip info — clicking navigates to detail page */}
      <Link
        to={isCancelled ? '#' : `/trips/${trip._id}`}
        onClick={(e) => { if (isCancelled) e.preventDefault() }}
        className={isCancelled ? 'cursor-not-allowed' : ''}
      >
        <h3 className={`font-bold text-lg leading-tight mb-1 ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-900 group-hover:text-blue-600 transition-colors'}`}>
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
              {trip.members?.length > 4 && <span className="text-xs text-gray-400">+{trip.members.length - 4}</span>}
              <span className="text-xs text-gray-500 ml-1">{trip.members?.length} member{trip.members?.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {isOrganizer ? '👑 You organized this' : '🧳 You joined this'}
        </span>
        <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {trip.inviteCode}
        </span>
      </div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const [trips,        setTrips]       = useState([])
  const [loading,      setLoading]     = useState(true)
  const [activeTab,    setActiveTab]   = useState('active')
  const [showCreate,   setShowCreate]  = useState(false)
  const [showJoin,     setShowJoin]    = useState(false)
  const [inviteCode,   setInviteCode]  = useState('')
  const [joinError,    setJoinError]   = useState('')
  const [createError,  setCreateError] = useState('')
  const [createLoading,setCreateLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [createForm, setCreateForm] = useState({
    title: '', destination: '', description: '', budget: '', startDate: '', endDate: ''
  })

  const userId = user?._id || user?.id

  useEffect(() => {
    tripsAPI.getAll()
      .then(({ data }) => setTrips(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Split trips into tabs
  const activeTrips    = trips.filter(t => t.status === 'planning' || t.status === 'active')
  const historyTrips   = trips.filter(t => t.status === 'completed')
  const cancelledTrips = trips.filter(t => t.status === 'cancelled')

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
    e.preventDefault(); setJoinError('')
    try {
      const { data } = await tripsAPI.join(inviteCode)
      setTrips([data, ...trips])
      setShowJoin(false); setInviteCode('')
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Invalid invite code')
    }
  }

  // Action dispatcher — shows confirm dialog before doing anything destructive
  const handleAction = (type, trip) => {
    const configs = {
      cancel: {
        title: 'Cancel this trip?',
        message: `"${trip.title}" will be marked as cancelled. Members will no longer be able to add expenses or messages. This cannot be undone.`,
        confirmLabel: 'Yes, Cancel Trip',
        confirmClass: 'bg-amber-500 hover:bg-amber-600',
        onConfirm: async () => {
          await tripsAPI.cancel(trip._id)
          setTrips(trips.map(t => t._id === trip._id ? { ...t, status: 'cancelled' } : t))
        },
      },
      delete: {
        title: 'Delete this trip?',
        message: `"${trip.title}" and all its data — expenses, messages, itinerary — will be permanently deleted. There is no undo.`,
        confirmLabel: 'Yes, Delete Forever',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        onConfirm: async () => {
          await tripsAPI.delete(trip._id)
          setTrips(trips.filter(t => t._id !== trip._id))
        },
      },
      leave: {
        title: 'Leave this trip?',
        message: `You will be removed from "${trip.title}". You can rejoin using the invite code if you change your mind.`,
        confirmLabel: 'Yes, Leave Trip',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        onConfirm: async () => {
          await tripsAPI.leave(trip._id)
          setTrips(trips.filter(t => t._id !== trip._id))
        },
      },
      complete: {
        title: 'Mark as completed?',
        message: `"${trip.title}" will be moved to your travel history as a completed trip.`,
        confirmLabel: 'Mark Completed',
        confirmClass: 'bg-green-600 hover:bg-green-700',
        onConfirm: async () => {
          await tripsAPI.complete(trip._id)
          setTrips(trips.map(t => t._id === trip._id ? { ...t, status: 'completed' } : t))
        },
      },
    }
    setConfirmDialog({ ...configs[type], onCancel: () => setConfirmDialog(null) })
  }

  const executeConfirm = async () => {
    try {
      await confirmDialog.onConfirm()
    } catch (err) {
      console.error(err)
    } finally {
      setConfirmDialog(null)
    }
  }

  const TABS = [
    { id: 'active',    label: 'My Trips',       icon: <Globe size={14} />,   count: activeTrips.length },
    { id: 'history',   label: 'Travel History', icon: <History size={14} />, count: historyTrips.length },
    { id: 'cancelled', label: 'Cancelled',      icon: <XCircle size={14} />, count: cancelledTrips.length },
  ]

  const displayedTrips = activeTab === 'active' ? activeTrips : activeTab === 'history' ? historyTrips : cancelledTrips

  return (
    <div>
      {/* Confirm dialog */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          confirmClass={confirmDialog.confirmClass}
          onConfirm={executeConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hey, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your trips and plan adventures</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setShowJoin(true); setShowCreate(false) }} className="btn-secondary flex items-center gap-2">
            <Hash size={16} /> Join Trip
          </button>
          <button onClick={() => { setShowCreate(true); setShowJoin(false) }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Trip
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-blue-600">{activeTrips.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active Trips</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-green-600">{historyTrips.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Completed</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold text-gray-700">{trips.reduce((s, t) => s + (t.members?.length || 0), 0)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Co-travelers</p>
        </div>
      </div>

      {/* Create form */}
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
                  onChange={e => setCreateForm({ ...createForm, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Destination *</label>
                <input className="input bg-white" placeholder="Goa, India" value={createForm.destination}
                  onChange={e => setCreateForm({ ...createForm, destination: e.target.value })} required />
              </div>
              <div>
                <label className="label">Total Budget (₹) *</label>
                <input type="number" className="input bg-white" placeholder="50000" value={createForm.budget}
                  onChange={e => setCreateForm({ ...createForm, budget: e.target.value })} required />
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input bg-white" placeholder="A fun beach trip!" value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Start Date *</label>
                <input type="date" className="input bg-white" value={createForm.startDate}
                  onChange={e => setCreateForm({ ...createForm, startDate: e.target.value })} required />
              </div>
              <div>
                <label className="label">End Date *</label>
                <input type="date" className="input bg-white" value={createForm.endDate}
                  onChange={e => setCreateForm({ ...createForm, endDate: e.target.value })} required />
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

      {/* Join form */}
      {showJoin && (
        <div className="card mb-6 border-purple-200 bg-purple-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Hash size={18} className="text-purple-600" /> Join a Trip
          </h3>
          {joinError && <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-3 text-sm">{joinError}</div>}
          <form onSubmit={handleJoinTrip} className="flex gap-3 flex-wrap">
            <input className="input bg-white flex-1 uppercase min-w-0" placeholder="Enter invite code (e.g. GOA123)"
              value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} required />
            <button type="submit" className="btn-primary whitespace-nowrap">Join Trip</button>
            <button type="button" className="btn-secondary" onClick={() => setShowJoin(false)}>Cancel</button>
          </form>
          <p className="text-xs text-purple-600 mt-2">💡 Try: <strong>GOA123</strong> or <strong>PAR456</strong></p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-5 w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.icon} {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Trip grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin text-blue-500" size={32} />
        </div>
      ) : displayedTrips.length === 0 ? (
        <div className="text-center py-20">
          {activeTab === 'active' && (
            <>
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No active trips</h3>
              <p className="text-gray-400 mb-6">Create your first trip or join one with an invite code</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 mx-auto">
                <Plus size={16} /> Plan your first trip
              </button>
            </>
          )}
          {activeTab === 'history' && (
            <>
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No travel history yet</h3>
              <p className="text-gray-400">Once you complete a trip it will show up here as a memory.</p>
            </>
          )}
          {activeTab === 'cancelled' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No cancelled trips</h3>
              <p className="text-gray-400">Good news — nothing was cancelled!</p>
            </>
          )}
        </div>
      ) : (
        <>
          {/* History banner */}
          {activeTab === 'history' && historyTrips.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center gap-3">
              <div className="text-2xl">🏆</div>
              <div>
                <p className="font-semibold text-green-800">
                  You've completed {historyTrips.length} trip{historyTrips.length !== 1 ? 's' : ''}!
                </p>
                <p className="text-sm text-green-600">These are read-only records of your adventures.</p>
              </div>
            </div>
          )}

          {/* Cancelled banner */}
          {activeTab === 'cancelled' && cancelledTrips.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <p className="font-semibold text-red-700">These trips were cancelled</p>
                <p className="text-sm text-red-500">Organizers can still delete them permanently from the trip menu.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedTrips.map(trip => (
              <TripCard
                key={trip._id}
                trip={trip}
                currentUserId={userId}
                onAction={handleAction}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
