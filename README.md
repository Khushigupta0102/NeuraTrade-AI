# NeuraTrade AI 🚀 — Next-Gen AI-Powered Crypto Trading Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-ML-FF6F00?style=flat-square&logo=tensorflow)](https://www.tensorflow.org/js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**NeuraTrade AI** is a modern, client-side cryptocurrency market intelligence and trading bot dashboard. It combines real-time multi-source market data, on-device machine learning price forecasting, algorithmic trading signals, automated price alerting, and an intelligent financial trading assistant.

---

## ✨ Features

- **📊 Real-Time Market Overview & Pulse**
  - Live cryptocurrency prices, 24h volume, price changes, and circulating market caps.
  - Multi-provider fallback data feeds (CoinGecko & DIA Oracles) for maximum reliability and uptime.
  - Global crypto metrics: BTC Dominance, Total Market Cap, and Market Sentiment indices.

- **🤖 TensorFlow.js On-Device Price Predictions**
  - Client-side neural network models running directly in your browser.
  - Predicts near-term price trajectories with confidence intervals without sending data to external ML servers.

- **⚡ Quantitative Trading Signals**
  - Real-time technical indicators computed in JavaScript:
    - **RSI (Relative Strength Index)** with dynamic overbought/oversold boundaries.
    - **MACD (Moving Average Convergence Divergence)** with signal and histogram crossovers.
    - **Moving Averages (SMA & EMA)** for trend validation.
  - Automated signal generator producing `STRONG BUY`, `BUY`, `NEUTRAL`, `SELL`, or `STRONG SELL` ratings.

- **💬 AI Crypto Trading Assistant & Sentiment Analyzer**
  - Integrated AI chatbot fine-tuned for crypto market inquiries, technical analysis explanations, and strategy queries.
  - Real-time sentiment analysis mapping news and user queries to market mood indicators.

- **💼 Portfolio & Trade Simulator**
  - Interactive portfolio tracker with live PnL calculations, balance breakdown, and dynamic asset allocation charts.
  - Simulated paper trading to test strategies without financial risk.

- **🔔 Smart Price Alerts**
  - Set custom target price triggers (`Above` / `Below`).
  - Native browser desktop notifications when targets are breached.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS design system
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Machine Learning**: [@tensorflow/tfjs](https://www.tensorflow.org/js)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Motion & UI**: [Framer Motion](https://www.framer.com/motion/) & [React Hot Toast](https://react-hot-toast.com/)
- **Data APIs**: CoinGecko API & DIA Data API

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher recommended) and **npm** installed on your system.

```bash
node -v
npm -v
```

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Khushigupta0102/NeuraTrade-AI.git
   cd NeuraTrade-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:5173](http://localhost:5173) to explore the application.

---

## 📂 Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and SVG icons
│   ├── components/         # Reusable UI components (Charts, Tables, Modals, Topbar, Sidebar)
│   ├── hooks/              # Custom React hooks (Data fetching, ML predictions, signals)
│   ├── pages/              # Application views
│   │   ├── Dashboard.jsx   # Overview & market pulse
│   │   ├── Markets.jsx     # Deep market scanner & charts
│   │   ├── Portfolio.jsx   # Asset management & allocation
│   │   ├── Signals.jsx     # Algorithmic trading signals
│   │   ├── ChatBot.jsx     # AI Trading chatbot
│   │   └── Settings.jsx    # User preferences & API configurations
│   ├── store/              # Zustand global application state
│   ├── utils/              # Technical indicators, formatters, and API helpers
│   ├── App.jsx             # Main application layout & routing
│   ├── index.css           # Global Tailwind & design token styles
│   └── main.jsx            # React root entry point
├── package.json            # Project manifest & dependencies
└── vite.config.js          # Vite configuration
```

---

## ⌨️ Keyboard Shortcuts

- <kbd>/</kbd> — Quick focus market search
- <kbd>D</kbd> — Navigate to Dashboard
- <kbd>M</kbd> — Navigate to Markets
- <kbd>C</kbd> — Navigate to AI Chatbot

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
