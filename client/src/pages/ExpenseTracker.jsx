import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { expensesAPI, tripsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Plus, ChevronLeft, Receipt, Scale, ArrowRight, Loader } from 'lucide-react'

const CATEGORY_ICONS = {
  food: '🍽️', transport: '🚗', accommodation: '🏨',
  activities: '🎯', shopping: '🛍️', other: '📦'
}

export default function ExpenseTracker() {
  const { id } = useParams()
  const { user } = useAuth()
  const [trip, setTrip] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [activeTab, setActiveTab] = useState('expenses')
  const [form, setForm] = useState({
    title: '', amount: '', splitType: 'equal',
    category: 'other', splitAmounts: {}
  })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [tripRes, expRes, balRes] = await Promise.all([
          tripsAPI.getById(id),
          expensesAPI.getByTrip(id),
          expensesAPI.getBalances(id),
        ])
        setTrip(tripRes.data)
        setExpenses(expRes.data)
        setBalances(balRes.data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)

  const handleAddExpense = async (e) => {
    e.preventDefault()
    if (!form.title || !form.amount) { setError('Title and amount required'); return }
    setError(''); setAdding(true)

    try {
      let splits
      if (form.splitType === 'equal') {
        splits = trip.members.map((m) => m._id)
      } else {
        splits = trip.members.map((m) => ({
          user: m._id,
          amount: parseFloat(form.splitAmounts[m._id] || 0)
        }))
      }

      const { data } = await expensesAPI.add({
        tripId: id,
        title: form.title,
        amount: parseFloat(form.amount),
        splitType: form.splitType,
        splits,
        category: form.category,
      })

      setExpenses([data, ...expenses])
      const balRes = await expensesAPI.getBalances(id)
      setBalances(balRes.data)
      setShowAdd(false)
      setForm({ title: '', amount: '', splitType: 'equal', category: 'other', splitAmounts: {} })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense')
    } finally {
      setAdding(false)
    }
  }

  const myBalances = user ? balances[user._id || user.id] : null

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader className="animate-spin text-blue-500" size={32} />
    </div>
  )

  return (
    <div>
      <Link to={`/trips/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ChevronLeft size={16} /> Back to Trip
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="text-green-600" size={24} /> Expense Tracker
          </h1>
          <p className="text-gray-500 text-sm">{trip?.title} · {trip?.destination}</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Spent</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">
            ₹{trip?.budget ? (trip.budget - totalSpent).toLocaleString('en-IN') : 0}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Remaining Budget</p>
        </div>
        <div className="card text-center col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Transactions</p>
        </div>
      </div>

      {/* Add Expense Form */}
      {showAdd && (
        <div className="card mb-6 border-green-200 bg-green-50">
          <h3 className="text-lg font-semibold mb-4">➕ Add Expense</h3>
          {error && <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-3 text-sm">{error}</div>}
          <form onSubmit={handleAddExpense} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Title *</label>
                <input className="input bg-white" placeholder="Lunch at beach shack" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Amount (₹) *</label>
                <input type="number" className="input bg-white" placeholder="1500" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input bg-white" value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {Object.entries(CATEGORY_ICONS).map(([k, v]) => (
                    <option key={k} value={k}>{v} {k.charAt(0).toUpperCase() + k.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Split Type</label>
                <select className="input bg-white" value={form.splitType}
                  onChange={(e) => setForm({ ...form, splitType: e.target.value })}>
                  <option value="equal">⚖️ Equal Split</option>
                  <option value="custom">✏️ Custom Split</option>
                </select>
              </div>
            </div>

            {form.splitType === 'custom' && trip?.members && (
              <div>
                <label className="label">Custom Amounts (₹)</label>
                <div className="space-y-2">
                  {trip.members.map((m) => (
                    <div key={m._id} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {m.name?.[0]}
                      </div>
                      <span className="text-sm flex-1">{m.name}</span>
                      <input
                        type="number"
                        className="input bg-white w-32"
                        placeholder="0"
                        value={form.splitAmounts[m._id] || ''}
                        onChange={(e) => setForm({ ...form, splitAmounts: { ...form.splitAmounts, [m._id]: e.target.value } })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={adding}>{adding ? 'Adding...' : 'Add Expense'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-5 w-fit">
        {['expenses', 'balances'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab === 'expenses' ? '📋 Expenses' : '⚖️ Balances'}
          </button>
        ))}
      </div>

      {activeTab === 'expenses' ? (
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Receipt size={36} className="mx-auto mb-2 opacity-40" />
              <p>No expenses yet. Add your first one!</p>
            </div>
          ) : (
            expenses.map((exp) => (
              <div key={exp._id} className="card flex items-center gap-4">
                <div className="text-2xl">{CATEGORY_ICONS[exp.category] || '📦'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{exp.title}</p>
                  <p className="text-sm text-gray-500">
                    Paid by <span className="font-medium text-gray-700">{exp.paidBy?.name}</span>
                    {' · '}
                    <span className="capitalize">{exp.splitType} split</span>
                    {' · '}
                    {exp.splits?.length} people
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">₹{exp.amount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(exp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(balances).length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Scale size={36} className="mx-auto mb-2 opacity-40" />
              <p>No balances yet. Add expenses first.</p>
            </div>
          ) : (
            Object.entries(balances).map(([uid, bal]) => (
              <div key={uid} className="card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                    {bal.name?.[0]}
                  </div>
                  <p className="font-bold text-gray-800">{bal.name}</p>
                  {(user?._id === uid || user?.id === uid) && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">You</span>
                  )}
                </div>
                {Object.entries(bal.owes || {}).map(([toId, info]) => (
                  <div key={toId} className="flex items-center gap-2 text-sm py-1.5 border-t border-gray-100">
                    <span className="text-red-500 font-medium">owes</span>
                    <ArrowRight size={14} className="text-gray-400" />
                    <span className="font-medium">{info.name}</span>
                    <span className="ml-auto font-bold text-red-600">₹{info.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                {Object.entries(bal.isOwed || {}).map(([fromId, info]) => (
                  <div key={fromId} className="flex items-center gap-2 text-sm py-1.5 border-t border-gray-100">
                    <span className="text-green-500 font-medium">gets back</span>
                    <ArrowRight size={14} className="text-gray-400" />
                    <span className="font-medium">{info.name}</span>
                    <span className="ml-auto font-bold text-green-600">₹{info.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
