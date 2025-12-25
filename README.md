# eAIP Morocco

Interactive Aeronautical Information Publication for Moroccan airports.

## Features

- 🗺️ Interactive map with all Moroccan airports
- 📊 Airport charts (SID, STAR, APP, GND, GEN)
- 📡 Frequencies and runway information
- 🌓 Dark/Light mode
- 🔍 Search by ICAO, IATA, name, or city

## Setup

### Backend
```bash
cd eAIP
npm install
cp .env.example .env  # Configure your environment
node server.js
```

### Frontend
```bash
cd eAIP/eaip-frontend
npm install
cp .env.example .env  # Configure API URL
npm start
```

### Download Charts
```bash
cd eAIP
node download-onda-charts.js
```

## Environment Variables

Copy `.env.example` to `.env` in both backend and frontend directories and adjust values for your environment.

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React, Leaflet
- **Data**: Airport database, ONDA charts

---
© 2025 IVAO Morocco
