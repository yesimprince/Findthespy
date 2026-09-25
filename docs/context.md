# 🎮 Find the Spy — Game Context

## Scoring Rules

**1. Each Game Has 3 Rounds**
- Each round has a different secret word.
- Everyone gets the same word except the Spy.
- Players give clues and then vote for who they think is the Spy.

**2. 🏠 If the Room Wins**
- The Spy is correctly identified.
- Vote for the Spy → +10 points
- Vote for an Innocent player → 0 points
- The Spy → 0 points
*Example: 6 players → 5 vote for Spy, 1 votes for Innocent → 5 players get 10 points each → Innocent voter gets 0*

**3. 🕵️ If the Spy Wins**
- The Spy survives because players fail to identify them.
- The Spy gets 10 points for every vote received by an Innocent player.
- Each vote for the Spy → +10 points to that voter.
*Example: 6 players → 3 vote for Innocent, 2 vote for Spy → Spy gets 30 points → 2 players who voted for Spy get 10 points each → Innocent voters get 0 points*

**4. 🤝 If It's a Tie**
- Everyone gets 0 points.
- No points are awarded to the Spy or players.

**🏆 Final Winner**
- After 3 rounds, all points are added.
- The player with the highest total score wins the game.

---

## Screen Flows & User Stories

Based on the design structures, the game follows these primary flows depending on the player's role.

### General Flow (Regular Player / Room)
1. **Game Intro / Splash** (Excitement): Enter the game → Start playing
2. **Round 1 Intro** (Anticipation): Know the round has started → Get ready
3. **How to Play** (Clarity): Understand the rules → Learn how to play
4. **Role Assigned** (Curiosity): Know my role → Understand my role
5. **Word Revealed** (Focus): See the secret word → Remember the word
6. **Countdown Begins** (Anticipation): Prepare for the round → Get ready
7. **Clue Giving** (Tension): Give and hear clues → Choose my clue
8. **Spy Voting** (Suspicion): Identify the spy → Vote for a player
9. **Round Result — Tie / Win / Lose** (Surprise/Excitement): See the voting outcome → Continue the game
10. **Round 2 Intro** (Excitement): Start the next round → Get ready again
11. **Leaderboard** (Competition): See current rankings → Check my position

### Spy Specific Flow
1. **Spy Role Assigned** (Excitement): Know I am the spy → Hide my identity
2. **Spy Waiting** (Suspicion): Wait while players see the word → Observe the group
3. **Spy Countdown** (Nervousness): Prepare for the round → Think of a possible word
4. **Clue Giving — Spy Turn** (Tension): Give a believable clue → Blend in with players
5. **Spy Voting** (Suspense): Avoid being identified → Influence or predict the vote
6. **Spy Wins** (Victory): See that I wasn't caught → Continue to next round
