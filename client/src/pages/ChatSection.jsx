import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { messagesAPI, tripsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Send, ChevronLeft, MessageSquare, Loader } from 'lucide-react'

let socket = null

export default function ChatSection() {
  const { id } = useParams()
  const { user } = useAuth()
  const [trip, setTrip] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  const myId = user?._id || user?.id

  useEffect(() => {
    const load = async () => {
      try {
        const [tripRes, msgRes] = await Promise.all([
          tripsAPI.getById(id),
          messagesAPI.get(id),
        ])
        setTrip(tripRes.data)
        setMessages(msgRes.data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  // Socket.IO setup
  useEffect(() => {
    socket = io('/', { transports: ['websocket', 'polling'] })
    socket.emit('joinTrip', id)

    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      socket.disconnect()
      socket = null
    }
  }, [id])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    const content = input.trim()
    setInput('')
    setSending(true)

    try {
      const { data } = await messagesAPI.send(id, content)
      setMessages((prev) => [...prev, data])
      // Broadcast to others via socket
      if (socket) {
        socket.emit('sendMessage', { ...data, tripId: id })
      }
    } catch (err) {
      console.error(err)
      setInput(content) // restore on error
    } finally {
      setSending(false)
    }
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (ts) => {
    const d = new Date(ts)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'Today'
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt)
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {})

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader className="animate-spin text-blue-500" size={32} />
    </div>
  )

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Link to={`/trips/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft size={16} /> Back
        </Link>
        <div className="w-px h-5 bg-gray-300" />
        <MessageSquare size={18} className="text-purple-600" />
        <div>
          <h1 className="font-bold text-gray-900">{trip?.title}</h1>
          <p className="text-xs text-gray-400">{trip?.members?.length} members · Group Chat</p>
        </div>
        <div className="ml-auto flex -space-x-1">
          {trip?.members?.slice(0, 5).map((m) => (
            <div key={m._id} className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
              {m.name?.[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 p-4 space-y-4 min-h-0">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare size={40} className="mb-3 opacity-30" />
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">Say hi to your travel buddies! 👋</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium px-2">{date}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="space-y-3">
                {msgs.map((msg, i) => {
                  const senderId = msg.sender?._id || msg.sender
                  const isMe = senderId?.toString() === myId?.toString()
                  const showAvatar = !isMe && (i === 0 || (msgs[i - 1]?.sender?._id || msgs[i - 1]?.sender)?.toString() !== senderId?.toString())

                  return (
                    <div key={msg._id || i} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      {!isMe && (
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold mt-1 ${showAvatar ? 'bg-gradient-to-br from-purple-400 to-indigo-500' : 'invisible'}`}>
                          {msg.sender?.name?.[0]?.toUpperCase()}
                        </div>
                      )}

                      <div className={`max-w-xs sm:max-w-sm lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isMe && showAvatar && (
                          <span className="text-xs text-gray-500 font-medium mb-1 ml-1">{msg.sender?.name}</span>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className={`text-xs text-gray-400 mt-0.5 ${isMe ? 'text-right' : 'text-left'} px-1`}>
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="flex gap-3 mt-3 shrink-0">
        <input
          type="text"
          className="input flex-1 bg-white"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="btn-primary px-4 flex items-center gap-2 shrink-0"
        >
          <Send size={16} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  )
}
