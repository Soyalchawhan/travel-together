import { useState, useEffect } from 'react'
import { matchAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Users, Star, Loader, Sparkles, RefreshCw } from 'lucide-react'

const BUDGET_LABELS = { budget: '💰 Budget', moderate: '💳 Moderate', luxury: '💎 Luxury' }
const STYLE_LABELS = { adventure: '🏔️ Adventure', leisure: '🌴 Leisure', cultural: '🏛️ Cultural', business: '💼 Business' }

const MATCH_COLOR = (pct) => {
  if (pct >= 80) return 'text-green-600 bg-green-100'
  if (pct >= 60) return 'text-blue-600 bg-blue-100'
  if (pct >= 40) return 'text-amber-600 bg-amber-100'
  return 'text-red-500 bg-red-100'
}

const AI_SUGGESTIONS = [
  { destination: 'Coorg, Karnataka', reason: 'Perfect for nature lovers and coffee plantation tours', emoji: '☕', budget: '₹8,000–15,000/person', bestFor: ['leisure', 'cultural'] },
  { destination: 'Rishikesh, Uttarakhand', reason: 'Thrilling white water rafting and yoga retreats', emoji: '🏄', budget: '₹6,000–12,000/person', bestFor: ['adventure'] },
  { destination: 'Udaipur, Rajasthan', reason: 'Royal palaces, lakes, and vibrant Rajasthani culture', emoji: '🏰', budget: '₹10,000–25,000/person', bestFor: ['cultural', 'leisure'] },
  { destination: 'Andaman Islands', reason: 'Crystal clear waters, snorkeling, and pristine beaches', emoji: '🐠', budget: '₹20,000–40,000/person', bestFor: ['leisure', 'adventure'] },
  { destination: 'Manali, Himachal Pradesh', reason: 'Snow-capped mountains and adventure sports paradise', emoji: '🏔️', budget: '₹8,000–18,000/person', bestFor: ['adventure'] },
  { destination: 'Hampi, Karnataka', reason: 'Ancient ruins and UNESCO world heritage site exploration', emoji: '🗿', budget: '₹5,000–10,000/person', bestFor: ['cultural'] },
]

export default function Matches() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('travelers')

  useEffect(() => {
    matchAPI.getMatches()
      .then(({ data }) => setMatches(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const travelStyle = user?.preferences?.travelStyle || 'leisure'
  const suggestions = AI_SUGGESTIONS.filter((s) =>
    s.bestFor.includes(travelStyle)
  ).concat(AI_SUGGESTIONS.filter((s) => !s.bestFor.includes(travelStyle))).slice(0, 4)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-blue-600" size={24} /> Find Travel Companions
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Matched based on budget, travel style, and interests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        {[
          { id: 'travelers', label: '👥 Travelers' },
          { id: 'suggestions', label: '✨ AI Trip Ideas' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'travelers' ? (
        <>
          {/* My Profile Summary */}
          <div className="card mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0">
            <p className="text-blue-200 text-sm mb-2">Your Travel Profile</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {BUDGET_LABELS[user?.preferences?.budget] || '💳 Moderate'}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {STYLE_LABELS[user?.preferences?.travelStyle] || '🌴 Leisure'}
              </span>
              {user?.preferences?.interests?.slice(0, 3).map((i) => (
                <span key={i} className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium capitalize">{i}</span>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="animate-spin text-blue-500" size={32} />
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p>No other travelers found yet. Invite friends to join!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map(({ user: matchUser, matchPercentage }) => (
                <div key={matchUser.id} className="card hover:shadow-md transition-all">
                  {/* Match percentage badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-lg font-bold">
                        {matchUser.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{matchUser.name}</p>
                        <p className="text-xs text-gray-400">{matchUser.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${MATCH_COLOR(matchPercentage)}`}>
                      {matchPercentage}% match
                    </span>
                  </div>

                  {/* Match bar */}
                  <div className="mb-3">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          matchPercentage >= 80 ? 'bg-green-500' :
                          matchPercentage >= 60 ? 'bg-blue-500' :
                          matchPercentage >= 40 ? 'bg-amber-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${matchPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs w-12">Budget</span>
                      <span className="font-medium text-gray-700">
                        {BUDGET_LABELS[matchUser.preferences?.budget] || 'Moderate'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs w-12">Style</span>
                      <span className="font-medium text-gray-700">
                        {STYLE_LABELS[matchUser.preferences?.travelStyle] || 'Leisure'}
                      </span>
                    </div>
                    {matchUser.preferences?.interests?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {matchUser.preferences.interests.slice(0, 4).map((i) => (
                          <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full capitalize">{i}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    {matchPercentage >= 70 ? (
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> Great match! Share a trip invite code.
                      </p>
                    ) : matchPercentage >= 50 ? (
                      <p className="text-xs text-blue-600 font-medium">Good compatibility for group travel.</p>
                    ) : (
                      <p className="text-xs text-gray-400">Different preferences — could still work!</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* AI Trip Suggestions */
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
                      <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        💰 {s.budget}
                      </span>
                      {s.bestFor.map((style) => (
                        <span key={style} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium capitalize">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-blue-600 font-medium">
                    ✨ Go to Dashboard → Create Trip → paste this destination!
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="card mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <div className="flex items-center gap-3">
              <Sparkles className="text-purple-600 shrink-0" size={20} />
              <div>
                <p className="font-semibold text-gray-800">💡 Pro Tip</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  Create a trip to one of these destinations and share the invite code with travelers who match 70%+ — they're most likely to enjoy the same experience!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
