# 🎮 OneSoul Idle RPG - Development Setup

## Quick Start (Windows)

### Method 1: One-Click Launch (Easiest)
1. **Double-click `start-dev.bat`** in the project folder
2. Script will automatically:
   - Pull latest changes from git
   - Start a local web server
   - Open the game in your browser

### Method 2: Manual Launch
```bash
cd C:\Users\durha\oneSoul_idle_RPG
git pull origin claude/access-game-feature-01HHFMH1D52sgs95PGD7VjWM

# Then start a server (choose one):
node server.js              # If you have Node.js
python -m http.server 8080  # If you have Python
```

Then open: `http://localhost:8080/index.html`

---

## Prerequisites

You need **ONE** of the following installed:

### Option A: Node.js (Recommended)
- **Download**: https://nodejs.org/
- **Why**: Faster, better for development
- **Check if installed**: `node --version`

### Option B: Python
- **Download**: https://www.python.org/downloads/
- **Why**: Simple, works well
- **Check if installed**: `python --version`

### Option C: VS Code Live Server Extension
- **Install VS Code**: https://code.visualstudio.com/
- **Install Extension**: Search "Live Server" in VS Code extensions
- **Usage**: Right-click `index.html` → "Open with Live Server"

---

## After Making Changes

### Workflow
1. I make code changes and push to branch
2. You run `start-dev.bat` (pulls changes automatically)
3. Browser opens with latest version
4. **Hard refresh** browser: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)

### Clear Browser Cache (if needed)
- **Chrome/Edge**: F12 → Network tab → Check "Disable cache"
- **Firefox**: F12 → Network tab → Check "Disable cache"
- **Or**: Press `Ctrl + Shift + Delete` → Clear cached images and files

---

## Troubleshooting

### "Python/Node not found"
- Install Node.js or Python (see Prerequisites above)
- After installing, close and reopen your terminal
- Run `start-dev.bat` again

### "Cannot see latest changes"
1. Make sure you pulled latest: `git pull origin claude/access-game-feature-01HHFMH1D52sgs95PGD7VjWM`
2. Hard refresh browser: `Ctrl + F5`
3. Clear browser cache (F12 → Network → Disable cache)
4. Check console for errors (F12 → Console tab)

### "Port 8080 already in use"
- Close any other dev servers running
- Or use a different port: `node server.js 3000`

### Game features not working
- Make sure you're using `http://localhost:8080` (not `file://`)
- Check browser console (F12) for errors
- Try clearing localStorage: F12 → Application → Local Storage → Clear

---

## Current Branch

`claude/access-game-feature-01HHFMH1D52sgs95PGD7VjWM`

All development happens on this branch. Changes are automatically merged when you run `start-dev.bat`.

---

## What's Changed Recently

### Latest Updates (Session Summary)
✅ **Removed legacy gameEngine.js** - Game now uses modern modular architecture
✅ **Added `start-dev.bat`** - One-click development launcher
✅ **Added `server.js`** - Node.js development server
✅ **Region Selection** - Click regions to travel/navigate
✅ **Navigation UI** - Always-visible status bars for endurance, navigation, rest
✅ **Starting Region** - `region_-3_-4 "The Scar"` unlocked by default
✅ **Nav Resources** - Added Pinewood and Light Rations for exploration

### Expected Features
- 🗺️ World map with hexagonal regions
- 📍 Starting region (center) should be unlocked
- 🧭 Click region → Modal with navigation buttons
- 💪 Endurance bar (always visible)
- ⏱️ Navigation action bar (always visible)
- 🔥 Rest resources bar (always visible)
- 🍖 Food + 🪵 Logs consumed every 6 seconds while navigating
