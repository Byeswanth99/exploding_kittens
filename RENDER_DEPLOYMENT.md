# 🚀 Deploy Exploding Kittens to Render - Complete Guide

## Prerequisites
- [ ] GitHub account
- [ ] Render account (sign up at [render.com](https://render.com))
- [ ] Your code pushed to GitHub

---

## Step 1: Push Your Code to GitHub

```bash
# Make sure you're in the project root
cd /Users/byeswanth/personal/exploding_kittens

# Check git status
git status

# Add all files
git add .

# Commit
git commit -m "Production ready - ready for Render deployment"

# Push to GitHub
git push origin master
```

If you don't have a GitHub repo yet:
```bash
# Create a new repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/exploding_kittens.git
git branch -M master
git push -u origin master
```

---

## Step 2: Deploy Backend on Render

### 2.1 Create Backend Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

**Settings:**
```
Name: exploding-kittens-server
Region: Singapore
Branch: master
Root Directory: server
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

**Environment Variables:**
Click "Add Environment Variable" for each:
```
LOG_LEVEL = error
NODE_ENV = production
```

**Instance Type:**
- Select **"Free"**

5. Click **"Create Web Service"**
6. Wait for deployment (takes 2-3 minutes)
7. **COPY YOUR BACKEND URL** (looks like: `https://exploding-kittens-server.onrender.com`)

---

## Step 3: Deploy Frontend on Render

### 3.1 Create Frontend Service

1. Go back to Render dashboard
2. Click **"New +"** → **"Static Site"**
3. Select the same GitHub repository
4. Configure the service:

**Settings:**
```
Name: exploding-kittens-client
Region: Singapore
Branch: master
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: dist
```

**Environment Variables:**
Click "Add Environment Variable":
```
VITE_SOCKET_URL = https://exploding-kittens-server.onrender.com
```
**IMPORTANT:** Replace with YOUR actual backend URL from Step 2!

5. Click **"Create Static Site"**
6. Wait for deployment (takes 2-3 minutes)
7. **COPY YOUR FRONTEND URL** (looks like: `https://exploding-kittens-client.onrender.com`)

---

## Step 4: Update CORS (Important!)

Your backend needs to allow your frontend domain.

1. Go to your backend service on Render dashboard
2. Click **"Environment"** tab
3. Add new environment variable:
```
CORS_ORIGIN = https://exploding-kittens-client.onrender.com
```
**IMPORTANT:** Replace with YOUR actual frontend URL!

4. Save changes (this will redeploy your backend - takes ~2 minutes)

---

## Step 5: Test Your Deployment

1. Open your frontend URL: `https://exploding-kittens-client.onrender.com`
2. Click "Create New Game"
3. Enter your name
4. If it works, you're done! 🎉

### Check Backend Health:
```
https://exploding-kittens-server.onrender.com/health
```
Should return: `{"status":"ok","activeRooms":0,"timestamp":"..."}`

### Check Backend Stats:
```
https://exploding-kittens-server.onrender.com/stats
```
Should show active rooms, memory usage, connected clients, etc.

---

## 🎮 Share With Your Friends!

Send them this link:
```
https://exploding-kittens-client.onrender.com
```

They can:
1. Click "Join Existing Game"
2. Enter their name
3. Enter the 6-digit room code you share

---

## ⚠️ Important Notes

### Cold Starts (Free Tier Limitation)
- Your backend **sleeps after 15 minutes of inactivity**
- First person to visit after sleep: **30-60 second wait**
- After that, everyone connects instantly
- **During gameplay:** No interruptions (players keep it alive)

**Pro tip:** Open the site 1 minute before your friends join to "warm it up"

### Free Tier Limits
- **750 hours/month** per service (plenty for your use!)
- **Bandwidth:** 100GB/month (more than enough for gameplay)
- **Automatic SSL:** Your site gets `https://` for free
- **No cold starts needed during active gameplay**

---

## 🛠️ Troubleshooting

### "Cannot connect to server"
1. Check backend is running: Visit `https://YOUR-BACKEND-URL/health`
2. Check CORS is configured (Step 4)
3. Check `VITE_SOCKET_URL` in frontend env vars
4. Wait 60 seconds if backend is sleeping (cold start)

### Backend won't start
1. Check logs in Render dashboard
2. Make sure `npm run build` works locally
3. Verify all dependencies are in `package.json` (not devDependencies)

### Frontend shows blank page
1. Check browser console for errors (F12)
2. Verify `VITE_SOCKET_URL` is set correctly
3. Check if backend URL is accessible

### Players can't join
1. Make sure backend is awake (visit `/health`)
2. Check room code is correct (6 digits)
3. Verify both services are deployed and running

---

## 📊 Monitoring Your App

### Backend Logs
1. Go to Render dashboard
2. Click on "exploding-kittens-server"
3. Click "Logs" tab
4. Watch for errors or cleanup messages

### Memory & Performance
Visit: `https://YOUR-BACKEND-URL/stats`

You should see:
```json
{
  "activeRooms": 2,
  "connectedClients": 8,
  "memory": {
    "heapUsed": "45MB",
    "heapTotal": "60MB",
    "rss": "80MB"
  },
  "uptime": "120 minutes"
}
```

---

## 🔄 Making Updates

When you make code changes:

```bash
# Make your changes
git add .
git commit -m "Updated game logic"
git push

# Render auto-deploys! ✨
# Wait 2-3 minutes for deployment
```

Both services will automatically redeploy when you push to GitHub!

---

## 💰 Cost

**Total: $0/month** for typical gameplay (10-20 players, occasional games)

If you need to avoid cold starts (always on):
- Upgrade backend to **Starter plan: $7/month**
- Frontend stays free

---

## 🔐 Security Features

Your deployment includes:
- ✅ Production CORS (only your frontend can connect)
- ✅ Automatic HTTPS/SSL
- ✅ Environment-based configuration
- ✅ Configurable logging (minimal data exposure)

---

## 🎉 You're Done!

Your game is now live and shareable! Enjoy playing with your friends! 💣🐱

**Your URLs:**
- Frontend: `https://exploding-kittens-client.onrender.com`
- Backend: `https://exploding-kittens-server.onrender.com`

Share the frontend URL with your friends and start playing!

---

## 📞 Need Help?

Check these endpoints:
- `/health` - Server status
- `/stats` - Memory and performance metrics

See `PRODUCTION_GUIDE.md` for advanced monitoring and optimization tips.
