# Jump Gorby
Jump Gorby is a simple platformer game built on the Gorbagana chain, with GORBY tokens as rewards. Players can play, record scores, and interact with the Backpack wallet on the Gorbagana network (custom Solana RPC).

## Main Features
- Fun platformer with Gorby character
- Backpack wallet (Solana) integration
- Score storage on Gorbagana blockchain
- Leaderboard and modern UI

## Installation & Running

### 1. Prerequisites
- Node.js & npm (https://nodejs.org/)
- Browser with Backpack Wallet extension (https://backpack.app/)

### 2. Clone & Install
```bash
git clone https://github.com/edison-alpha/GorbyJump
cd GorbyJump
npm install
```

### 3. Run the Game
```bash
npm run dev
```
Open the game in your browser: [http://localhost:5000](http://localhost:5000)

## Gorbagana Chain Integration
- The game uses RPC endpoint: `https://rpc.gorbagana.wtf`
- Only Backpack wallet is supported (make sure the extension is active)
- Scores and game interactions can be recorded on the Gorbagana blockchain

## How to Play
1. Open the game in your browser
2. Click the "Connect Wallet" button to connect your Backpack Wallet
3. Play as Gorby, jump and avoid obstacles
4. Your highest score will be recorded on the leaderboard
5. If the wallet is connected, your score can be saved to the blockchain

### Keyboard Controls
- **Left Arrow (←) / A** : Move left
- **Right Arrow (→) / D** : Move right
- **Space / W / Up Arrow (↑)** : Jump
- **1 / 2** : Switch weapon
- **Esc** : Pause/Menu

## Project Structure
- `client/` : Game frontend (React + Vite)
- `server/` : Backend (optional, if any)
- `shared/` : Shared schema & utilities

## Notes
- Only Backpack Wallet is supported for now
- If the wallet is not detected, make sure the Backpack extension is installed and active
- For further development, modify files in `client/src/`


---

Enjoy playing Jump Gorby!
