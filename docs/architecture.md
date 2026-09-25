# 🏗️ Find the Spy — Game Architecture

## 1. System Overview
"Find the Spy" is a real-time multiplayer party game. Players join a shared "Room", meaning the game requires a central state management system that can synchronize game phases, timers, and votes across all connected devices simultaneously.

## 2. Tech Stack Recommendations

### Option A: Serverless & Real-Time BaaS (Recommended)
- **Frontend**: React (via Vite) or Next.js
- **Styling**: Vanilla CSS (using CSS variables for dynamic themes and glowing/premium aesthetics)
- **Backend / Real-time Sync**: Firebase (Firestore/Realtime Database) or Supabase
- **Why**: Backend-as-a-Service (BaaS) platforms provide built-in WebSocket listeners. You can create a "Room" document, and all players in that room will instantly see when the game state changes from `LOBBY` to `VOTING`.

### Option B: Custom WebSocket Server
- **Frontend**: React (via Vite)
- **Backend**: Node.js + Express + Socket.io
- **Why**: Perfect if you want total control over the event loop (`player_joined`, `timer_tick`, `vote_cast`). Requires deploying a persistent server (e.g., on Render or Heroku) instead of serverless functions.

---

## 3. Core Data Models

To manage the game logic, the database/state will need the following core entities:

### `Room` (The Game Session)
```typescript
{
  id: string;              // 4-letter join code (e.g., "WXYZ")
  hostId: string;          // ID of the player who created the room
  status: 'LOBBY' | 'PLAYING' | 'FINISHED';
  currentRound: number;    // 1, 2, or 3
  phase: 'INTRO' | 'REVEAL' | 'CLUES' | 'VOTING' | 'ROUND_RESULT';
  secretWord: string;      // The word for the current round
  spyId: string;           // ID of the player who is the spy
  timerEndAt: number;      // Timestamp for when the current phase timer ends
}
```

### `Player` (Sub-collection of Room)
```typescript
{
  id: string;
  name: string;
  avatar: string;          // Emoji or character ID
  score: number;           // Cumulative score across rounds
  isReady: boolean;
}
```

### `Votes` (Sub-collection of Room per round)
```typescript
{
  roundNumber: number;
  voterId: string;         // The player voting
  votedForId: string;      // The player they selected as the spy
}
```

---

## 4. Game State Machine (The Event Loop)

The game progresses through a strict state machine. The Host or the Server dictates the transitions:
1. **Lobby Phase**: Players join via Room Code. Host clicks "Start Game".
2. **Setup Phase**: Server randomly selects a Spy and picks a Secret Word from the dictionary.
3. **Intro Phase**: Screens 1 & 2 (Splash & Round Intro).
4. **Reveal Phase**: Screen 4 & 5. Players see their specific role (Spy or Player) and the word.
5. **Clue Phase (Timer)**: Screen 7. 1:30 timer begins.
6. **Voting Phase**: Screen 8. Players lock in their votes.
7. **Resolution Phase**: Server calculates scores based on the rules. Shows Tie / Spy Wins / Room Wins.
8. **Loop**: Repeat from Step 3 until 3 rounds are complete. Show Leaderboard.

---

## 5. Frontend Architecture (React)

### Directory Structure
```text
/src
  /assets         # Images, icons, fonts
  /components     # Reusable UI elements (Buttons, Avatar, Timer, Modals)
  /contexts       # GameContext.js (holds the real-time room data)
  /screens        # The 11 distinct game screens mapped to Game Phases
  /services       # Firebase or Socket.io connection logic
  /styles         # index.css (Premium aesthetics, colors, animations)
  /utils          # Helper functions (score calculations, word lists)
```

### Component Driven Design
To ensure the UI matches the premium Figma design:
- **Design Tokens**: Colors (e.g., deep purples, glowing blues), typography, and spacing should be defined as CSS Variables in `:root`.
- **Micro-Animations**: Use CSS transitions for button hovers, voting selection states, and countdown timer pulses to make the game feel alive.
