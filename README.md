# SlotSwapper (MERN)

A peer-to-peer time-slot scheduling app. Users mark calendar events as swappable and request swaps with others. Built with MongoDB, Express, React, and Node.

## Tech
- Backend: Node.js, Express, Mongoose, JWT
- Frontend: React (Vite), React Router
- DB: MongoDB

## Setup

Prereqs: Node 18+, npm, a MongoDB URI.

1) Backend
```
cd server
npm install
# Create .env with:
# PORT=5000
# MONGO_URI=YOUR_MONGO_URI
# JWT_SECRET=change_me
# CLIENT_ORIGIN=http://localhost:5173
npm run dev
```

2) Frontend
```
cd client
npm install
# Optionally set VITE_API_URL (defaults to http://localhost:5000/api)
npm run dev
```

## API
Base URL: `/api`

Auth
- POST `/auth/signup` { name, email, password } -> { token, user }
- POST `/auth/login` { email, password } -> { token, user }

Events (Bearer token required)
- GET `/events` -> my events
- POST `/events` { title, startTime, endTime, status? } -> created
- PUT `/events/:id` { title?, startTime?, endTime?, status? } -> updated
- DELETE `/events/:id` -> { ok: true }

Swaps (Bearer token required)
- GET `/swappable-slots` -> other users' swappable events
- POST `/swap-request` { mySlotId, theirSlotId } -> swap request (PENDING) and both slots set SWAP_PENDING
- POST `/swap-response/:requestId` { accept: boolean }
  - accept=false: request REJECTED, slots back to SWAPPABLE
  - accept=true: request ACCEPTED, owners swapped, both set BUSY
- GET `/requests/incoming` -> requests where I am responder
- GET `/requests/outgoing` -> requests I created

Event status enum: BUSY | SWAPPABLE | SWAP_PENDING
Swap status enum: PENDING | ACCEPTED | REJECTED

## Frontend
- Auth pages: login/signup
- Dashboard: list my events, create event, set status (Make Swappable / Set Busy), delete
- Marketplace: list swappable slots, request swap by selecting one of my SWAPPABLE events
- Requests: incoming (accept/reject), outgoing (status)

## Assumptions
- No time conflict validation beyond ownership and status checks
- Simple UI with basic styling
- JWT stored in localStorage for simplicity

## Notes
- For real-time notifications, integrate WebSockets and emit on swap creation/acceptance.
- Add tests around swap-response transactional logic for robustness.

