# 🎮 Nexus Learn — Gamified Learning Platform

A production-quality, full-stack gamified learning platform built with the MERN stack.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Realtime | Socket.io |
| Auth | JWT + bcrypt |
| Charts | Recharts |
| State | Zustand |

## Features

- 📚 **Learning System** — Subjects → Levels → Lectures → Quiz Engine
- ⚡ **Gamification** — XP, Coins, Streaks, Level-up animations
- 🏆 **Contests** — Timed quiz competitions with live scoring
- 🥇 **Leaderboard** — Global + contest rankings with tier system (S+/S/A/B/C)
- 👥 **Friends** — Search, add, view profiles, pending requests
- ⚔️ **Custom Fights** — 1v1 real-time quiz battles via Socket.io
- 🛒 **Store** — Buy XP boosters, avatars, themes with coins
- 🏅 **Achievements** — 20 badges across learning/streak/competition/social
- 📊 **Progress Dashboard** — XP chart, streak calendar, subject analytics
- 💳 **Plans** — Free / Pro / Elite subscription tiers

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Server
cd nexus-learn/server
npm install

# Client
cd nexus-learn/client
npm install
```

### 2. Environment Variables

```bash
# server/.env
MONGO_URI=mongodb://localhost:27017/nexus-learn
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Run

```bash
# Terminal 1 — Server (port 5000)
cd nexus-learn/server
npm run dev

# Terminal 2 — Client (port 5173)
cd nexus-learn/client
npm run dev
```

### 4. Open

- Frontend: http://localhost:5173
- API: http://localhost:5000/api/health

## Project Structure

```
nexus-learn/
├── client/                        # React + Vite frontend
│   └── src/
│       ├── App.jsx
│       ├── eventBus.js            # Global typed event bus
│       ├── components/
│       │   ├── avatar/            # AvatarAssistant
│       │   ├── dashboard/         # Stats, SubjectGrid
│       │   ├── landing/           # Hero, Features, CTA
│       │   ├── layout/            # Navbar, Sidebar, Footer
│       │   ├── level/             # Lecture, Quiz, Notes
│       │   ├── levels/            # WorldMap, LevelNode
│       │   └── ui/                # GlassCard, GlowButton, RankCircle
│       ├── data/                  # Mock data (dev mode)
│       ├── features/
│       │   ├── achievements/      # AchievementCard, Grid, Popup
│       │   ├── auth/              # ProtectedRoute, useAuth
│       │   ├── contests/          # ContestPage, Timer, Question
│       │   ├── fights/            # FightPage, Lobby, Countdown
│       │   ├── friends/           # FriendsPage, SearchBar, Cards
│       │   ├── gamification/      # XPBar, CoinCounter, Streak
│       │   ├── leaderboard/       # LeaderboardPage, TierBadge
│       │   ├── progress/          # ProgressPage, XPChart, Calendar
│       │   └── store/             # StorePage, PurchaseModal
│       ├── pages/                 # Top-level page wrappers
│       ├── services/              # Axios API service
│       └── store/                 # Zustand stores
│
└── server/                        # Node.js + Express backend
    ├── config/db.js
    ├── controllers/               # auth, contest, fight, friend...
    ├── middleware/authMiddleware.js
    ├── models/                    # User, Contest, Fight, Store...
    ├── routes/                    # All API route files
    ├── socket/fightSocket.js      # Socket.io fight handlers
    ├── utils/
    │   ├── achievementEngine.js   # Pure achievement logic
    │   └── gamificationEngine.js  # XP/coin calculation
    └── server.js
```

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/subjects | All subjects |
| GET | /api/levels/:id | Level with questions |
| POST | /api/levels/:id/complete | Complete a level |
| GET | /api/contests | Live contests |
| POST | /api/contests/submit | Submit answers |
| GET | /api/leaderboard/global | Global rankings |
| GET | /api/leaderboard/contest/:id | Contest rankings |
| POST | /api/friends/request | Send friend request |
| POST | /api/friends/accept | Accept request |
| POST | /api/fights/invite | Challenge to fight |
| POST | /api/fights/accept | Accept challenge |
| GET | /api/store/items | Store catalogue |
| POST | /api/store/purchase | Buy item |
| GET | /api/achievements | All achievements |
| POST | /api/achievements/check | Check & award achievements |

## Socket.io Events (Fight System)

| Event | Direction | Description |
|---|---|---|
| fight:join | Client→Server | Join fight room |
| fight:state | Server→Client | Full fight state |
| fight:player_joined | Server→Client | Player connected |
| fight:countdown | Server→Client | 3→2→1 countdown |
| fight:started | Server→Client | Fight begins, questions sent |
| fight:answer | Client→Server | Submit answer |
| fight:score_update | Server→Client | Live score broadcast |
| fight:next_question | Server→Client | Advance question |
| fight:finished | Server→Client | Winner + rewards |
