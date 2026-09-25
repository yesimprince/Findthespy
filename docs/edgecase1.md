# 🛡️ Multiplayer Edge Cases & Known Issues

> A comprehensive list of edge cases, bugs, and potential failures in the multiplayer flow of **Find My Spy**. Each item is categorized by severity and current status.

---

## 🔴 Critical (Game-Breaking)

### 1. Spy Disconnects Mid-Game
- **Scenario:** The player who was assigned as the Spy closes their tab or loses internet during the clue-giving or voting phase.
- **Impact:** The entire game breaks — no one can vote for the spy, the round can never end.
- **Current Status:** ❌ Not Handled
- **Fix:** Detect spy disconnect → auto-end the round → Players win by default. Notify everyone with a toast: _"The Spy fled! Players win this round."_

### 2. Host Disconnects Mid-Game
- **Scenario:** The host (room creator) closes their browser after starting the game.
- **Impact:** The game continues for other players, but no one has authority to manage the room (e.g., kick players, start next round).
- **Current Status:** ❌ Not Handled
- **Fix:** Auto-promote the next player in the list to become the new Host. Broadcast `host-changed` event to all clients.

### 3. All Players Leave Except One
- **Scenario:** 3 players disconnect one-by-one until only 1 player remains.
- **Impact:** The game is stuck — can't vote, can't give clues, can't end the round.
- **Current Status:** ❌ Not Handled
- **Fix:** If `players.length < 2` during an active game, auto-end the game and redirect the last player to the splash screen with a message: _"Not enough players to continue."_

### 4. Duplicate Room Codes
- **Scenario:** `Math.random()` generates a room code that already exists in the database.
- **Impact:** Two separate groups of players get merged into the same room.
- **Current Status:** ⚠️ Unlikely but possible
- **Fix:** Before creating, check if `roomCode` already exists in the DB. If it does, regenerate.

---

## 🟠 High (Gameplay Impact)

### 5. Player Joins Mid-Game
- **Scenario:** Someone enters a valid Room ID after the game has already started.
- **Impact:** They get added to the room but have no role (not spy, not player), no word, and see a broken UI.
- **Current Status:** ❌ Not Handled
- **Fix:** Add a `status` field to the Room model (`WAITING`, `IN_PROGRESS`, `FINISHED`). Reject joins when `status !== 'WAITING'`. Show the joiner: _"This game is already in progress."_

### 6. Same Player Joins Twice (Duplicate Tab)
- **Scenario:** A user opens two tabs, joins the same room with the same name.
- **Impact:** They appear twice in the player list. If they're the spy in one tab, they see the word in the other.
- **Current Status:** ❌ Not Handled
- **Fix:** On `join-room`, check if a player with the same `username` already exists in the room. If yes, reject the second join or reconnect them to their existing session.

### 7. Player Refreshes Browser During Game
- **Scenario:** A player hits Cmd+R / F5 during the clue-giving or voting phase.
- **Impact:** Their socket disconnects → server removes them from the room → they lose their role, word, and game state. When the page reloads, they're back at the splash screen.
- **Current Status:** ❌ Not Handled
- **Fix:** Store the player's `sessionId` (using a cookie or localStorage). On reconnect, check if their session is still in an active game and restore their state (role, word, round number).

### 8. Race Condition: Two Players Join at the Exact Same Millisecond
- **Scenario:** Two players click "Join" at the same instant.
- **Impact:** Both `join-room` handlers run concurrently. One might fail with a Prisma unique constraint error, or both might read the same player count before either write completes.
- **Current Status:** ⚠️ Rare but possible
- **Fix:** Wrap the join logic in a database transaction. Use Prisma's `$transaction` to ensure atomicity.

### 9. Room is Full (5th Player Tries to Join)
- **Scenario:** The room already has 4 players, but someone tries to join with the Room ID.
- **Impact:** Currently, the server will happily add a 5th player, breaking the 4-player grid UI.
- **Current Status:** ❌ Not Handled
- **Fix:** Before inserting a `RoomMember`, count existing members. If `count >= 4`, emit an error event back: `socket.emit('join-error', { message: 'Room is full' })`.

---

## 🟡 Medium (UX Issues)

### 10. No Loading/Error States for Network Failures
- **Scenario:** The server is down, or the player has no internet.
- **Impact:** Clicking "Create Room" or "Join Room" does nothing. No feedback. The user thinks the app is frozen.
- **Current Status:** ❌ Not Handled
- **Fix:** Add `socket.on('connect_error')` listener. Show a toast/modal: _"Could not connect to server. Please check your internet."_

### 11. Stale Rooms in Database
- **Scenario:** A game finishes or all players leave, but the Room and RoomMember records stay in the Neon database forever.
- **Impact:** Database grows indefinitely. Old room codes could theoretically be "joined" again.
- **Current Status:** ❌ Not Handled
- **Fix:** Add a cleanup cron job or a `TTL` / `expiresAt` field on the Room model. Auto-delete rooms older than 24 hours. Or delete the room when the last player disconnects.

### 12. Room Name Shows as "Multiplayer Room" for Joiners
- **Scenario:** The host creates a room called "HOSTEL", but the joiner's screen says "Joined Room" at the top.
- **Impact:** Confusing UX — the joiner doesn't see the room's real name.
- **Current Status:** ⚠️ Partially Handled
- **Fix:** Include `roomName` in the `room-updated` event payload so all clients display the correct name.

### 13. Voice Chat Fails Silently
- **Scenario:** LiveKit token generation fails (e.g., API keys expired, server error).
- **Impact:** The voice chat section shows a red error message, but the player has no idea what went wrong or how to fix it.
- **Current Status:** ⚠️ Basic error shown
- **Fix:** Add retry logic. Show a more descriptive error with a "Retry" button. Optionally, allow playing without voice.

### 14. Voting Phase: No Timeout
- **Scenario:** One player walks away from their phone and never votes.
- **Impact:** The game is stuck forever waiting for all votes.
- **Current Status:** ❌ Not Handled
- **Fix:** Add a server-side voting timer (e.g., 60 seconds). If a player doesn't vote in time, auto-assign a random vote or skip them.

---

## 🟢 Low (Minor / Cosmetic)

### 15. Player Names Can Be Empty
- **Scenario:** A player submits the join form without typing a name.
- **Impact:** An empty-named player card appears in the lobby.
- **Current Status:** ⚠️ No validation
- **Fix:** Add client-side validation: disable "Join" button if name input is empty. Server-side: reject `join-room` if `player.name` is empty or whitespace.

### 16. Room ID is Case-Sensitive
- **Scenario:** Host shares "9T5LDA" verbally. The joiner types "9t5lda" (lowercase).
- **Impact:** The server doesn't find the room because the code is stored in uppercase.
- **Current Status:** ❌ Not Handled
- **Fix:** Normalize room codes to uppercase on both client and server: `roomCode = roomCode.toUpperCase()`.

### 17. No "Leave Room" Button
- **Scenario:** A player wants to leave the lobby without closing their entire browser tab.
- **Impact:** The only way to leave is to close or refresh the tab.
- **Current Status:** ❌ Not Handled (back button exists for host only)
- **Fix:** Add a visible "Leave Room" button for all players. On click, emit a `leave-room` event and redirect to splash.

### 18. Clipboard Copy Fails on Some Browsers
- **Scenario:** `navigator.clipboard.writeText()` is not available in older browsers or non-HTTPS contexts.
- **Impact:** Clicking "Room ID" or "Invite Link" throws a silent error. Nothing is copied.
- **Current Status:** ⚠️ No fallback
- **Fix:** Add a fallback using `document.execCommand('copy')` with a temporary textarea element.

### 19. Invite Link Doesn't Auto-Join
- **Scenario:** The copied invite link is `http://localhost:5173?room=9T5LDA`, but opening it just shows the splash screen — it doesn't auto-fill the Room ID.
- **Impact:** The invite link is useless — the joiner still has to manually type the code.
- **Current Status:** ❌ Not Handled
- **Fix:** On app load, check `URLSearchParams` for a `room` param. If found, auto-navigate to the Join Room screen with the code pre-filled.

---

## 📋 Priority Matrix

| Priority | Issue # | Effort | Impact |
|----------|---------|--------|--------|
| 🔴 P0 | #5 (Join mid-game block) | Low | High |
| 🔴 P0 | #9 (Room full check) | Low | High |
| 🔴 P0 | #1 (Spy disconnect) | Medium | Critical |
| 🟠 P1 | #2 (Host disconnect) | Medium | High |
| 🟠 P1 | #3 (All players leave) | Low | High |
| 🟠 P1 | #6 (Duplicate player) | Medium | High |
| 🟠 P1 | #10 (Network error UI) | Low | Medium |
| 🟡 P2 | #7 (Browser refresh) | High | Medium |
| 🟡 P2 | #14 (Voting timeout) | Medium | Medium |
| 🟡 P2 | #16 (Case-sensitive code) | Low | Low |
| 🟢 P3 | #15, #17, #18, #19 | Low each | Low |

---

## 🚀 Recommended Fix Order

1. **Quick Wins (30 min):** #5, #9, #15, #16, #17
2. **Core Stability (2-3 hrs):** #1, #2, #3, #6, #10
3. **Session Resilience (4+ hrs):** #7, #8, #14
4. **Polish (1-2 hrs):** #4, #11, #12, #13, #18, #19
