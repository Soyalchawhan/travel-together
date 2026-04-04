# ✈️ TravelTogether — Collaborative Travel Planning & Cost Schedule

A full-stack web app for collaborative group trip planning, expense splitting, traveler matching, and real-time group chat.

---

## 🧩 Features

| Feature | Details |
|---|---|
| 🔐 Authentication | JWT-based signup/login with profile preferences |
| 🗺️ Trip Management | Create trips, join via invite code, view all trips |
| 💸 Expense Tracking | Add expenses with equal or custom splits, see who owes whom |
| 👥 Traveler Matching | Match with compatible travelers by budget, style & interests |
| 💬 Real-time Chat | Group chat per trip powered by Socket.IO |
| 📅 Itinerary Planner | Add daily activities with dates and times |
| ✨ AI Trip Suggestions | Personalized destination ideas based on travel style |

---

## 🏗️ Folder Structure

```
travel-planner/
├── server/                    # Node.js + Express backend
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── tripController.js
│   │   ├── expenseController.js
│   │   ├── matchController.js
│   │   └── messageController.js
│   ├── routes/                # REST API routes
│   │   ├── auth.js
│   │   ├── trips.js
│   │   ├── expenses.js
│   │   ├── match.js
│   │   └── messages.js
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Trip.js
│   │   ├── Expense.js
│   │   └── Message.js
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── server.js              # Entry point + Socket.IO
│   ├── seed.js                # Database seeder with dummy data
│   └── package.json
│
└── client/                    # React (Vite) frontend
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── TripDetails.jsx
    │   │   ├── ExpenseTracker.jsx
    │   │   ├── ChatSection.jsx
    │   │   └── Matches.jsx
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js         # Axios API service layer
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js         # Dev server with proxy
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

---

### 1. Clone & Setup

```bash
# No git needed — just unzip and go!
cd travel-planner
```

### 2. Backend Setup

```bash
cd server

# Copy and configure environment
cp .env.example .env
# Edit .env if needed (default works with local MongoDB)

# Install dependencies
npm install

# Seed the database with demo data (optional but recommended)
npm run seed

# Start the server
npm run dev
# → Runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Start the dev server
npm run dev
# → Runs on http://localhost:3000
```

Open **http://localhost:3000** in your browser 🎉

---

## 🔑 Environment Variables

**server/.env**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel-planner
JWT_SECRET=supersecretjwtkey123_changethis
```

For MongoDB Atlas, replace `MONGODB_URI` with your connection string.

---

## 🧪 Demo Accounts

After running `npm run seed`:

| Email | Password | Name |
|---|---|---|
| test@example.com | password123 | Test User |
| alice@example.com | password123 | Alice Johnson |
| bob@example.com | password123 | Bob Smith |
| carol@example.com | password123 | Carol Davis |

**Trip Invite Codes:**
- `GOA123` — Goa Beach Getaway (3 members, expenses, itinerary, messages)
- `PAR456` — Paris & Beyond

---

## 📡 API Reference

### Auth
```
POST /api/auth/signup    — Register new user
POST /api/auth/login     — Login, get JWT
GET  /api/auth/me        — Get logged-in user
```

### Trips
```
GET  /api/trips          — Get all user's trips
POST /api/trips          — Create trip
POST /api/trips/join     — Join trip by invite code
GET  /api/trips/:id      — Get trip details
POST /api/trips/:id/itinerary — Add itinerary item
```

### Expenses
```
POST /api/expenses                      — Add expense
GET  /api/expenses/trip/:tripId         — Get trip expenses
GET  /api/expenses/trip/:tripId/balances — Get balance summary
```

### Match
```
GET /api/match           — Get compatible traveler matches
```

### Messages
```
GET  /api/messages/:tripId  — Get trip messages
POST /api/messages/:tripId  — Send message
```

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Real-time | Socket.IO |

---

## 💡 How Real-time Chat Works

1. Client connects to Socket.IO server on page load
2. Client emits `joinTrip(tripId)` to enter a room
3. On send: message saved to DB via REST API, then emitted to room via socket
4. Other clients in the room receive `newMessage` event and update UI instantly

---

## 🎯 Matching Algorithm

The compatibility score is calculated from:
- **Budget range** (40% weight) — Same = 100%, one level apart = 50%, two levels = 0%
- **Travel style** (30% weight) — Same = 100%, different = 0%
- **Interest overlap** (30% weight) — Jaccard similarity of interest sets × 100

Final score = weighted average of all factors.
