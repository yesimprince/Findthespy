# Find My Spy — Edge Cases & MVP Requirements

> **Scope:** Single-device prototype with **1 human player + 7 bot players** across **3 rounds**.

---

## 1. Game Initialization

### 1.1 Player Setup
| Requirement | Detail |
|---|---|
| Total players | 8 (1 human + 7 bots) |
| Human player name | Entered on Splash or hardcoded as "You" for MVP |
| Bot names | Pre-defined list: `["Riju", "Saif", "Shivraj", "Rajman", "Priya", "Aarav", "Neha"]` |
| Bot avatars | Generated via `ui-avatars.com` or local assets |
| Player order | Randomized at the start of each round |

### 1.2 Word Bank
| Edge Case | How to Handle |
|---|---|
| Word list is empty | Fallback to a hardcoded default list (minimum 20 words) |
| Same word picked twice across rounds | Track used words per game session; never repeat within a game |
| Word categories | Optional for MVP — a flat list of common nouns works (e.g., "Pizza", "Beach", "Guitar", "Hospital", "Umbrella") |

### 1.3 Minimum Word Bank Size
- Must have **at least 3 unique words** (one per round).
- Recommended: **20+ words** so replays feel fresh.

---

## 2. Role Assignment (Per Round)

### 2.1 Spy Selection
| Rule | Detail |
|---|---|
| Exactly 1 spy per round | Never 0, never 2+ |
| Spy can be the human player | Yes — roughly 1 in 8 chance each round |
| Same player can be spy multiple rounds | Allowed, but **should be avoided** for fairness. Track who was spy and deprioritize them. |
| Spy selection must be random | Use `Math.random()` or Fisher-Yates shuffle |

### 2.2 Edge Cases
| Edge Case | How to Handle |
|---|---|
| Human is spy in Round 1 | Show the "You're a Spy" card (screen 4 spy variant). Skip word reveal — show spy instructions instead. |
| Human is spy in ALL 3 rounds | Statistically unlikely (0.2%) but possible. Allow it. |
| A bot is spy | Bot should give intentionally vague/generic clues (see §4.2) |

---

## 3. Word Reveal Phase

### 3.1 Human Player Flow
| Scenario | Screen Shown |
|---|---|
| Human is a **regular player** | "YOUR SECRET WORD: [WORD]" card (green gradient) |
| Human is the **spy** | "You're a Spy" card (pink gradient) — NO word shown |

### 3.2 Bot Players
- Bots do **not** need a reveal screen — they "know" their role internally.
- The word reveal screen is **only** for the human player.

### 3.3 Edge Cases
| Edge Case | How to Handle |
|---|---|
| Human taps "Start Game" before reading the word | Allow it — no forced delay, but the word was shown |
| Word is very long (e.g., "Refrigerator") | CSS should handle text overflow with `word-break` or smaller font |

---

## 4. Clue Giving Phase

### 4.1 Turn Order
| Rule | Detail |
|---|---|
| Order | Randomized at round start; each player gives exactly 1 clue |
| Human's turn | When it's the human's turn, enable the input field and mic button |
| Bot turns | Auto-played with a 2–4 second delay to simulate "thinking" |
| Timer | 1:30 total for the clue-giving phase |

### 4.2 Bot Clue Logic (Critical for MVP)

#### If the bot is a **regular player** (knows the word):
- Pick from a pool of **related but not identical** clues.
- Example for word "Pizza": `["Cheese", "Italy", "Dough", "Oven", "Slice", "Toppings", "Delivery"]`
- Each bot picks a **different** clue — no duplicates within a round.

#### If the bot is the **spy** (does NOT know the word):
- Pick from a pool of **generic/vague** clues that could fit many words.
- Example: `["It's common", "Everyone knows it", "You see it around", "It's popular", "I like it"]`
- The spy bot should sound slightly off but not obviously wrong.

### 4.3 Edge Cases
| Edge Case | How to Handle |
|---|---|
| Human doesn't type a clue before timer expires | Auto-submit "..." or "No clue" as their clue |
| Human types an empty string | Reject — require at least 1 character |
| Human types the actual secret word as a clue | **Block it.** Show an inline warning: "You can't use the secret word as a clue!" |
| Human (as spy) types a clue | Allow any clue — the spy is bluffing |
| Timer reaches 0:00 mid-turn | Skip remaining players; proceed to voting |
| All 8 clues are given before timer expires | Immediately proceed to voting (don't wait for timer) |
| Bot gives same clue as another bot | Pre-check for duplicates; pick an alternative |
| Bot gives same clue as the human | Unlikely but allow it — makes the game interesting |

### 4.4 Clue Display
- Show clues in a scrollable list as they are given.
- Format: `[Avatar] [Name]: "[Clue]"`
- Highlight the currently active player.

---

## 5. Voting Phase

### 5.1 Voting Rules
| Rule | Detail |
|---|---|
| Each player gets exactly 1 vote | Cannot vote for yourself |
| Human votes by tapping a player row | Highlighted with purple gradient |
| Bot votes | Auto-selected after 1–3 second delay |
| Vote lock-in | Once tapped/selected, the vote is locked |
| Timer | 10 seconds to vote |

### 5.2 Bot Voting Logic (Critical for MVP)

#### If the bot is a **regular player**:
- **70% chance**: Vote for the actual spy (they noticed the vague clue).
- **30% chance**: Vote for a random non-spy player (simulates mistakes).
- Never vote for themselves.

#### If the bot is the **spy**:
- Vote for a random non-spy player (trying to deflect blame).
- Never vote for themselves.

### 5.3 Edge Cases
| Edge Case | How to Handle |
|---|---|
| Human doesn't vote before timer expires | Auto-abstain (their vote doesn't count) OR auto-vote for a random player |
| Two players are tied for most votes | → **Tie outcome** — neither is eliminated, no one wins the round |
| All votes are spread evenly (no majority) | → **Tie outcome** |
| Spy gets exactly 50% of votes (4 of 8) | Configurable: treat as **Tie** for MVP |
| Human votes for themselves | **Block it.** Disable the human's own row in the voting list |
| Only 1 vote difference | The player with the most votes is "accused" — check if they're the spy |

### 5.4 Vote Count Display
- Show real-time vote counts next to each player as bots lock in.
- The human's selected player gets the purple highlight.
- Display "3 of 4 have locked in" progress text.

---

## 6. Round Results & Scoring

### 6.1 Outcome Resolution
| Scenario | Outcome | Points |
|---|---|---|
| Player with most votes **IS** the spy | **Room Wins** | Each player who voted correctly gets **+10 points** |
| Player with most votes is **NOT** the spy | **Spy Wins** | Spy gets **+20 points** |
| Voting is **tied** (no clear majority) | **Tie** | **No points** awarded to anyone |

### 6.2 Edge Cases
| Edge Case | How to Handle |
|---|---|
| Spy gets 0 votes | **Spy Wins** (they successfully hid) — spy gets +20 |
| All 7 other players vote for the spy | **Room Wins** — all 7 get +10 each |
| Human didn't vote but room still wins | Human gets **0 points** for that round (didn't contribute) |
| Multiple players tied for most votes | **Tie** — show "It's a Tie!" banner |
| Score overflow (unlikely in 3 rounds) | Max possible score = 30 (10 per round). Spy max = 60 (20 per round × 3 if spy every round). No overflow risk. |

### 6.3 Results Screen Data
| Field | Source |
|---|---|
| Banner | Determined by outcome (Room Wins / Spy Wins / Tie) |
| "THE SPY WAS" | Reveal the spy's name and avatar |
| "THE WORD WAS" | Reveal the secret word |
| Scoreboard | Cumulative scores across all completed rounds, sorted descending |

---

## 7. Round Transitions

### 7.1 Flow After Results
| Round | After Results Screen |
|---|---|
| Round 1 → Round 2 | Auto-advance to Round Intro ("ROUND 2") after 5-second countdown |
| Round 2 → Round 3 | Auto-advance to Round Intro ("ROUND 3") after 5-second countdown |
| Round 3 → Game Over | Navigate to **Final Leaderboard** screen |

### 7.2 Edge Cases
| Edge Case | How to Handle |
|---|---|
| User backgrounds the app during auto-advance timer | Timer should still tick (use `setTimeout`, not `requestAnimationFrame`) |
| User refreshes during a round | For MVP: reset to Splash. No persistence needed. |
| Score state lost between rounds | Store scores in React state at the `App.jsx` level — persists across screens |

---

## 8. Final Leaderboard

### 8.1 Display Rules
| Rule | Detail |
|---|---|
| Ranking | All 8 players ranked by cumulative score (descending) |
| Tie-breaking | If scores are equal, order alphabetically by name |
| Podium | Top 3 get the visual podium (gold/silver/bronze) |
| "You" highlight | The human player's row gets a special cyan highlight |
| Back button | Returns to Splash screen for a new game |

### 8.2 Edge Cases
| Edge Case | How to Handle |
|---|---|
| Human finishes last (8th place) | Still shown with the "You" highlight in the list |
| Human finishes 1st, 2nd, or 3rd | Shown on the podium with crown/badge |
| All players have 0 points (3 ties) | Show all 8 players with 0 points, ranked alphabetically |
| Multiple players tied at same score | Group them with the same rank number |

---

## 9. Timer Management

### 9.1 All Timers in the Game
| Screen | Timer | Duration | Behavior on Expiry |
|---|---|---|---|
| Round Intro | Auto-advance | 3 seconds | → Role Assigned |
| Countdown | Visual countdown | 3-2-1 | → Clue Giving |
| Clue Giving | Round timer | 1:30 (90s) | → Voting |
| Voting | Vote timer | 10 seconds | → Round Results |
| Round Results | Next round timer | 5 seconds | → Next Round Intro / Leaderboard |

### 9.2 Edge Cases
| Edge Case | How to Handle |
|---|---|
| User clicks "Speak Now" before their turn | Ignore — input is only enabled during the human's turn |
| Multiple rapid taps on buttons | Debounce all button handlers (300ms) |
| Timer shows negative values | Clamp to `0:00`; trigger transition immediately at 0 |

---

## 10. Bot Player Behavior (AI Simulation)

### 10.1 Bot Personality System (Nice to Have for MVP)
For a more believable game, bots can have slight personality variation:

| Bot | Behavior |
|---|---|
| Riju | Always gives very specific clues (easy to spot if spy) |
| Saif | Gives medium-length clues |
| Shivraj | Sometimes gives vague clues even as a regular player (red herring) |
| Rajman | Quick voter — always locks in fast |
| Priya | Thoughtful — takes longer to submit clue |
| Aarav | Occasionally votes randomly even as a regular player |
| Neha | Strong deduction — 80% accuracy voting for the spy |

### 10.2 Bot Timing
| Action | Delay |
|---|---|
| Give a clue | Random 2–4 seconds after their turn starts |
| Cast a vote | Random 1–3 seconds, staggered |

### 10.3 Edge Cases
| Edge Case | How to Handle |
|---|---|
| Bot needs a clue but the word has no pre-mapped clues | Use a generic fallback: `["It's familiar", "Common thing", "You know this"]` |
| Bot spy gives a clue that accidentally matches the word | Allow it — adds realism. The spy might get lucky. |

---

## 11. State Management Architecture

### 11.1 Global Game State (in `App.jsx`)
```
gameState: {
  currentScreen: 'SPLASH' | 'ROUND_INTRO' | ... | 'LEADERBOARD',
  currentRound: 1 | 2 | 3,
  players: [
    { id, name, avatar, isHuman, isSpy, score, clue, votedFor }
  ],
  secretWord: string,
  usedWords: string[],
  spyPlayerId: number,
  votes: { [playerId]: votedForPlayerId },
  roundOutcome: 'ROOM_WINS' | 'SPY_WINS' | 'TIE' | null,
  clueOrder: number[], // shuffled player IDs
  currentClueIndex: number,
}
```

### 11.2 Reset Between Rounds
| Field | Reset? |
|---|---|
| `scores` | ❌ Cumulative across rounds |
| `isSpy` | ✅ Re-assigned each round |
| `secretWord` | ✅ New word each round |
| `clues` | ✅ Cleared |
| `votes` | ✅ Cleared |
| `roundOutcome` | ✅ Cleared |
| `clueOrder` | ✅ Re-shuffled |

### 11.3 Reset Between Games
- **Everything** resets to initial state.
- Return to Splash screen.

---

## 12. Word-to-Clue Mapping (MVP Data)

For the prototype, we need pre-built clue maps. Here's the minimum:

```json
{
  "Pizza": ["Cheese", "Italy", "Dough", "Oven", "Slice", "Delivery", "Pepperoni"],
  "Beach": ["Sand", "Waves", "Sun", "Towel", "Surfing", "Shells", "Vacation"],
  "Guitar": ["Strings", "Music", "Rock", "Acoustic", "Frets", "Solo", "Band"],
  "Hospital": ["Doctor", "Nurse", "Medicine", "Emergency", "Bed", "Surgery", "Ambulance"],
  "Umbrella": ["Rain", "Shade", "Handle", "Fold", "Weather", "Canopy", "Wet"],
  "Library": ["Books", "Quiet", "Shelves", "Reading", "Study", "Cards", "Knowledge"],
  "Airport": ["Plane", "Travel", "Boarding", "Passport", "Luggage", "Terminal", "Flight"],
  "Cinema": ["Movie", "Popcorn", "Screen", "Tickets", "Dark", "Seats", "Film"],
  "Jungle": ["Trees", "Animals", "Wild", "Green", "Vines", "Tropical", "Explorer"],
  "Castle": ["King", "Medieval", "Tower", "Moat", "Stone", "Knights", "Throne"],
  "Volcano": ["Lava", "Eruption", "Mountain", "Hot", "Ash", "Crater", "Magma"],
  "Submarine": ["Ocean", "Depth", "Periscope", "Navy", "Underwater", "Metal", "Dive"],
  "Circus": ["Clown", "Tent", "Acrobat", "Elephant", "Juggling", "Ringmaster", "Show"],
  "Bakery": ["Bread", "Cake", "Oven", "Flour", "Sweet", "Pastry", "Fresh"],
  "Museum": ["Art", "History", "Exhibit", "Ancient", "Gallery", "Statue", "Tour"],
  "Spaceship": ["Astronaut", "Rocket", "Stars", "Launch", "Orbit", "Galaxy", "Engine"],
  "Waterfall": ["River", "Nature", "Cliff", "Mist", "Flow", "Height", "Splash"],
  "Treasure": ["Gold", "Map", "Chest", "Pirates", "Hidden", "Jewels", "Dig"],
  "Lighthouse": ["Ocean", "Beacon", "Coast", "Ships", "Night", "Tall", "Warning"],
  "Dinosaur": ["Fossil", "Extinct", "Jurassic", "Reptile", "Giant", "Bones", "Ancient"]
}
```

### Spy Fallback Clues (Generic)
```json
[
  "It's pretty common",
  "Everyone knows this",
  "You see it around",
  "I've seen it before",
  "It's popular these days",
  "People talk about it",
  "It's everywhere",
  "Classic one",
  "Nothing special about it",
  "You'd recognize it"
]
```

---

## 13. Critical MVP Checklist

### Must Have (P0)
- [ ] Random spy assignment each round (exactly 1 spy)
- [ ] Word assignment (all non-spies get the same word)
- [ ] Spy sees "You're a Spy" card instead of the word
- [ ] Bot clue generation (word-related for regulars, vague for spy)
- [ ] Human clue input with validation (no empty, no secret word)
- [ ] Bot voting with weighted randomness
- [ ] Human vote selection (can't vote for self)
- [ ] Correct outcome resolution (Room Wins / Spy Wins / Tie)
- [ ] Cumulative scoring across 3 rounds
- [ ] Final leaderboard with correct ranking
- [ ] All timers working correctly
- [ ] Screen-to-screen navigation matches the flow

### Nice to Have (P1)
- [ ] Bot personality variation (different clue styles)
- [ ] Prevent same player from being spy 2+ rounds in a row
- [ ] Sound effects on transitions
- [ ] Haptic feedback on vote selection (mobile)
- [ ] Animated score counter on results screen
- [ ] Confetti/particles on Leaderboard for winner

### Not Needed for MVP (P2)
- [ ] Multiplayer / networking
- [ ] Persistent game history
- [ ] Custom word packs
- [ ] Difficulty levels
- [ ] Chat between players
- [ ] Spectator mode

---

## 14. Complete Game Flow (Happy Path)

```
SPLASH
  └→ ROUND_INTRO (Round 1)
      └→ ROLE_ASSIGNED (Spy or Player card)
          └→ WORD_REVEALED (Word for players / Spy card for spy)
              └→ COUNTDOWN (3-2-1)
                  └→ CLUE_GIVING (All 8 players give clues)
                      └→ VOTING (All 8 players vote)
                          └→ ROUND_RESULTS (Room Wins / Spy Wins / Tie)
                              └→ ROUND_INTRO (Round 2)
                                  └→ ... (repeat)
                                      └→ ROUND_RESULTS (Round 3)
                                          └→ LEADERBOARD (Final)
                                              └→ SPLASH (New Game)
```

---

## 15. Error Handling

| Error | Recovery |
|---|---|
| `Math.random()` returns same spy twice | Allowed — see §2.2 |
| State becomes undefined/null | Fallback to Splash screen |
| CSS animation doesn't trigger | Use `key` prop on screen components to force re-mount |
| Component doesn't unmount cleanly | Clear all `setTimeout`/`setInterval` in `useEffect` cleanup |
| Bot clue array runs out (all 7 used) | Recycle from start with slight modification ("Also [clue]") |

---

*Last updated: 2025-09-25*
