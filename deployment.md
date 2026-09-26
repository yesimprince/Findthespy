# 🚀 Deployment Guide — Find My Spy (Web Only)

> This guide covers every step to take the game from `localhost` to a live URL that anyone can open on their phone's browser and play.

---

## 📦 Architecture Overview

```
┌─────────────────────┐        ┌─────────────────────┐
│   FRONTEND (React)  │        │  BACKEND (Node.js)   │
│   Vite + React 19   │◄──────►│  Express + Socket.io │
│   Static Files      │  WSS   │  Prisma ORM          │
└────────┬────────────┘        └────────┬─────────────┘
         │                              │
         ▼                              ▼
   Vercel / Netlify             Railway / Render
   (Free Tier)                  (Free / $5 Tier)
                                        │
                          ┌─────────────┼─────────────┐
                          ▼             ▼             ▼
                     Neon (DB)    LiveKit (Voice)   Domain
                     (Free)      (Free Cloud)      (Optional)
```

---

## 🏆 Recommended Stack (100% Free to Start)

| Component | Platform | Free Tier | Why |
|-----------|----------|-----------|-----|
| **Frontend** | **Vercel** | Unlimited deploys, auto-HTTPS | Built for Vite/React, instant deploys from GitHub |
| **Backend** | **Render** | Free tier (sleeps after 15m) | Native WebSocket support for Socket.io |
| **Database** | **Neon** (already set up!) | 0.5 GB free | Already configured with Prisma |
| **Voice Chat** | **LiveKit Cloud** (already set up!) | 50 GB/month free | Already configured |
| **Domain** | Optional | — | Use `.vercel.app` + `.up.railway.app` for free |

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Your code is pushed to a **GitHub repository**
- [ ] Your `.env` files are **NOT** committed (add to `.gitignore`)
- [ ] The frontend `socket` URL points to the **deployed backend** (not `localhost`)
- [ ] Neon DB connection string is ready
- [ ] LiveKit API keys are ready

---

## Step 1: Push to GitHub

```bash
# From the project root: /Users/iamprince/Desktop/find my spy/

# Initialize git (if not already)
git init

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
server/.env
server/node_modules/
.DS_Store
EOF

# Commit everything
git add .
git commit -m "Find My Spy - ready for deployment"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/find-my-spy.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy the Backend on Render

Render is an excellent alternative that offers a permanent free tier for Web Services (though it will "sleep" after 15 mins of inactivity and take ~30 seconds to wake up on the first request).

### 2a. Sign Up & Create Web Service
1. Go to [render.com](https://render.com) → Sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select **"Build and deploy from a Git repository"** and choose your `find-my-spy` repo.

### 2b. Configure the Web Service
Fill in these details:
- **Name:** `find-my-spy-server`
- **Root Directory:** `server`
- **Environment:** `Node`
- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npm start`
- **Instance Type:** Free

### 2c. Set Environment Variables
Scroll down to **Environment Variables** and add:

```env
DATABASE_URL=postgresql://neondb_owner:...@ep-fancy-fog-....neon.tech/neondb?sslmode=require
LIVEKIT_URL=wss://findthespy-cwhi6g13.livekit.cloud
LIVEKIT_API_KEY=API7AUBMAh6A85V
LIVEKIT_API_SECRET=<your-secret-here>
```

### 2d. Get Your Backend URL
Click **"Create Web Service"**. Once the build finishes, Render will give you a URL like:
```
https://find-my-spy-server.onrender.com
```

**Save this URL** — you'll need it for the frontend.

---

## Step 3: Update Frontend Socket URL

Before deploying the frontend, update the socket connection to point to your Railway backend.

### Edit `src/services/socket.js`:

```javascript
import { io } from 'socket.io-client';

// Use environment variable, fallback to localhost for development
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const socket = io(SERVER_URL, {
  autoConnect: false,
});
```

### Create a `.env` file in the project root for local dev:
```env
VITE_SERVER_URL=http://localhost:3001
```

### Create a `.env.production` file for the deployed version:
```env
VITE_SERVER_URL=https://find-my-spy-server.onrender.com
```

> Vite automatically uses `.env.production` when you run `npm run build`.

---

## Step 4: Deploy the Frontend on Vercel

### 4a. Sign Up & Import
1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"** → Import your `find-my-spy` repo

### 4b. Configure Build Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (root — the frontend is at the top level) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 4c. Set Environment Variable
Add the production backend URL:

| Key | Value |
|-----|-------|
| `VITE_SERVER_URL` | `https://find-my-spy-server-production.up.railway.app` |

### 4d. Deploy!
Click **Deploy**. Vercel will:
1. Install dependencies
2. Run `npm run build`
3. Serve the static `dist/` folder
4. Give you a URL like: `https://find-my-spy.vercel.app`

---

## Step 5: Update CORS on the Backend

Your Render backend needs to allow requests from your Vercel domain.

### Edit `server/index.js`:

```javascript
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',                    // Local dev
      'https://find-my-spy.vercel.app',           // Production
      /\.vercel\.app$/                            // Preview deploys
    ],
    methods: ['GET', 'POST']
  }
});

// Also update Express CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://find-my-spy.vercel.app',
    /\.vercel\.app$/
  ]
}));
```

Commit, push, and Render will auto-redeploy.

---

## Step 6: Custom Domain (Optional)

### On Vercel (Frontend):
1. Go to **Project Settings** → **Domains**
2. Add your domain: `findmyspy.com`
3. Update your domain's DNS to point to Vercel

### On Render (Backend):
1. Go to **Settings** → **Custom Domains**
2. Add: `api.findmyspy.com`
3. Update DNS with the CNAME Render provides

### Update Socket URL:
```env
VITE_SERVER_URL=https://api.findmyspy.com
```

---

## 🔄 CI/CD (Automatic Deployments)

Both Vercel and Render support **auto-deploy on push**:

```
git push origin main
      │
      ├──► Vercel detects change → rebuilds frontend → live in ~30s
      │
      └──► Render detects change → rebuilds backend → live in ~2m
```

No manual steps needed after initial setup!

---

## 🧪 Test the Deployment

After deploying, verify everything works:

1. **Open the frontend URL** in your browser
2. **Create a room** — check that the lobby loads (backend is working)
3. **Open a second tab/phone** → Join the room with the Room ID
4. **Start the game** — verify both players see the game screen
5. **Test voice chat** — verify LiveKit connects
6. **Test disconnect** — close one tab, verify the other player gets notified

---

## 💰 Cost Breakdown

| Service | Free Tier Limit | Paid Tier |
|---------|-----------------|-----------|
| **Vercel** | 100 GB bandwidth/month | $20/mo (Pro) |
| **Render** | Free forever (sleeps after 15m) | $7/mo |
| **Neon** | 0.5 GB storage, 100 hrs compute | $19/mo (Launch) |
| **LiveKit** | 50 GB bandwidth/month | Usage-based |

**Total for small-scale launch: $0 – $5/month** 🎉

---

## 🛑 Common Deployment Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| WebSocket connection fails | CORS not configured | Add Vercel domain to `cors.origin` in `server/index.js` |
| `prisma: command not found` | Missing build step | Set Render build command to `npm install && npx prisma generate` |
| Voice chat not connecting | LiveKit env vars missing | Double-check Render environment variables |
| Frontend shows blank page | Wrong build output dir | Ensure Vercel output is set to `dist` |
| Socket connects then drops | Render idle timeout | Upgrade to paid tier or accept 30s wake-up time |
| `Mixed Content` error | HTTP backend + HTTPS frontend | Render auto-provides HTTPS — ensure URL uses `https://` |

---

## 📁 Final File Structure for Deployment

```
find-my-spy/
├── .gitignore              # Excludes node_modules, .env, dist
├── .env                    # Local dev (VITE_SERVER_URL=http://localhost:3001)
├── .env.production         # Production (VITE_SERVER_URL=https://your-render-url)
├── package.json            # Frontend deps
├── vite.config.js
├── index.html
├── src/                    # React app
│   ├── App.jsx
│   ├── services/socket.js  # Updated with env-based URL
│   └── ...
│
└── server/                 # Deployed separately on Render
    ├── .env                # NOT committed — set in Render dashboard
    ├── package.json
    ├── index.js
    └── prisma/
        └── schema.prisma
```

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render with env vars
- [ ] `src/services/socket.js` updated to use `VITE_SERVER_URL`
- [ ] `.env.production` created with Render URL
- [ ] Frontend deployed on Vercel with `VITE_SERVER_URL` env var
- [ ] CORS updated in `server/index.js` with Vercel domain
- [ ] Tested: room creation, joining, game start, voice chat, disconnect
- [ ] (Optional) Custom domain configured
