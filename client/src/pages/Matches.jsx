import { useState, useEffect } from 'react'
import { matchAPI, tripsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  Users, Loader, Sparkles, Search,
  Filter, Send, X, Check, ChevronDown, MapPin
} from 'lucide-react'

const BUDGET_LABELS = { budget: '💰 Budget', moderate: '💳 Moderate', luxury: '💎 Luxury' }
const STYLE_LABELS  = { adventure: '🏔️ Adventure', leisure: '🌴 Leisure', cultural: '🏛️ Cultural', business: '💼 Business' }

const MATCH_META = (pct) => {
  if (pct >= 80) return { badge: 'text-green-700 bg-green-100 border border-green-200', bar: 'bg-green-500', label: '🔥 Excellent Match' }
  if (pct >= 60) return { badge: 'text-blue-700 bg-blue-100 border border-blue-200',   bar: 'bg-blue-500',  label: '👍 Good Match' }
  if (pct >= 40) return { badge: 'text-amber-700 bg-amber-100 border border-amber-200', bar: 'bg-amber-500', label: '🤝 Decent Match' }
  return          { badge: 'text-red-600 bg-red-50 border border-red-200',              bar: 'bg-red-400',   label: '💭 Low Match' }
}

const AI_SUGGESTIONS = [
  { destination: 'Coorg, Karnataka',       emoji: '☕', budget: '₹8,000–15,000/person',  reason: 'Perfect for nature lovers and coffee plantation tours',        bestFor: ['leisure','cultural'] },
  { destination: 'Rishikesh, Uttarakhand', emoji: '🏄', budget: '₹6,000–12,000/person',  reason: 'Thrilling white water rafting and yoga retreats',              bestFor: ['adventure'] },
  { destination: 'Udaipur, Rajasthan',     emoji: '🏰', budget: '₹10,000–25,000/person', reason: 'Royal palaces, lakes, and vibrant Rajasthani culture',         bestFor: ['cultural','leisure'] },
  { destination: 'Andaman Islands',        emoji: '🐠', budget: '₹20,000–40,000/person', reason: 'Crystal clear waters, snorkeling, and pristine beaches',       bestFor: ['leisure','adventure'] },
  { destination: 'Manali, Himachal Pradesh',emoji: '🏔️',budget: '₹8,000–18,000/person',  reason: 'Snow-capped mountains and adventure sports paradise',          bestFor: ['adventure'] },
  { destination: 'Hampi, Karnataka',       emoji: '🗿', budget: '₹5,000–10,000/person',  reason: 'Ancient ruins and UNESCO world heritage site exploration',     bestFor: ['cultural'] },
]

/* ── Invite Modal ─────────────────────────────────────── */
function InviteModal({ traveler, trips, onClose }) {
  const [selectedTrip, setSelectedTrip] = useState('')
  const [copied, setCopied]   = useState(false)
  const [sent,   setSent]     = useState(false)
  const trip = trips.find((t) => t._id === selectedTrip)

  const handleCopy = () => {
    if (!trip) return
    navigator.clipboard.writeText(trip.inviteCode)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleSend = () => {
    if (!trip) return
    setSent(true)
    setTimeout(() => { setSent(false); onClose() }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold">
              {traveler.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-800">Invite {traveler.name}</p>
              <p className="text-xs text-gray-400">Share an invite code from one of your trips</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-500" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* trip picker */}
          <div>
            <label className="label">Choose a Trip</label>
            {trips.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <MapPin size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">You have no trips yet.</p>
                <p className="text-xs text-gray-400 mt-0.5">Create a trip on the Dashboard first.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {trips.map((t) => (
                  <button key={t._id} onClick={() => setSelectedTrip(t._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      selectedTrip === t._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      selectedTrip === t._id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedTrip === t._id && <Check size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{t.title}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{t.destination}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shrink-0">
                      {t.inviteCode}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* invite code display */}
          {trip && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-600 font-medium mb-2">📨 Share this invite code with {traveler.name}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-center">
                  <span className="text-2xl font-mono font-bold text-blue-700 tracking-widest">{trip.inviteCode}</span>
                </div>
                <button onClick={handleCopy}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    copied ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200'
                  }`}>
                  {copied ? <Check size={16} /> : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Tell {traveler.name} → Dashboard → Join Trip → enter this code
              </p>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSend} disabled={!trip || sent}
            className={`flex-1 flex items-center justify-center gap-2 font-semibold py-2 px-4 rounded-lg transition-all ${
              sent ? 'bg-green-500 text-white' : !trip ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}>
            {sent ? <><Check size={16} /> Invite Sent!</> : <><Send size={16} /> Send Invite</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Profile Modal ────────────────────────────────────── */
function ProfileModal({ traveler, matchPercentage, onClose, onInvite }) {
  const mc = MATCH_META(matchPercentage)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6">
          <div className="flex justify-end mb-1">
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
          </div>
          {/* avatar */}
          <div className="text-center mb-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3 shadow-lg">
              {traveler.name?.[0]?.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{traveler.name}</h2>
            <p className="text-gray-400 text-sm">{traveler.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-bold ${mc.badge}`}>
              {matchPercentage}% · {mc.label}
            </span>
          </div>
          {/* bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Compatibility</span><span>{matchPercentage}%</span></div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${mc.bar}`} style={{ width: `${matchPercentage}%` }} />
            </div>
          </div>
          {/* details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-5">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Budget</span><span className="text-sm font-semibold">{BUDGET_LABELS[traveler.preferences?.budget] || 'Moderate'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Travel Style</span><span className="text-sm font-semibold">{STYLE_LABELS[traveler.preferences?.travelStyle] || 'Leisure'}</span></div>
            {traveler.preferences?.interests?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {traveler.preferences.interests.map((i) => (
                    <span key={i} className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-full capitalize shadow-sm">{i}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={onInvite} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            <Send size={16} /> Invite to a Trip
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ────────────────────────────────────────── */
export default function Matches() {
  const { user }  = useAuth()
  const [matches, setMatches]   = useState([])
  const [trips,   setTrips]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('travelers')
  const [search,  setSearch]    = useState('')
  const [filterMin,    setFilterMin]    = useState(0)
  const [filterStyle,  setFilterStyle]  = useState('all')
  const [filterBudget, setFilterBudget] = useState('all')
  const [showFilters,  setShowFilters]  = useState(false)
  const [profileModal, setProfileModal] = useState(null)
  const [inviteModal,  setInviteModal]  = useState(null)

  useEffect(() => {
    Promise.all([matchAPI.getMatches(), tripsAPI.getAll()])
      .then(([m, t]) => { setMatches(m.data); setTrips(t.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = matches.filter(({ user: u, matchPercentage }) =>
    (u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) &&
    matchPercentage >= filterMin &&
    (filterStyle  === 'all' || u.preferences?.travelStyle === filterStyle) &&
    (filterBudget === 'all' || u.preferences?.budget      === filterBudget)
  )

  const travelStyle = user?.preferences?.travelStyle || 'leisure'
  const suggestions = [...AI_SUGGESTIONS.filter(s => s.bestFor.includes(travelStyle)),
                       ...AI_SUGGESTIONS.filter(s => !s.bestFor.includes(travelStyle))].slice(0, 4)

  const openInvite = (u) => { setProfileModal(null); setInviteModal(u) }

  return (
    <div>
      {/* modals */}
      {profileModal && (
        <ProfileModal traveler={profileModal.user} matchPercentage={profileModal.matchPercentage}
          onClose={() => setProfileModal(null)} onInvite={() => openInvite(profileModal.user)} />
      )}
      {inviteModal && (
        <InviteModal traveler={inviteModal} trips={trips} onClose={() => setInviteModal(null)} />
      )}

      {/* header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-blue-600" size={24} /> Find Travel Companions
        </h1>
        <p className="text-gray-500 text-sm mt-1">Click a card to view full profile · Use Invite to share your trip code</p>
      </div>

      {/* tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        {[{ id:'travelers', label:'👥 Travelers' }, { id:'suggestions', label:'✨ AI Trip Ideas' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab===tab.id ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'travelers' ? (
        <>
          {/* my profile banner */}
          <div className="card mb-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0">
            <p className="text-blue-200 text-xs mb-2 font-medium uppercase tracking-wide">Your Travel Profile</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">{BUDGET_LABELS[user?.preferences?.budget] || '💳 Moderate'}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">{STYLE_LABELS[user?.preferences?.travelStyle] || '🌴 Leisure'}</span>
              {user?.preferences?.interests?.slice(0,4).map(i => (
                <span key={i} className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium capitalize">{i}</span>
              ))}
            </div>
          </div>

          {/* search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-9" placeholder="Search by name or email…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
              <Filter size={15} /> Filters
              <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* filter panel */}
          {showFilters && (
            <div className="card mb-4 bg-gray-50 border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Minimum Match %</label>
                  <input type="range" min="0" max="90" step="10" value={filterMin}
                    onChange={e => setFilterMin(Number(e.target.value))} className="w-full accent-blue-600 mt-1" />
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>0%</span><span className="font-semibold text-blue-600">{filterMin}%+</span><span>90%</span>
                  </div>
                </div>
                <div>
                  <label className="label">Travel Style</label>
                  <select className="input bg-white" value={filterStyle} onChange={e => setFilterStyle(e.target.value)}>
                    <option value="all">All Styles</option>
                    <option value="adventure">🏔️ Adventure</option>
                    <option value="leisure">🌴 Leisure</option>
                    <option value="cultural">🏛️ Cultural</option>
                    <option value="business">💼 Business</option>
                  </select>
                </div>
                <div>
                  <label className="label">Budget</label>
                  <select className="input bg-white" value={filterBudget} onChange={e => setFilterBudget(e.target.value)}>
                    <option value="all">All Budgets</option>
                    <option value="budget">💰 Budget</option>
                    <option value="moderate">💳 Moderate</option>
                    <option value="luxury">💎 Luxury</option>
                  </select>
                </div>
              </div>
              <button onClick={() => { setSearch(''); setFilterMin(0); setFilterStyle('all'); setFilterBudget('all') }}
                className="mt-3 text-xs text-blue-600 hover:underline">Reset all filters</button>
            </div>
          )}

          {!loading && (
            <p className="text-sm text-gray-500 mb-4">
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span> traveler{filtered.length !== 1 ? 's' : ''}
              {search && <> matching "<span className="text-blue-600">{search}</span>"</>}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader className="animate-spin text-blue-500" size={32} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users size={40} className="mx-auto mb-3 opacity-20 text-gray-400" />
              <p className="text-gray-500 font-medium">No travelers found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
              <button onClick={() => { setSearch(''); setFilterMin(0); setFilterStyle('all'); setFilterBudget('all') }}
                className="mt-4 btn-secondary text-sm">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(({ user: mu, matchPercentage }) => {
                const mc = MATCH_META(matchPercentage)
                return (
                  <div key={mu.id} onClick={() => setProfileModal({ user: mu, matchPercentage })}
                    className="card hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group border-2 border-transparent hover:border-blue-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          {mu.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{mu.name}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[120px]">{mu.email}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${mc.badge}`}>{matchPercentage}%</span>
                    </div>
                    <div className="mb-3">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${mc.bar}`} style={{ width: `${matchPercentage}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs w-12">Budget</span>
                        <span className="font-medium text-gray-700">{BUDGET_LABELS[mu.preferences?.budget] || 'Moderate'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs w-12">Style</span>
                        <span className="font-medium text-gray-700">{STYLE_LABELS[mu.preferences?.travelStyle] || 'Leisure'}</span>
                      </div>
                      {mu.preferences?.interests?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {mu.preferences.interests.slice(0,3).map(i => (
                            <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full capitalize">{i}</span>
                          ))}
                          {mu.preferences.interests.length > 3 && (
                            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">+{mu.preferences.interests.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-400">{mc.label}</p>
                      <button onClick={e => { e.stopPropagation(); openInvite(mu) }}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Send size={11} /> Invite
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="text-yellow-500" size={20} />
            <div>
              <p className="font-semibold text-gray-800">Personalized for your travel style</p>
              <p className="text-xs text-gray-400">Based on your {travelStyle} preference</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestions.map((s, i) => (
              <div key={i} className="card hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <div className="text-4xl shrink-0">{s.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg">{s.destination}</h3>
                    <p className="text-gray-500 text-sm mt-1">{s.reason}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">💰 {s.budget}</span>
                      {s.bestFor.map(style => (
                        <span key={style} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium capitalize">{style}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-blue-600 font-medium">✨ Dashboard → New Trip → paste this destination!</p>
                </div>
              </div>
            ))}
          </div>
          <div className="card mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <div className="flex items-start gap-3">
              <Sparkles className="text-purple-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-gray-800">💡 Pro Tip</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  Create a trip then use the <strong>Invite</strong> button on travelers with 60%+ match — they're most likely to enjoy the same experience!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
