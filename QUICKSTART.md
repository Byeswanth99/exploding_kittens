# 🚀 Quick Start Guide

## Installation (One-time setup)

The npm installations are currently in progress. If they're still running, let them complete. If not, run:

```bash
# Terminal 1: Install server dependencies
cd /Users/byeswanth/personal/exploding_kittens/server
npm install

# Terminal 2: Install client dependencies  
cd /Users/byeswanth/personal/exploding_kittens/client
npm install
```

## Running the Game

Once installations complete:

### Terminal 1 - Start Server:
```bash
cd /Users/byeswanth/personal/exploding_kittens/server
npm run dev
```
✅ Server will run on `http://localhost:3001`

### Terminal 2 - Start Client:
```bash
cd /Users/byeswanth/personal/exploding_kittens/client
npm run dev
```
✅ Client will run on `http://localhost:3000`

## Play!

1. Open `http://localhost:3000` in your browser
2. Enter your name
3. Create a new game or join existing game with room code
4. Share room code with friends (they must be on same WiFi)
5. Host starts game when ready (min 2 players)
6. Have fun! 💣🐱

## Troubleshooting

If you get errors:
- Make sure both server and client npm installs completed successfully
- Check Node.js version: `node --version` (should be v18+)
- Restart both terminals
- See SETUP_INSTRUCTIONS.md for detailed troubleshooting

---

**Quick tip:** The game auto-configures deck size based on player count:
- 2-3 players: Small deck
- 4-7 players: Medium deck  
- 8-10 players: Full deck
