# 🪙 CryptoWiz

> A cryptocurrency market dashboard: browse the top 100 coins, track up to five of them in live charts, and get an AI-generated buy / hold / avoid verdict.  
> Built with **React 19**, **TypeScript** & **Vite**, as the second course project of the Full Stack Web Developer program (John Bryce).

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-764ABC?style=flat&logo=redux&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Hosting-FFCA28?style=flat&logo=firebase&logoColor=black)
![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-412991?style=flat&logo=openai&logoColor=white)
[![Live Demo](https://img.shields.io/badge/Live-Demo-0d6efd)](https://cryptowiz-cfe40.web.app)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Home** | Top 100 coins by market cap, instant search by name or symbol, and a "More Info" panel with prices in USD / EUR / ILS |
| **Tracking** | Track up to five coins. Adding a sixth opens a dialog to choose which tracked coin to replace |
| **Live reports** | All tracked coins on one log-scale chart, or a single coin in focus. Intervals from live (1s) up to one month, drawn as a line or as candlesticks |
| **AI recommendation** | A structured verdict with strengths, risks and a short explanation, generated from the coin's real market data |
| **Themes** | Light and dark theme |
| **Hebrew RTL** | Hebrew right-to-left interface and a dedicated 404 page |
| **Persistence** | Tracked coins and theme are saved in `localStorage` and restored on reload |
| **About** | Project and author details |

---

## 🖥️ Demo

**Live:** https://cryptowiz-cfe40.web.app

---

## 🏗️ Architecture

```
src/
├── components/   # UI building blocks (coins, common, layout, reports)
├── constants/    # Static option lists
├── hooks/        # Thin hooks over the services
├── models/       # TypeScript models
├── pages/        # Route-level pages
├── routes/       # Routing configuration
├── services/     # API calls and business logic (one class per provider)
├── store/        # Redux store and slices
├── styles/       # Global theme variables
└── utils/        # AppConfig class and formatting helpers
```

**Separation of concerns** — components render, hooks stay thin, and all business logic and API calls live in services, one class per provider.

---

## 📡 Data Sources

| Feature | Primary | Fallback |
|---------|---------|----------|
| Coin list, More Info, AI page data | CoinGecko | None (required) |
| Live prices | CryptoCompare (if a key is set) | Kraken, then CoinPaprika |
| Historical line / candlesticks | Kraken OHLC | CoinGecko OHLC (coins not listed on Kraken, for example LEO Token) |
| AI analysis | OpenAI `gpt-4o-mini` | None |

CoinGecko is intentionally not used for live polling, which keeps its free monthly quota available for the pages that depend on it.

---

## 🔧 Technical Highlights

- **Provider fallbacks** — live prices and history degrade gracefully across several providers
- **State management** — Redux Toolkit store with slices
- **Charts** — Recharts with log scale, live updates and candlesticks
- **Structured AI output** — the verdict is generated from real market data, not free text
- **Typed and separated** — a dedicated routing configuration and TypeScript models for the data
- **Scoped styling** — CSS Modules and global theme variables

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/SamuelSion/cryptowiz.git
cd cryptowiz

# Install
npm install

# Configure — add your own API keys
cp .env.example .env

# Run (opens the browser automatically)
npm start
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

### Environment variables

The real `.env` is git-ignored and must never be committed. Vite embeds `VITE_*` values at build time, so set them **before** running `npm run build`.

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_OPENAI_API_KEY` | Yes | AI recommendation page |
| `VITE_COINGECKO_API_KEY` | Yes | Free CoinGecko Demo key for the home page, More Info panel and AI page |
| `VITE_CRYPTOCOMPARE_API_KEY` | No | Enables true 1-second live prices. Without it, Kraken is used |

A CoinGecko Demo key is free and needs no credit card: [coingecko.com/en/api/pricing](https://www.coingecko.com/en/api/pricing).

> Keys in a client-side app end up in the built bundle. That is acceptable for a course project, but a production app should proxy these calls through a backend.

---

## ☁️ Deployment (Firebase Hosting)

```bash
npm run build
firebase deploy
```

---

## 👤 Author

**Samuel Sion** — [github.com/SamuelSion](https://github.com/SamuelSion)
