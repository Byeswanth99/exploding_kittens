# 🚀 Setup Instructions for Exploding Kittens

Complete guide to get the game running on your machine.

---

## Prerequisites Installation

### 1. Install Node.js and npm

You need Node.js (v18 or higher) to run this application.

**For macOS:**
```bash
# Using Homebrew (recommended)
brew install node

# Or download from https://nodejs.org/
```

**For Windows:**
- Download the installer from https://nodejs.org/
- Run the installer and follow the prompts

**For Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

### 2. Verify Installation

After installing Node.js, verify it's working:

```bash
node --version   # Should show v18.x.x or higher
npm --version    # Should show 9.x.x or higher
```

---

## 📦 Project Setup

### Step 1: Install Server Dependencies

```bash
cd /Users/byeswanth/personal/exploding_kittens/server
npm install
```

This will install:
- express (web server)
- socket.io (real-time communication)
- cors (cross-origin support)
- uuid (unique ID generation)
- typescript & dev dependencies

### Step 2: Install Client Dependencies

```bash
cd /Users/byeswanth/personal/exploding_kittens/client
npm install
```

This will install:
- react & react-dom (UI framework)
- socket.io-client (real-time communication)
- vite (build tool)
- tailwindcss (styling)
- typescript & dev dependencies

---

## 🎮 Running the Game

### Option 1: Run Both Server and Client (Recommended)

**Terminal 1 - Start Server:**
```bash
cd /Users/byeswanth/personal/exploding_kittens/server
npm run dev
```
Server will run on `http://localhost:3001`

**Terminal 2 - Start Client:**
```bash
cd /Users/byeswanth/personal/exploding_kittens/client
npm run dev
```
Client will run on `http://localhost:3000`

### Option 2: Quick Start Script

Create a script to run both:

**For macOS/Linux, create `start.sh`:**
```bash
#!/bin/bash
cd server && npm run dev &
cd client && npm run dev
```

Then run:
```bash
chmod +x start.sh
./start.sh
```

---

## 🌐 Playing with Friends on Your Network

### 1. Find Your Local IP Address

**macOS:**
```bash
ipconfig getifaddr en0
# Or check System Preferences > Network
```

**Windows:**
```bash
ipconfig
# Look for IPv4 Address under your active network
```

**Linux:**
```bash
hostname -I | awk '{print $1}'
```

### 2. Share the URL

If your IP is `192.168.1.100`, share this with friends:
```
http://192.168.1.100:3000
```

**Important:** They must be on the same WiFi network!

### 3. Firewall Settings

If friends can't connect, you may need to allow ports 3000 and 3001:

**macOS:**
- System Preferences > Security & Privacy > Firewall > Firewall Options
- Add Node to allowed apps

**Windows:**
- Windows Defender Firewall > Allow an app
- Add Node.js

**Linux:**
```bash
sudo ufw allow 3000
sudo ufw allow 3001
```

---

## 🌍 Playing Online (Deployment)

### Deploy Server (Backend)

**Option 1: Railway.app**
1. Sign up at railway.app
2. Connect your GitHub repo
3. Set start command: `cd server && npm start`
4. Note the deployed URL

**Option 2: Render.com**
1. Sign up at render.com
2. Create new Web Service
3. Set build command: `cd server && npm install && npm run build`
4. Set start command: `cd server && npm start`

### Deploy Client (Frontend)

**Option 1: Vercel**
1. Sign up at vercel.com
2. Import your project
3. Set root directory to `client`
4. Add environment variable: `VITE_SOCKET_URL=<your-server-url>`
5. Deploy!

**Option 2: Netlify**
1. Sign up at netlify.com
2. Drag and drop the `client/dist` folder after running `npm run build`
3. Set environment variable for server URL

---

## 🔧 Troubleshooting

### "Cannot connect to server"

1. Make sure server is running (Terminal 1)
2. Check server is on port 3001: `http://localhost:3001/health`
3. Check client is trying to connect to correct URL

### "npm: command not found"

Node.js is not installed or not in PATH. Follow Step 1 above.

### "Port already in use"

Another application is using port 3000 or 3001:

```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Client can't connect to server

Update the socket URL in client:

Create `/Users/byeswanth/personal/exploding_kittens/client/.env`:
```
VITE_SOCKET_URL=http://localhost:3001
```

Then restart the client.

### "Module not found" errors

Dependencies not installed properly:

```bash
# Reinstall server dependencies
cd server
rm -rf node_modules package-lock.json
npm install

# Reinstall client dependencies
cd ../client
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

Make sure TypeScript is installed:

```bash
# Server
cd server
npm install -D typescript ts-node-dev

# Client
cd ../client
npm install -D typescript
```

---

## 📱 Mobile Testing

To test on your phone:
1. Make sure phone is on same WiFi as computer
2. Find your computer's IP (see above)
3. Open `http://YOUR_IP:3000` on phone browser
4. Create or join a game!

---

## 🎯 Next Steps

Once everything is running:

1. Open `http://localhost:3000` in your browser
2. Enter your name and click "Create New Game"
3. Share the room code with friends
4. Friends can join at the same URL by clicking "Join Game"
5. Host starts the game when everyone is ready (minimum 2 players)
6. Play and have fun! 💣🐱

---

## 📝 Development Commands

### Server
```bash
npm run dev      # Run in development mode (auto-reload)
npm run build    # Compile TypeScript to JavaScript
npm start        # Run compiled code
```

### Client
```bash
npm run dev      # Run development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🐛 Common Issues

### Issue: Cards not displaying
**Solution:** Clear browser cache and reload

### Issue: Game state not updating
**Solution:** Check browser console for errors, refresh page

### Issue: Disconnection on mobile
**Solution:** Keep app in foreground, check WiFi connection

### Issue: Room code not working
**Solution:** Room codes are case-sensitive, try again or create new room

---

## 📞 Need Help?

If you encounter issues:
1. Check both terminals for error messages
2. Verify Node.js version is 18+
3. Make sure ports 3000 and 3001 are not blocked
4. Try restarting both server and client
5. Check your firewall settings

---

## 🎨 Customization

### Change Server Port
Edit `server/src/server.ts`:
```typescript
const PORT = process.env.PORT || 3001; // Change 3001 to desired port
```

### Change Client Port
Edit `client/vite.config.ts`:
```typescript
server: {
  port: 3000, // Change to desired port
}
```

### Update Colors
Edit `client/tailwind.config.js`:
```javascript
colors: {
  primary: '#FF6B6B',    // Change these
  secondary: '#4ECDC4',
  accent: '#FFE66D',
}
```

---

**Enjoy playing Exploding Kittens! 💣🎮**
