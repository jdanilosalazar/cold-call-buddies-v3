# Cold Call Buddies

A tiny always-on-top desktop widget that helps sales reps track their daily cold call quota — with a little animated pet that celebrates when you hit your goal.

Built with Electron. No database, no cloud, no accounts. Just a frameless window that lives in the corner of your screen.

---

## Features

- **One-click call logging** — hit `+ Call` every time you make a call
- **Daily quota tracking** — set any daily goal; progress bar fills as you go
- **Goal celebration** — your pet bounces on every call and throws a party when you hit quota (with a desktop notification)
- **7-day bar chart** — expand Stats to see your week at a glance
- **Streak counter** — tracks consecutive days you made at least one call
- **Week & month totals** — cumulative call counts per period
- **Best day ever** — personal record across all history
- **Always on top** — floats over other windows so it's always visible
- **Persistent data** — history saved locally to your OS user-data folder; survives restarts

---

## Screenshots

> Coming soon — drop your own screenshots in a `/screenshots` folder and link them here.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)

### Install & Run

```bash
git clone https://github.com/jdanilosalazar/cold-call-buddies-v3.git
cd cold-call-buddies-v3
npm install
npm start
```

### Windows (quick launch)

Double-click `launch.bat` — it installs dependencies if needed and starts the app.

---

## Usage

| Action | How |
|---|---|
| Log a call | Click **+ Call** |
| Set a new daily goal | Type a number in the goal field → press Enter or click **Set** |
| View weekly stats | Click **▾ Stats** to expand the panel |
| Reset today's count | Click **Reset** inside the stats panel |
| Close the app | Click the red dot in the top-right corner |

The widget is draggable by the title bar area — just click and drag it anywhere on your screen.

---

## Data Storage

Call history is saved to a local `data.json` file in your OS user-data directory:

| Platform | Path |
|---|---|
| Windows | `%APPDATA%\cold-call-buddies\data.json` |
| macOS | `~/Library/Application Support/cold-call-buddies/data.json` |
| Linux | `~/.config/cold-call-buddies/data.json` |

No data ever leaves your machine.

---

## Tech Stack

- [Electron](https://www.electronjs.org/) — desktop shell
- Vanilla JS / HTML / CSS — no frontend framework
- Node.js `fs` — local JSON persistence

---

## License

MIT
