# Spotlyte Find My Spy Handoff

Sep 25, 2026

## Overview

Find My Spy is a multiplayer party game designed for **Spotlyte inside Bonfire**. The game is played exclusively by real people in a chat group—there are no bots. Players join by opting into a poll in the chat, and whoever opts in is seated at the game table. 

| Item | Where |
| :--- | :--- |
| **Final UI (source of truth)** | Figma (kMtA9JJIQtf7KxmPhlbq6h) |
| **Playable prototype** | `src/App.jsx` (Vite + React) |
| **Frames used** | Splash, How to play, Round Intro, Role Assigned, Word Revealed, Countdown, Clue Giving, Voting, Round Results, Leaderboard |
| **Build** | React + Vite, standard CSS modules |
| **Canvas** | Responsive mobile-first view (centered container) |

**In scope:** The full 3-round game loop, support for any number of real players opting in via chat poll, dynamic turn ordering, live clue-giving, voting logic, dynamic scoring, and the final leaderboard.

**Out of scope:** Simulated bots (this is a real-player-only experience).

## Complete feature list

### Group Opt-In & Seating
| Feature | What it does |
| :--- | :--- |
| **Chat Poll Opt-in** | A poll is sent in the Bonfire chat group. Anyone who opts in is pulled into the active game session. |
| **Dynamic Seating** | The game scales to fit any number of real players who joined from the poll. |

### Turn feedback & UI
| Feature | What it does |
| :--- | :--- |
| **Dynamic Turn Title** | Changes between "YOUR TURN" and "[PLAYER NAME]'S TURN" dynamically. |
| **Active Avatar Ring** | The current player gets a vibrant purple/pink conic gradient ring and a glowing drop shadow. |
| **Typing Indicator** | While a real player is typing their clue, a translucent box appears saying "[Player] is typing...". |

### Gameplay Mechanics
| Feature | What it does |
| :--- | :--- |
| **Role Distribution** | 1 Spy, the remaining participants are Regular Players. Roles are randomized every round. |
| **Turn Order** | Randomized at the start of the Clue Giving phase. |
| **Word Pool** | Words are pulled from a shared pool (`gameData.js`) and never repeat in the same match. |

### End of round and leaderboard
| Feature | What it does |
| :--- | :--- |
| **Voting Logic** | At the end of the round, all real players vote on who they think the Spy is. |
| **Scoring** | If the room catches the spy, correct voters get +10 points. If the spy survives (or there is a tie), the spy gets +20 points. |
| **Dynamic Results Button** | The button says "Next Round Starts" for rounds 1 and 2, but changes to "See full results" after Round 3. |
| **Leaderboard Podium** | The top 3 players are placed on a golden podium. |

## Developer handoff: architecture

The front-end is a single-page React application running off React local state. For production inside Bonfire, this state will be synced across clients via real-time networking (e.g. WebSockets/Bonfire backend).

### Files

| File | Purpose |
| :--- | :--- |
| `App.jsx` | The main state machine. Controls `gameState` (SPLASH -> ROLE_ASSIGNED -> CLUE_GIVING -> VOTING -> ROUND_RESULTS). |
| `screens/*.jsx` | Presentational components. They receive props from the state machine and fire callbacks to advance the game. |
| `App.css` | Contains global tokens and shared classes like `.btn-primary` and `.btn-secondary`. |

## Implementation notes and edge cases

- **Transition Delays:** Added a 2.5-second buffer at the end of the `ClueGiving` phase so players have time to read the final clue before being transitioned to the `Voting` screen.
- **Z-Index on Absolute Buttons:** Action buttons on modals have `z-index: 10` to prevent background overlays from blocking pointer events.
- **Clue Overflow:** Slicing is dynamic (`clues.slice(isTyping ? -2 : -3)`) to ensure the chat box only shows 3 items maximum (including the typing indicator) without pushing the UI off-screen.

## Assets, limitations and open questions

### Known limitations
- **Real-Time Multiplayer**: The current code is a local React state prototype. Production requires mapping `gameState`, `clues`, and `votes` to the Bonfire multiplayer backend.

### Open questions
- [ ] Should players who join the chat *after* the game has started be allowed to spectate?
- [ ] Should voice chat be enabled during the Voting phase so players can debate?
