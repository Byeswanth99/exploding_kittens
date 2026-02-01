# ✅ Deployment Checklist - Exploding Kittens

Use this checklist before and after deploying to Render.

---

## 📋 Pre-Deployment Checks

### Code Quality

- [x] **TypeScript dependencies in correct place**
  - All `@types/*` and `typescript` moved to `dependencies`
  - Only `ts-node-dev` in `devDependencies`

- [x] **Production logger implemented**
  - `server/src/utils/logger.ts` exists
  - Supports `LOG_LEVEL` environment variable
  - Server uses logger instead of console.log

- [x] **Production CORS configured**
  - Server checks `NODE_ENV` for production mode
  - Uses `CORS_ORIGIN` environment variable
  - Fallback to localhost for development

- [x] **Monitoring endpoints ready**
  - `/health` endpoint returns status
  - `/stats` endpoint returns memory and metrics

### Local Testing

- [ ] **Backend builds successfully**
  ```bash
  cd server
  npm install
  npm run build
  # Should create dist/ folder with no errors
  ```

- [ ] **Frontend builds successfully**
  ```bash
  cd client
  npm install
  npm run build
  # Should create dist/ folder with no errors
  ```

- [ ] **Backend starts in production mode**
  ```bash
  cd server
  LOG_LEVEL=error NODE_ENV=production npm start
  # Should start without errors
  ```

- [ ] **Health endpoint works**
  ```bash
  curl http://localhost:3001/health
  # Should return {"status":"ok",...}
  ```

- [ ] **Stats endpoint works**
  ```bash
  curl http://localhost:3001/stats
  # Should return memory and metrics
  ```

### Git & GitHub

- [ ] **All changes committed**
  ```bash
  git status
  # Should show "working tree clean"
  ```

- [ ] **Pushed to GitHub**
  ```bash
  git push origin master
  # Should push successfully
  ```

- [ ] **Repository is public** (or Render has access)

### Documentation

- [x] **render.yaml** exists in root
- [x] **RENDER_DEPLOYMENT.md** created
- [x] **PRODUCTION_GUIDE.md** created
- [x] **DEPLOY_CHECKLIST.md** created (this file!)

---

## 🚀 Deployment Steps

### Step 1: Backend Deployment

- [ ] **Create backend service on Render**
  - Name: `exploding-kittens-server`
  - Type: Web Service
  - Root Directory: `server`
  - Build Command: `npm install && npm run build`
  - Start Command: `npm start`

- [ ] **Set backend environment variables**
  ```
  LOG_LEVEL = error
  NODE_ENV = production
  ```

- [ ] **Wait for backend deployment** (2-3 minutes)

- [ ] **Copy backend URL**
  - Example: `https://exploding-kittens-server.onrender.com`

### Step 2: Frontend Deployment

- [ ] **Create frontend service on Render**
  - Name: `exploding-kittens-client`
  - Type: Static Site
  - Root Directory: `client`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`

- [ ] **Set frontend environment variable**
  ```
  VITE_SOCKET_URL = <YOUR_BACKEND_URL>
  ```
  Replace `<YOUR_BACKEND_URL>` with actual backend URL!

- [ ] **Wait for frontend deployment** (2-3 minutes)

- [ ] **Copy frontend URL**
  - Example: `https://exploding-kittens-client.onrender.com`

### Step 3: Configure CORS

- [ ] **Add CORS_ORIGIN to backend**
  - Go to backend service → Environment tab
  - Add: `CORS_ORIGIN = <YOUR_FRONTEND_URL>`
  - Replace `<YOUR_FRONTEND_URL>` with actual frontend URL!

- [ ] **Wait for backend redeploy** (2 minutes)

---

## ✅ Post-Deployment Verification

### Backend Health

- [ ] **Health endpoint responds**
  ```bash
  curl https://your-backend.onrender.com/health
  ```
  Should return:
  ```json
  {
    "status": "ok",
    "activeRooms": 0,
    "timestamp": "..."
  }
  ```

- [ ] **Stats endpoint responds**
  ```bash
  curl https://your-backend.onrender.com/stats
  ```
  Should return memory, rooms, clients data

- [ ] **Backend logs show startup**
  - Check Render dashboard → Logs
  - Should see: "Exploding Kittens Server running on port 3001"
  - Should see: "Log level: error"
  - Should see: "CORS: Production mode"

### Frontend Connectivity

- [ ] **Frontend loads**
  - Open `https://your-frontend.onrender.com`
  - Should load without errors

- [ ] **No CORS errors**
  - Open browser console (F12)
  - Should NOT see CORS errors
  - Socket should connect successfully

- [ ] **Socket connection works**
  - Browser console should show: "Connected to server"

### Game Functionality

- [ ] **Can create room**
  - Click "Create New Game"
  - Enter player name
  - Room should be created with 6-digit code

- [ ] **Can join room**
  - Open in second browser/incognito
  - Click "Join Existing Game"
  - Enter room code
  - Should join successfully

- [ ] **Can play game**
  - Start game with 2+ players
  - Draw cards, play action cards
  - Game should work normally

- [ ] **Game ends properly**
  - Play until someone wins/loses
  - Game should show winner
  - Room should clean up after 30 minutes

### Performance

- [ ] **Check initial memory usage**
  ```bash
  curl https://your-backend.onrender.com/stats
  ```
  - `heapUsed` should be ~40-60MB

- [ ] **Play 5 games and check memory**
  - Create and play 5 complete games
  - Check `/stats` endpoint
  - Memory should stay < 100MB

- [ ] **Check cleanup is working**
  - Wait 35 minutes after a game ends
  - Check `/stats` endpoint
  - `activeRooms` should decrease

### Cold Start Test

- [ ] **Test cold start behavior**
  - Wait 20 minutes without any activity
  - Visit frontend URL
  - Backend should wake up in ~30-60 seconds
  - Game should work normally after wake-up

---

## 🔒 Security Verification

- [ ] **CORS is enforced**
  - Try accessing backend from different domain
  - Should be blocked by CORS policy

- [ ] **No sensitive data in logs**
  - Check Render logs
  - Should only see error logs (LOG_LEVEL=error)

- [ ] **HTTPS enabled**
  - Both URLs should use `https://`
  - Browser should show secure lock icon

---

## 📊 Monitoring Setup (Optional but Recommended)

- [ ] **Bookmark monitoring URLs**
  - Health: `https://your-backend.onrender.com/health`
  - Stats: `https://your-backend.onrender.com/stats`

- [ ] **Set up uptime monitoring** (optional)
  - Use [UptimeRobot](https://uptimerobot.com) (free)
  - Monitor `/health` endpoint every 5 minutes
  - Get alerts if server goes down

- [ ] **Set up status page** (optional)
  - Use [StatusPage.io](https://statuspage.io) (free tier)
  - Show uptime to players

---

## 🚨 Common Issues & Solutions

### Issue: Build fails on Render

**Symptoms:**
- "Build failed" error
- "Module not found" errors

**Solutions:**
- [ ] Check all dependencies are in `dependencies` (not `devDependencies`)
- [ ] Verify `package.json` syntax is correct
- [ ] Check Render build logs for specific error
- [ ] Test build locally first

---

### Issue: Backend starts but crashes

**Symptoms:**
- Logs show startup then crash
- Health endpoint not responding

**Solutions:**
- [ ] Check Render logs for error messages
- [ ] Verify PORT environment variable (should auto-set)
- [ ] Test with `NODE_ENV=production` locally
- [ ] Check for TypeScript compilation errors

---

### Issue: CORS errors in browser

**Symptoms:**
- "blocked by CORS policy" in console
- Socket connection fails

**Solutions:**
- [ ] Verify `CORS_ORIGIN` is set to frontend URL
- [ ] Check `NODE_ENV=production` is set
- [ ] Make sure frontend URL is exactly correct (no trailing slash)
- [ ] Wait for backend redeploy after setting CORS_ORIGIN

---

### Issue: Frontend blank page

**Symptoms:**
- White screen
- No errors in console

**Solutions:**
- [ ] Check `VITE_SOCKET_URL` is set correctly
- [ ] Verify backend URL is accessible
- [ ] Check frontend build logs for errors
- [ ] Clear browser cache and hard refresh

---

### Issue: Players can't join room

**Symptoms:**
- "Room not found" error
- Connection timeout

**Solutions:**
- [ ] Check backend is awake (visit `/health`)
- [ ] Verify room code is correct
- [ ] Check backend logs for errors
- [ ] Wait 60 seconds if backend is cold starting

---

## 💰 Cost Verification

After deployment, verify you're on free tier:

- [ ] **Check Render dashboard**
  - Both services should show "Free" plan
  - No charges on billing page

- [ ] **Verify usage**
  - Backend: < 750 hours/month
  - Storage: Logs auto-rotate (free)
  - Bandwidth: Should be minimal

**Expected Cost: $0/month** for typical usage! ✅

---

## 🎉 Deployment Complete!

Once all checks pass:

- ✅ Backend deployed and healthy
- ✅ Frontend deployed and accessible
- ✅ CORS configured correctly
- ✅ Game functionality verified
- ✅ Memory cleanup working
- ✅ Security measures in place

### Share Your Game!

Send this link to friends:
```
https://exploding-kittens-client.onrender.com
```

### Useful Commands

```bash
# Check backend health
curl https://your-backend.onrender.com/health

# Check backend stats
curl https://your-backend.onrender.com/stats

# View logs (on Render dashboard)
# Backend: Click service → Logs tab

# Redeploy
git push origin master
# Render auto-deploys!
```

---

## 📚 Additional Resources

- `RENDER_DEPLOYMENT.md` - Detailed deployment steps
- `PRODUCTION_GUIDE.md` - Monitoring and troubleshooting
- `README.md` - Game rules and setup

**Your game is live! Have fun!** 💣🐱🎉
