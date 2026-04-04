import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TripDetails from './pages/TripDetails'
import ExpenseTracker from './pages/ExpenseTracker'
import ChatSection from './pages/ChatSection'
import Matches from './pages/Matches'
import Navbar from './components/Navbar'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="text-5xl mb-4">✈️</div>
        <div className="text-gray-600 font-medium">Loading TravelTogether...</div>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
  </div>
)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
          <Route path="/trips/:id" element={<PrivateRoute><AppLayout><TripDetails /></AppLayout></PrivateRoute>} />
          <Route path="/trips/:id/expenses" element={<PrivateRoute><AppLayout><ExpenseTracker /></AppLayout></PrivateRoute>} />
          <Route path="/trips/:id/chat" element={<PrivateRoute><AppLayout><ChatSection /></AppLayout></PrivateRoute>} />
          <Route path="/matches" element={<PrivateRoute><AppLayout><Matches /></AppLayout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
