# 💣 Exploding Kittens - Multiplayer Web Game

A fully-featured, mobile-first multiplayer implementation of the popular card game **Exploding Kittens**!

## 🎮 Features

- **2-10 Player Support** - Dynamic deck configuration based on player count
- **Mobile-First Design** - Optimized for phones, tablets, and desktops
- **Real-time Multiplayer** - Powered by Socket.io
- **15 Card Types** - Base game + Alter the Future + Feral Cats
- **Beautiful UI** - Cartoony design with smooth animations
- **Safe Reconnection** - Players can rejoin if disconnected
- **Spectator Mode** - Watch the game after elimination

## 🃏 Card Types

### Base Game (13 types)
- 💣 **Exploding Kitten** - Draw this and you explode!
- 🛡️ **Defuse** - Neutralize an Exploding Kitten
- 🚫 **Nope** - Cancel any action
- ⚔️ **Attack** - Force next player to take 2 turns
- ⏭️ **Skip** - End turn without drawing
- 🤝 **Favor** - Take a card from another player
- 🔀 **Shuffle** - Shuffle the deck
- 🔮 **See the Future** - View top 3 cards
- 🌮🥔🌈🧔🍉 **Cat Cards** (5 types) - Play combos for special effects

### Expansion Cards (2 types)
- ✨ **Alter the Future** - View AND rearrange top 3 cards
- 🐾 **Feral Cat** - Wild card for cat combos

## 🏗️ Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Socket.io for real-time communication
- UUID for card generation

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Socket.io Client

## 📁 Project Structure

```
exploding_kittens/
├── server/
│   ├── src/
│   │   ├── game/
│   │   │   ├── DeckGenerator.ts    # Dynamic deck creation
│   │   │   ├── GameRoom.ts         # Game logic
│   │   │   └── RoomManager.ts      # Room management
│   │   ├── socket/
│   │   │   └── socketHandlers.ts   # Socket events
│   │   ├── types/
│   │   │   └── game.ts             # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── cardDefinitions.ts  # Card catalog
│   │   └── server.ts               # Main server
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Lobby.tsx           # Create/join game
│   │   │   ├── WaitingRoom.tsx     # Pre-game lobby
│   │   │   ├── GameBoard.tsx       # Main game view
│   │   │   ├── CardComponent.tsx   # Card display
│   │   │   ├── PlayerHand.tsx      # Your cards
│   │   │   ├── OpponentView.tsx    # Other players
│   │   │   ├── GameLog.tsx         # Action history
│   │   │   ├── DefusePlacement.tsx # Defuse modal
│   │   │   └── AlterFutureModal.tsx
│   │   ├── hooks/
│   │   │   └── useSocket.ts        # Socket connection
│   │   ├── types/
│   │   │   └── game.ts             # TypeScript types
│   │   ├── utils/
│   │   │   └── cardStyles.ts       # Card styling
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## 🚀 Quick Start

See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed setup.

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Start server (Terminal 1)
cd server && npm run dev

# Start client (Terminal 2)
cd client && npm run dev
```

Then open `http://localhost:3000` in your browser!

## 🎯 How to Play

1. **Create or Join a Game** - Enter your name and create/join a room
2. **Wait for Players** - Need 2-10 players (host can start with 2+)
3. **Play Cards** - On your turn, play action cards or draw
4. **Avoid Exploding** - Don't draw an Exploding Kitten without a Defuse!
5. **Last Standing Wins** - Eliminate all opponents to win

### Cat Card Combos
- **2 of a Kind** - Steal a random card
- **3 of a Kind** - Ask for a specific card
- **5 Different Cats** - Take from discard pile

## 🌐 Multiplayer Setup

### Local Network
Share your local IP with friends on the same WiFi:
```bash
# Find your IP
ipconfig getifaddr en0  # macOS
ipconfig               # Windows
hostname -I            # Linux

# Friends connect to: http://YOUR_IP:3000
```

### Online Deployment
Deploy server and client to hosting services like:
- **Server**: Heroku, Railway, Render
- **Client**: Vercel, Netlify

## 📱 Mobile Support

The game is fully responsive and touch-optimized:
- Horizontal card scrolling
- Large tap targets
- Swipeable action log
- Portrait and landscape modes

## 🎨 Design Features

- Gradient color schemes per card type
- Smooth animations and transitions
- Visual feedback for all actions
- Explosion effects
- Card hover tooltips (desktop)
- Connection status indicators

## 🔄 Game Flow

```
Lobby → Waiting Room → Game Start
  ↓
Players draw 7 cards + 1 Defuse
  ↓
Turn-based gameplay:
  1. Play action cards (optional)
  2. Draw a card (mandatory)
  3. Defuse if Exploding Kitten
  4. Next player's turn
  ↓
Last player standing wins!
```

## 📝 License

MIT

## 🙏 Credits

Based on the original Exploding Kittens card game by The Oatmeal.

---

**Enjoy playing! 💣🐱**
