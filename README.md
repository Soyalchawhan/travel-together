# TravelTogether

A web app I built to solve a real problem — planning trips with a group of people is genuinely painful. Someone's always chasing payments, nobody agrees on the itinerary, and half the planning happens across three different WhatsApp groups. I wanted everything in one place, so I built this.

---

## What it does

You create a trip, get an invite code, share it with your friends, and everyone's in. From there you can plan the itinerary together, add expenses and split them however you want, chat with the group in real time, and if you're looking for travel partners, there's a matching feature that compares your travel preferences with other users and gives you a compatibility score.

The expense splitting was the main thing I wanted to get right. You add an expense, pick who's splitting it, choose equal or custom amounts, and the app keeps a running balance of who owes whom across the entire trip. No more mental math at 11pm trying to figure out who still owes for the hotel.

---

## Tech stack

I used React with Vite for the frontend because it's fast and the dev experience is good. Tailwind for styling — once you get used to it you can't go back. The backend is Node.js with Express, MongoDB with Mongoose for the database, and Socket.IO for the real-time chat. Authentication is JWT-based with bcrypt for password hashing.

---

## Getting it running locally

You'll need Node.js (v18 or above) and MongoDB installed, or you can use MongoDB Atlas if you don't want to install it locally.

Clone the repo and go into the project folder. There are two parts to start — the server and the client.

For the server:

```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```

The seed command fills the database with some demo users and trips so you have something to look at straight away. The server runs on port 5000.

For the client, open a second terminal:

```bash
cd client
npm install
npm run dev
```

That runs on port 3000. Open it in your browser and you should see the login page.

---

## Environment variables

The `.env.example` file in the server folder has everything you need. The three things you need to set are:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel-planner
JWT_SECRET=make_this_something_random
```

If you're using Atlas, just swap the MONGODB_URI with your connection string.

---

## Demo accounts

After running the seed script, these accounts are ready to use:

- test@example.com
- alice@example.com
- bob@example.com
- carol@example.com

Password for all of them is `password123`.

There's also a Goa trip already set up with expenses, messages and an itinerary if you want to see how everything looks with real data. The invite code for it is `GOA123` and the Paris trip is `PAR456`.

---

## Folder structure

```
travel-planner/
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── server.js
│   └── seed.js
└── client/
    └── src/
        ├── pages/
        ├── components/
        ├── context/
        └── services/
```

Nothing fancy. Controllers handle the business logic, routes just wire up the endpoints, models are the Mongoose schemas. On the frontend, pages are the full page components, components are the smaller reusable bits, and services/api.js is where all the axios calls live.

---

## API endpoints

```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me

GET    /api/trips
POST   /api/trips
POST   /api/trips/join
GET    /api/trips/:id
POST   /api/trips/:id/itinerary

POST   /api/expenses
GET    /api/expenses/trip/:tripId
GET    /api/expenses/trip/:tripId/balances

GET    /api/match

GET    /api/messages/:tripId
POST   /api/messages/:tripId
```

---

## Known limitations

The free tier on Render spins down after inactivity so the first request after a while takes about 30 seconds to wake up. Nothing you can do about that on the free plan, just something to be aware of if you're demoing it.

The matching algorithm is basic — it works well enough for a prototype but a real version would need more data points and probably let you filter by travel dates too.

Real-time chat works well but if you have the tab open in multiple windows you might see duplicate messages in some edge cases. It's on the list to fix.

---

## Why I built this

Honestly started as a hackathon project. My friends and I were planning a trip to Goa and spent more time fighting over a spreadsheet than actually planning the trip. Built the first version in a weekend and kept adding to it. It's not perfect but it solves the actual problem.

If you find bugs or have suggestions feel free to open an issue or just reach out.
