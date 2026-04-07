import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { tripsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  MapPin, Calendar, Users, DollarSign, MessageSquare,
  Plus, Clock, Copy, Check, Loader, ChevronLeft, Receipt,
  Trash2, XCircle, LogOut, CheckCircle, AlertTriangle, MoreVertical
} from 'lucide-react'

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

export default function TripDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemForm, setItemForm] = useState({ title: '', description: '', date: '', time: '' })
  const [addingItem, setAddingItem] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(null)

  const userId = user?._id || user?.id

  useEffect(() => {
    tripsAPI.getById(id)
      .then(({ data }) => setTrip(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const isOrganizer = trip?.createdBy?._id === userId || trip?.createdBy === userId
  const isCancelled = trip?.status === 'cancelled'
  const isCompleted = trip?.status === 'completed'

  const copyCode = () => {
    navigator.clipboard.writeText(trip.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    setAddingItem(true)
    try {
      const { data } = await tripsAPI.addItinerary(id, itemForm)
      setTrip({ ...trip, itinerary: data })
      setShowAddItem(false)
      setItemForm({ title: '', description: '', date: '', time: '' })
    } catch (err) { console.error(err) }
    finally { setAddingItem(false) }
  }

  const triggerAction = (type) => {
    setShowMenu(false)
    const configs = {
      cancel: {
        title: 'Cancel this trip?',
        message: 'The trip will be marked as cancelled. Members will still see it but cannot interact with it.',
        confirmLabel: 'Yes, Cancel',
        confirmClass: 'bg-amber-500 hover:bg-amber-600',
        onConfirm: async () => {
          await tripsAPI.cancel(id)
          setTrip({ ...trip, status: 'cancelled' })
        },
      },
      complete: {
        title: 'Mark as completed?',
        message: 'This will move the trip to your travel history as a completed adventure.',
        confirmLabel: 'Mark Completed',
        confirmClass: 'bg-green-600 hover:bg-green-700',
        onConfirm: async () => {
          await tripsAPI.complete(id)
          setTrip({ ...trip, status: 'completed' })
        },
      },
      delete: {
        title: 'Delete this trip forever?',
        message: 'All data including expenses, messages, and itinerary will be permanently deleted. There is no undo.',
        confirmLabel: 'Delete Forever',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        onConfirm: async () => {
          await tripsAPI.delete(id)
          navigate('/')
        },
      },
      leave: {
        title: 'Leave this trip?',
        message: 'You will be removed from the group. You can rejoin using the invite code.',
        confirmLabel: 'Leave Trip',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        onConfirm: async () => {
          await tripsAPI.leave(id)
          navigate('/')
        },
      },
    }
    setConfirmDialog({ ...configs[type], onCancel: () => setConfirmDialog(null) })
  }

  const executeConfirm = async () => {
    try { await confirmDialog.onConfirm() }
    catch (err) { console.error(err) }
    finally { setConfirmDialog(null) }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader className="animate-spin text-blue-500" size={32} />
    </div>
  )
  if (!trip) return (
    <div className="text-center py-20"><div className="text-5xl mb-3">🔍</div><p className="text-gray-500">Trip not found</p></div>
  )

  const sortedItinerary = [...(trip.itinerary || [])].sort((a, b) => {
    if (a.date && b.date) return new Date(a.date) - new Date(b.date)
    return 0
  })

  const STATUS_BANNER = {
    cancelled: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: '⚠️', msg: 'This trip has been cancelled.' },
    completed: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', icon: '🏆', msg: 'This trip has been completed. Great memories!' },
  }
  const banner = STATUS_BANNER[trip.status]

  return (
    <div>
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

      <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ChevronLeft size={16} /> Back to Dashboard
      </Link>

      {/* Status banner */}
      {banner && (
        <div className={`border rounded-xl p-4 mb-5 flex items-center gap-3 ${banner.bg}`}>
          <span className="text-xl">{banner.icon}</span>
          <p className={`font-medium text-sm ${banner.text}`}>{banner.msg}</p>
        </div>
      )}

      {/* Trip Header */}
      <div className="card mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{trip.title}</h1>
            </div>
            <p className="flex items-center gap-1.5 text-blue-100">
              <MapPin size={15} /> {trip.destination}
            </p>
            {trip.description && <p className="text-blue-200 text-sm mt-2">{trip.description}</p>}
          </div>

          {/* Right side — invite code + action menu */}
          <div className="flex items-start gap-2 shrink-0">
            <div>
              <button onClick={copyCode}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm transition-colors">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span className="font-mono font-bold">{trip.inviteCode}</span>
              </button>
              <p className="text-blue-200 text-xs mt-1 text-center">Click to copy</p>
            </div>

            {/* Action menu */}
            {!isCancelled && !isCompleted && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                >
                  <MoreVertical size={18} />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl z-20 w-52 py-1 overflow-hidden">
                      {isOrganizer && (
                        <button onClick={() => triggerAction('complete')}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-green-600 hover:bg-green-50">
                          <CheckCircle size={15} /> Mark as Completed
                        </button>
                      )}
                      {isOrganizer && (
                        <button onClick={() => triggerAction('cancel')}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50">
                          <XCircle size={15} /> Cancel Trip
                        </button>
                      )}
                      {isOrganizer && (
                        <button onClick={() => triggerAction('delete')}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                          <Trash2 size={15} /> Delete Trip
                        </button>
                      )}
                      {!isOrganizer && (
                        <button onClick={() => triggerAction('leave')}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                          <LogOut size={15} /> Leave Trip
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            {/* Delete only option for cancelled trips (organizer) */}
            {isCancelled && isOrganizer && (
              <button onClick={() => triggerAction('delete')}
                className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors">
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/20">
          <div>
            <div className="flex items-center gap-1.5 text-blue-200 text-xs mb-0.5"><Calendar size={12} /> Dates</div>
            <p className="font-semibold text-sm">
              {new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              {' – '}
              {new Date(trip.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-blue-200 text-xs mb-0.5"><DollarSign size={12} /> Budget</div>
            <p className="font-semibold text-sm">₹{Number(trip.budget).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-blue-200 text-xs mb-0.5"><Users size={12} /> Members</div>
            <p className="font-semibold text-sm">{trip.members?.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions — hide for cancelled trips */}
      {!isCancelled && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <Link to={`/trips/${id}/expenses`}
            className="card flex items-center gap-3 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Receipt size={18} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Expenses</p>
              <p className="text-xs text-gray-500">Track & split costs</p>
            </div>
          </Link>
          <Link to={`/trips/${id}/chat`}
            className="card flex items-center gap-3 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Group Chat</p>
              <p className="text-xs text-gray-500">Talk with the group</p>
            </div>
          </Link>
          <div className="card flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">Members</p>
              <p className="text-xs text-gray-500 truncate">{trip.members?.map(m => m.name).join(', ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Members */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={18} className="text-blue-600" /> Trip Members
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {trip.members?.map((member) => (
            <div key={member._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                {member.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-800 truncate">{member.name}</p>
                <p className="text-xs text-gray-500 capitalize">{member.preferences?.travelStyle || 'traveler'}</p>
                {(member._id === trip.createdBy?._id || member._id === trip.createdBy) && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Organizer</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Itinerary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" /> Itinerary
          </h2>
          {!isCancelled && (
            <button onClick={() => setShowAddItem(!showAddItem)}
              className="btn-primary flex items-center gap-1 text-sm py-1.5 px-3">
              <Plus size={15} /> Add Plan
            </button>
          )}
        </div>

        {showAddItem && (
          <form onSubmit={handleAddItem} className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Activity Title *</label>
                <input className="input bg-white" placeholder="Beach Day at Calangute" value={itemForm.title}
                  onChange={e => setItemForm({ ...itemForm, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" className="input bg-white" value={itemForm.date}
                  onChange={e => setItemForm({ ...itemForm, date: e.target.value })} />
              </div>
              <div>
                <label className="label">Time</label>
                <input type="time" className="input bg-white" value={itemForm.time}
                  onChange={e => setItemForm({ ...itemForm, time: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <input className="input bg-white" placeholder="Details about the activity" value={itemForm.description}
                  onChange={e => setItemForm({ ...itemForm, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm" disabled={addingItem}>
                {addingItem ? 'Adding...' : 'Add to Itinerary'}
              </button>
              <button type="button" className="btn-secondary text-sm" onClick={() => setShowAddItem(false)}>Cancel</button>
            </div>
          </form>
        )}

        {sortedItinerary.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Calendar size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No itinerary planned yet. Add some activities!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItinerary.map((item, idx) => (
              <div key={item._id} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">{idx + 1}</div>
                  {idx < sortedItinerary.length - 1 && <div className="w-0.5 h-full bg-blue-200 mt-2" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    {item.date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    {item.time && <span className="flex items-center gap-1"><Clock size={11} />{item.time}</span>}
                    {item.addedBy && <span>by {item.addedBy.name}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
