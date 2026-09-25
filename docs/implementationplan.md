# 🕵️ Find the Spy — Implementation Plan

> A phase-wise roadmap to take the game from a local single-player web app to a fully multiplayer, voice-enabled mobile game on the App Store & Play Store.

---

## Current State (What We Have Today)

| Area | Status |
|------|--------|
| Splash Screen | ✅ Done (auto-advances after 3s) |
| Mode Selection | ✅ Done (Play with Bots / Play with Friends) |
| Create Room Popup | ✅ Done (room name input) |
| Waiting Lobby UI | ✅ Done (4-player grid, Room ID, Invite Link CTAs) |
| Round Intro Screen | ✅ Done (uses `Round w.png`) |
| Role Assignment | ✅ Done (Spy / Player reveal) |
| Word Reveal | ✅ Done |
| Countdown Timer | ✅ Done |
| Clue Giving | ✅ Done (with bot AI) |
| Voting | ✅ Done |
| Round Results | ✅ Done |
| Leaderboard | ✅ Done |
| Multiplayer Backend | ❌ Not started |
| Voice Chat | ❌ Not started |
| Mobile App | ❌ Not started |

---

## Phase 1 — Polish the Single-Player Experience
**Timeline:** 1–2 weeks  
**Goal:** Make the bot game feel complete and polished before adding complexity.

### Tasks
- [ ] **Bug fixes & UI polish** — Review all screens for visual consistency, animation smoothness, and edge cases
- [ ] **Improve bot AI** — Make bot clues smarter and more varied so the game feels challenging
- [ ] **Sound effects & music** — Add background music for the lobby, a tick sound for the countdown, and reveal sound effects
- [ ] **Responsive design** — Ensure the app looks perfect on all phone screen sizes (iPhone SE to iPhone 15 Pro Max, common Android sizes)
- [ ] **Game settings** — Allow players to configure number of rounds (3, 5, 7), timer duration, and difficulty
- [ ] **Animations** — Add screen transition animations (slide, fade) between game states for a premium feel

### Deliverable
A fully polished, fun-to-play single-player web game that works flawlessly on mobile browsers.

---

## Phase 2 — Backend Server & Database Setup
**Timeline:** 1–2 weeks  
**Goal:** Build the server infrastructure that powers multiplayer.

### Tech Stack
| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Real-time | Socket.io (WebSockets) |
| Database | Neon (Serverless PostgreSQL) |
| ORM | Prisma |
| Hosting | Railway / Render / Fly.io |

### Database Schema (Neon)
```sql
-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(30) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  room_name VARCHAR(50) NOT NULL,
  host_id UUID REFERENCES players(id),
  status VARCHAR(20) DEFAULT 'WAITING', -- WAITING, IN_GAME, FINISHED
  max_players INT DEFAULT 4,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Room members (join table)
CREATE TABLE room_members (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (room_id, player_id)
);

-- Game rounds
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  secret_word VARCHAR(100) NOT NULL,
  spy_id UUID REFERENCES players(id),
  outcome VARCHAR(20), -- ROOM_WINS, SPY_WINS, TIE
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tasks
- [ ] **Initialize Node.js project** — Set up Express server with Socket.io
- [ ] **Connect to Neon** — Configure Prisma ORM with connection pooling
- [ ] **API endpoints** — Build REST endpoints:
  - `POST /api/rooms` — Create a room
  - `GET /api/rooms/:code` — Get room details
  - `POST /api/rooms/:code/join` — Join a room
- [ ] **WebSocket events** — Implement real-time events:
  - `player-joined` — Broadcast when someone joins
  - `player-left` — Broadcast when someone leaves
  - `game-started` — Host starts the game
  - `round-data` — Send role + word to each player
  - `clue-submitted` — Broadcast clues in real-time
  - `vote-submitted` — Collect and tally votes
  - `round-result` — Broadcast round outcome
- [ ] **Deploy server** — Deploy to Railway/Render with environment variables
- [ ] **Test with Postman** — Verify all endpoints work before frontend integration

### Deliverable
A live, deployed backend server connected to Neon that can create rooms, manage players, and sync game state in real-time.

---

## Phase 3 — Connect Frontend to Backend (True Multiplayer)
**Timeline:** 2–3 weeks  
**Goal:** Replace the simulated lobby with real multiplayer functionality.

### Tasks
- [ ] **Install Socket.io client** — `npm install socket.io-client`
- [ ] **Create a connection service** — `src/services/socket.js` to manage the WebSocket connection
- [ ] **Update Lobby screen** — Replace fake player simulation with real WebSocket events:
  - When a player joins, the server broadcasts to all clients
  - The player grid updates in real-time
- [ ] **Room ID / Invite Link** — Make these functional:
  - Room ID copies the code to clipboard
  - Invite Link generates a shareable URL like `https://findthespy.app/join/ABC123`
- [ ] **Join Room screen** — Build a new screen where players can enter a Room ID to join an existing room
- [ ] **Sync game state** — All game screens (Role Assignment, Word Reveal, Clue Giving, Voting, Results) now receive data from the server instead of local state
- [ ] **Handle disconnections** — Show a "Player disconnected" message and handle reconnection gracefully
- [ ] **Handle edge cases** — Room full, room not found, host leaves, game already started

### Architecture
```
┌──────────────┐     WebSocket      ┌──────────────┐      SQL       ┌──────────┐
│  Player A    │◄──────────────────►│              │◄──────────────►│          │
│  (React)     │                    │   Node.js    │                │   Neon   │
│              │     WebSocket      │   Server     │                │ Postgres │
│  Player B    │◄──────────────────►│  (Socket.io) │                │          │
│  (React)     │                    │              │                │          │
│              │     WebSocket      │              │                │          │
│  Player C    │◄──────────────────►│              │                │          │
│  (React)     │                    │              │                │          │
└──────────────┘                    └──────────────┘                └──────────┘
```

### Deliverable
A fully functional multiplayer game where 4 real people can create a room, join via Room ID, and play the complete game together in real-time.

---

## Phase 4 — Voice Chat Integration
**Timeline:** 1–2 weeks  
**Goal:** Let players talk to each other during the game using live voice.

### Recommended Service: **LiveKit** (Open Source) or **Agora.io** (Managed)

| Feature | LiveKit | Agora |
|---------|---------|-------|
| Pricing | Free (self-hosted) or Cloud | 10,000 free mins/month |
| SDKs | Web, iOS, Android, React | Web, iOS, Android, React |
| Ease of use | Medium | Easy |
| Latency | ~100ms | ~100ms |

### Tasks
- [ ] **Choose provider** — Sign up for LiveKit Cloud or Agora.io
- [ ] **Server-side token generation** — Add an endpoint to your Node.js server that generates auth tokens for voice rooms
- [ ] **Frontend integration** — Add a `VoiceChat` component:
  - Microphone toggle (mute/unmute)
  - Speaker indicator (show who is talking)
  - Auto-join voice room when game starts
  - Auto-leave when game ends
- [ ] **UI indicators** — Show a small microphone icon next to each player's avatar with a green glow when they're speaking
- [ ] **Permission handling** — Request microphone permission gracefully with a clear prompt

### Deliverable
Players can talk to each other in real-time during the game, with mute controls and speaking indicators.

---

## Phase 5 — Mobile App (App Store & Play Store)
**Timeline:** 2–3 weeks  
**Goal:** Package the web app as a native mobile app.

### Recommended Tool: **Capacitor** (by Ionic)

Capacitor wraps your existing React web app into a native iOS/Android shell. You keep 100% of your existing code.

### Tasks
- [ ] **Install Capacitor** — `npm install @capacitor/core @capacitor/cli`
- [ ] **Initialize** — `npx cap init "Find the Spy" com.findthespy.app`
- [ ] **Add platforms** — `npx cap add ios` and `npx cap add android`
- [ ] **Native plugins** — Install Capacitor plugins for:
  - `@capacitor/haptics` — Vibration feedback on vote, reveal
  - `@capacitor/share` — Native share sheet for invite links
  - `@capacitor/clipboard` — Copy Room ID to clipboard
  - `@capacitor/push-notifications` — Notify when a friend invites you
- [ ] **App icons & splash screen** — Design proper app icons (1024x1024) and launch screens for all device sizes
- [ ] **Build & test on simulators** — Test on iOS Simulator and Android Emulator
- [ ] **Test on real devices** — Side-load onto physical phones for real-world testing

### App Store Submission
- [ ] **Apple Developer Account** — $99/year — [developer.apple.com](https://developer.apple.com)
- [ ] **Google Play Developer Account** — $25 one-time — [play.google.com/console](https://play.google.com/console)
- [ ] **App Store screenshots** — Capture 6.7" and 5.5" screenshots
- [ ] **Privacy policy** — Required for both stores (especially if using microphone)
- [ ] **App review** — Submit and address any review feedback

### Deliverable
"Find the Spy" is live on both the Apple App Store and Google Play Store as a downloadable native app.

---

## Phase 6 — Post-Launch & Growth
**Timeline:** Ongoing  
**Goal:** Grow the player base and add features.

### Tasks
- [ ] **Analytics** — Add Mixpanel or PostHog to track game completions, drop-off points, and popular words
- [ ] **User accounts** — Allow sign-in with Google/Apple for persistent profiles and stats
- [ ] **Friend system** — Add friends, see who's online, invite directly
- [ ] **Custom word packs** — Let players create and share their own word categories
- [ ] **Ranked mode** — Competitive matchmaking with ELO-based rankings
- [ ] **Cosmetics** — Unlockable avatars, name colors, and victory animations
- [ ] **Monetization** — Premium word packs, ad-free experience, or battle pass
- [ ] **Localization** — Support multiple languages (Hindi, Spanish, etc.)

---

## Summary Timeline

| Phase | What | Duration |
|-------|------|----------|
| **Phase 1** | Polish single-player | 1–2 weeks |
| **Phase 2** | Backend + Neon DB | 1–2 weeks |
| **Phase 3** | Real multiplayer | 2–3 weeks |
| **Phase 4** | Voice chat | 1–2 weeks |
| **Phase 5** | Mobile apps | 2–3 weeks |
| **Phase 6** | Growth & features | Ongoing |
| **Total to v1.0** | Phases 1–5 | **~8–12 weeks** |

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Styling | Vanilla CSS |
| Backend | Node.js + Express |
| Real-time | Socket.io |
| Database | Neon (PostgreSQL) |
| ORM | Prisma |
| Voice Chat | LiveKit or Agora.io |
| Mobile Wrapper | Capacitor |
| Hosting (Server) | Railway / Render / Fly.io |
| Hosting (Frontend) | Vercel / Netlify |
| CI/CD | GitHub Actions |

---

> **Next Step:** Start with Phase 1 — polish the single-player experience until it feels amazing, then move to Phase 2 to build the backend. 🚀
