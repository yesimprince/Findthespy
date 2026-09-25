# 🗺️ Frontend Implementation Plan

This document outlines the phase-wise approach to building the "Find the Spy" frontend. We will heavily utilize the **Figma MCP** to extract design tokens (colors, typography), layouts, and component structures directly from the design files.

---

## 🛠️ Phase 1: Project Setup & Design System Foundation
*Goal: Initialize the React/Next.js environment and establish the global design system based on Figma.*

1. **Initialize Project:** Scaffold the React application (e.g., via Vite or Next.js) and clean up boilerplate.
2. **Figma MCP - Global Tokens Extraction:** 
   - Extract primary/secondary colors (e.g., deep purples, neon blues), typography (fonts, sizes, weights), and spacing guidelines using the Figma MCP.
   - Implement these tokens as **CSS Variables** in `index.css` for a consistent, premium aesthetic.
3. **Base Layout:** Setup the mobile-first responsive container that matches the aspect ratio of the Figma frames.

---

## 🧩 Phase 2: Core Reusable Components
*Goal: Build the UI building blocks before assembling the screens.*

Using the Figma MCP, we will extract design context for the following components:
1. **Buttons:** Primary (e.g., "Start Game", "Vote"), Secondary (e.g., "How to Play"). Ensure hover and active states (micro-animations) match the premium feel.
2. **Player Avatars:** The circular player icons with names.
3. **Timer Component:** The countdown timer (e.g., 1:30) used during the Clue phase.
4. **Cards/Modals:** The stylized containers used for displaying roles and words.

---

## 🏁 Phase 3: Pre-Game & Onboarding Screens
*Goal: Implement the screens players see before a round starts.*

1. **Screen 1: Game Intro / Splash:**
   - Extract background aesthetics, logo placement, and "Start Game" button layout.
2. **Screen 3: How to Play:**
   - Layout the rules typography, bullet points, and the "Understand" button.
3. **Screen 2 & 10: Round Intro (Round 1 & 2):**
   - Extract the bold typography, glowing effects, and transition animations for announcing the round.

---

## 🕵️ Phase 4: Active Gameplay Screens
*Goal: Implement the core game loop screens where roles and words are revealed.*

1. **Screen 4: Role Assigned (Spy vs. Player):**
   - Use Figma MCP to extract the styling differences between being assigned "Innocent" vs "Spy".
2. **Screen 5: Word Revealed:**
   - Extract the card layout showing the secret word (e.g., "PIZZA") or the "You are the Spy" text.
3. **Screen 6: Countdown Begins:**
   - Extract the large, dramatic countdown layout ("3", "2", "1").
4. **Screen 7: Clue Giving:**
   - Implement the complex layout showing all players, the active timer, and the "Give Clue" interface.

---

## 🗳️ Phase 5: Voting & Results Screens
*Goal: Implement the climax of the round.*

1. **Screen 8: Spy Voting:**
   - Extract the list view of players where users tap to vote. Ensure selection states (glow/border) are implemented exactly as designed.
2. **Screen 9: Round Results (Room Wins / Spy Wins / Tie):**
   - Extract the distinct visual states for the three different outcomes. 
   - Implement the scoreboard layout showing who voted for whom.

---

## 🏆 Phase 6: Post-Game & Polish
*Goal: Wrap up the game loop and add final polish.*

1. **Screen 11: Leaderboard:**
   - Extract the podium/ranking layout showing 1st, 2nd, 3rd place and overall scores.
2. **Polish & Animations:** 
   - Review all screens to ensure transitions between phases are smooth and engaging (fade-ins, slide-ups).
   - Ensure the UI feels responsive and alive, fulfilling the "Premium Design" requirement.

---

### Next Steps for Execution:
To begin **Phase 1**, provide the Figma URL/Link for the design file so we can invoke the Figma MCP and start extracting the design system!
