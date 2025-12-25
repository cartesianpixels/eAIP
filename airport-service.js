// airport-service.js
// Node.js service to fetch runway data from AirportDB.io and enrich airport data

const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// Enable CORS for frontend dev servers
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Configuration
const AIRPORT_DB_TOKEN = process.env.AIRPORT_DB_TOKEN || '4dae50ce09ff610a77e80879619547277de22bdfa82c940363768921b9c0b11ee64031c1e510fdeda9cbd8ab1e96a0da';
const AIRPORT_DB_URL = 'https://airportdb.io/api/v1/airport';

// Morocco (MA) and Western Sahara (EH) airports
const MOROCCAN_AIRPORTS = [
  // Morocco
  'GMMN', 'GMMX', 'GMFF', 'GMTT', 'GMAD', 'GMME', 'GMFO', 'GMMZ', 'GMMI', 'GMMW',
  'GMTA', 'GMFK', 'GMAT', 'GMTN', 'GMMY', 'GMMD', 'GMFB', 'GMFM', 'GMMB', 'GMAG',
  'GMFI', 'GMSL', 'GMAZ', 'GMFA', 'GMMO', 'GMFZ', 'GMAA', 'GMMT',
  // Western Sahara (EH)
  'GMML', 'GMMH', 'GMMA'
];

/**
 * Fetch single airport runway data from AirportDB.io
 */
async function fetchAirportRunways(icaoCode) {
  try {
    // Check cache first
    const cached = cache.get(icaoCode);
    if (cached) {
      console.log(`✓ Cache hit for ${icaoCode}`);
      return cached;
    }

    const url = AIRPORT_DB_URL + '/' + icaoCode + '?apiToken=' + AIRPORT_DB_TOKEN;
    
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'eAIP-Morocco/1.0'
      }
    });

    const airportData = response.data;
    
    // Extract runway information from actual API structure
    const runways = airportData.runways ? airportData.runways.map(runway => ({
      identifier: runway.le_ident + '/' + runway.he_ident,
      length_m: Math.round(parseInt(runway.length_ft) * 0.3048),
      length_ft: parseInt(runway.length_ft),
      width_m: Math.round(parseInt(runway.width_ft) * 0.3048),
      width_ft: parseInt(runway.width_ft),
      surface: runway.surface === 'ASP' ? 'Asphalt' : runway.surface === 'CON' ? 'Concrete' : runway.surface,
      lighting: runway.lighted === '1' ? true : false,
      closed: runway.closed === '1' ? true : false,
      le_ident: runway.le_ident,
      he_ident: runway.he_ident,
      le_heading: runway.le_heading_degT,
      he_heading: runway.he_heading_degT,
      le_elevation_ft: runway.le_elevation_ft,
      he_elevation_ft: runway.he_elevation_ft,
      le_ils: runway.le_ils || null,
      he_ils: runway.he_ils || null
    })) : [];

    // Extract frequencies from actual API structure
    const freqs = airportData.freqs ? airportData.freqs.reduce((acc, freq) => {
      const type = freq.type.toLowerCase();
      if (!acc[type]) {
        acc[type] = [];
      }
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
      elevation_m: Math.round(parseInt(airportData.elevation_ft) * 0.3048),
      type: airportData.type || null,
      scheduled_service: airportData.scheduled_service === 'yes' ? true : false,
      runways: runways,
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

    // Cache the result
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
 * Batch fetch all Moroccan airports
 */
async function fetchAllAirports() {
  const cachedData = cache.get('all_airports');
  if (cachedData) {
    console.log('✓ Using cached all_airports data');
    return cachedData;
  }

  console.log(`Fetching data for ${MOROCCAN_AIRPORTS.length} airports...`);
  
  // Fetch with controlled concurrency (3 at a time to avoid rate limiting)
  const results = [];
  for (let i = 0; i < MOROCCAN_AIRPORTS.length; i += 3) {
    const batch = MOROCCAN_AIRPORTS.slice(i, i + 3);
    const batchResults = await Promise.all(
      batch.map(icao => fetchAirportRunways(icao))
    );
    results.push(...batchResults);
    
    // Add delay between batches
    if (i + 3 < MOROCCAN_AIRPORTS.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Cache all results
  cache.set('all_airports', results);
  console.log(`✓ Fetched all ${results.length} airports`);
  
  return results;
}

/**
 * API Endpoints
 */

// Get single airport with runways
app.get('/api/airport/:icao', async (req, res) => {
  try {
    const { icao } = req.params;
    const airportData = await fetchAirportRunways(icao.toUpperCase());
    
    res.json({
      success: true,
      data: airportData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all Moroccan airports with runways
app.get('/api/airports', async (req, res) => {
  try {
    const airports = await fetchAllAirports();
    
    res.json({
      success: true,
      count: airports.length,
      data: airports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Airport service is running',
    cacheStats: cache.getStats()
  });
});

// Clear cache
app.post('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({
    success: true,
    message: 'Cache cleared'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🛫 eAIP Morocco Airport Service`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /api/airport/:icao       - Get single airport with runways`);
  console.log(`  GET  /api/airports            - Get all Moroccan airports`);
  console.log(`  GET  /api/health              - Health check`);
  console.log(`  POST /api/cache/clear         - Clear cache\n`);
});

module.exports = { fetchAirportRunways, fetchAllAirports };