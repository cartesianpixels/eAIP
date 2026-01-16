// airport-service.js
// Node.js service to fetch runway data from AirportDB.io and enrich airport data

const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const dotenv = require('dotenv');
const cors = require('cors');
const MISSING_AIRPORTS = require('../missing-airports.json');

dotenv.config();

const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Enable CORS for frontend dev servers
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Configuration
const AIRPORT_DB_TOKEN = process.env.AIRPORT_DB_TOKEN || 'YOUR_DEFAULT_TOKEN';
const AIRPORT_DB_URL = 'https://airportdb.io/api/v1/airport';

// Morocco (MA) and Southern Territories (EH) ICAO codes
const MOROCCAN_AIRPORTS = [
  'GMMN', 'GMMX', 'GMFF', 'GMTT', 'GMAD', 'GMME', 'GMFO', 'GMMZ', 'GMMI', 'GMMW',
  'GMTA', 'GMFK', 'GMAT', 'GMTN', 'GMMY', 'GMMD', 'GMFB', 'GMFM', 'GMMB', 'GMAG',
  'GMFI', 'GMSL', 'GMAZ', 'GMFA', 'GMMO', 'GMFZ', 'GMAA', 'GMMT',
  'GMML', 'GMMH', 'GMMA'
];

/**
 * Fetch single airport runway data from AirportDB.io or local fallback
 */
async function fetchAirportRunways(icaoCode) {
  icaoCode = icaoCode.toUpperCase();

  // Check cache first
  const cached = cache.get(icaoCode);
  if (cached) {
    console.log(`✓ Cache hit for ${icaoCode}`);
    return cached;
  }

  // Check local fallback
  if (MISSING_AIRPORTS[icaoCode]) {
    console.log(`📍 ${icaoCode} missing from API — using local fallback`);
    const fallback = MISSING_AIRPORTS[icaoCode];

    const runways = (fallback.runways || []).map(rwy => ({
      identifier: `${rwy.le_ident}/${rwy.he_ident}`,
      length_m: rwy.length_ft ? Math.round(rwy.length_ft * 0.3048) : null,
      length_ft: rwy.length_ft || null,
      width_m: rwy.width_ft ? Math.round(rwy.width_ft * 0.3048) : null,
      width_ft: rwy.width_ft || null,
      surface: rwy.surface || 'Unknown',
      lighting: rwy.lighted || false,
      closed: rwy.closed || false,
      le_ident: rwy.le_ident,
      he_ident: rwy.he_ident,
      le_heading: rwy.le_heading || null,
      he_heading: rwy.he_heading || null,
      le_elevation_ft: rwy.le_elevation_ft || null,
      he_elevation_ft: rwy.he_elevation_ft || null,
      le_ils: rwy.le_ils || null,
      he_ils: rwy.he_ils || null
    }));

    const freqs = (fallback.freqs || []).reduce((acc, freq) => {
      const type = (freq.type || 'other').toLowerCase();
      if (!acc[type]) acc[type] = [];
      acc[type].push(freq.frequency_mhz || freq.frequency);
      return acc;
    }, {});

    const enrichedFallback = {
      icao: fallback.icao,
      iata: fallback.iata || null,
      name: fallback.name,
      city: fallback.city || null,
      country: fallback.country || 'MA',
      latitude: fallback.latitude_deg,
      longitude: fallback.longitude_deg,
      elevation_ft: fallback.elevation_ft,
      elevation_m: fallback.elevation_ft ? Math.round(fallback.elevation_ft * 0.3048) : null,
      type: fallback.type,
      scheduled_service: fallback.scheduled_service === 'yes',
      runways,
      frequencies: {
        tower: freqs.twr ? freqs.twr[0] : null,
        ground: freqs.gnd ? freqs.gnd[0] : null,
        approach: freqs.app ? freqs.app[0] : null,
        atis: freqs.atis ? freqs.atis[0] : null,
        unicom: freqs.unicom ? freqs.unicom[0] : null,
        all_frequencies: fallback.freqs || []
      },
      navaids: fallback.navaids || [],
      wikipedia_link: fallback.wikipedia_link || null,
      home_link: fallback.home_link || null
    };

    cache.set(icaoCode, enrichedFallback);
    return enrichedFallback;
  }

  // Fetch from AirportDB API
  try {
    const url = `${AIRPORT_DB_URL}/${icaoCode}?apiToken=${AIRPORT_DB_TOKEN}`;
    const response = await axios.get(url, { timeout: 15000, headers: { 'User-Agent': 'vAIP-Morocco/1.0' } });
    const airportData = response.data;

    // Extract runways
    const runways = airportData.runways ? airportData.runways.map(rwy => ({
      identifier: `${rwy.le_ident}/${rwy.he_ident}`,
      length_m: rwy.length_ft ? Math.round(parseInt(rwy.length_ft) * 0.3048) : null,
      length_ft: parseInt(rwy.length_ft),
      width_m: rwy.width_ft ? Math.round(parseInt(rwy.width_ft) * 0.3048) : null,
      width_ft: parseInt(rwy.width_ft),
      surface: rwy.surface === 'ASP' ? 'Asphalt' : rwy.surface === 'CON' ? 'Concrete' : rwy.surface,
      lighting: rwy.lighted === '1',
      closed: rwy.closed === '1',
      le_ident: rwy.le_ident,
      he_ident: rwy.he_ident,
      le_heading: rwy.le_heading_degT,
      he_heading: rwy.he_heading_degT,
      le_elevation_ft: rwy.le_elevation_ft,
      he_elevation_ft: rwy.he_elevation_ft,
      le_ils: rwy.le_ils || null,
      he_ils: rwy.he_ils || null
    })) : [];

    // Extract frequencies
    const freqs = airportData.freqs ? airportData.freqs.reduce((acc, freq) => {
      const type = freq.type.toLowerCase();
      if (!acc[type]) acc[type] = [];
      acc[type].push(freq.frequency_mhz);
      return acc;
    }, {}) : {};

    const enrichedData = {
      icao: airportData.ident || airportData.icao_code,
      iata: airportData.iata_code || null,
      name: airportData.name || null,
      city: airportData.municipality || null,
      country: airportData.iso_country || 'MA',
      latitude: parseFloat(airportData.latitude_deg),
      longitude: parseFloat(airportData.longitude_deg),
      elevation_ft: parseInt(airportData.elevation_ft),
      elevation_m: airportData.elevation_ft ? Math.round(parseInt(airportData.elevation_ft) * 0.3048) : null,
      type: airportData.type || null,
      scheduled_service: airportData.scheduled_service === 'yes',
      runways,
      frequencies: {
        tower: freqs.twr ? freqs.twr[0] : null,
        ground: freqs.gnd ? freqs.gnd[0] : null,
        approach: freqs.app ? freqs.app[0] : null,
        atis: freqs.atis ? freqs.atis[0] : null,
        unicom: freqs.unicom ? freqs.unicom[0] : null,
        all_frequencies: airportData.freqs || []
      },
      navaids: airportData.navaids || [],
      wikipedia_link: airportData.wikipedia_link || null,
      home_link: airportData.home_link || null
    };

    cache.set(icaoCode, enrichedData);
    console.log(`✓ Fetched and cached ${icaoCode}`);
    return enrichedData;

  } catch (error) {
    console.error(`✗ Error fetching ${icaoCode}:`, error.message);
    return {
      icao: icaoCode,
      error: error.message,
      runways: []
    };
  }
}

/**
 * Batch fetch all Moroccan airports including missing ones
 */
async function fetchAllAirports() {
  const cachedData = cache.get('all_airports');
  if (cachedData) {
    console.log('✓ Using cached all_airports data');
    return cachedData;
  }

  console.log(`Fetching data for ${MOROCCAN_AIRPORTS.length} airports...`);

  const results = [];
  for (let i = 0; i < MOROCCAN_AIRPORTS.length; i += 3) {
    const batch = MOROCCAN_AIRPORTS.slice(i, i + 3);
    const batchResults = await Promise.all(batch.map(icao => fetchAirportRunways(icao)));
    results.push(...batchResults);

    if (i + 3 < MOROCCAN_AIRPORTS.length) await new Promise(r => setTimeout(r, 500));
  }

  // Cache all results
  cache.set('all_airports', results);
  console.log(`✓ Fetched all ${results.length} airports`);

  return results;
}

/**
 * API Endpoints
 */
app.get('/api/airport/:icao', async (req, res) => {
  try {
    const airportData = await fetchAirportRunways(req.params.icao);
    res.json({ success: true, data: airportData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/airports', async (req, res) => {
  try {
    const airports = await fetchAllAirports();
    res.json({ success: true, count: airports.length, data: airports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Airport service is running', cacheStats: cache.getStats() });
});

app.post('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({ success: true, message: 'Cache cleared' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🛫 vAIP Morocco Airport Service`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/airport/:icao`);
  console.log(`  GET  /api/airports`);
  console.log(`  GET  /api/health`);
  console.log(`  POST /api/cache/clear`);
});

module.exports = { fetchAirportRunways, fetchAllAirports };
