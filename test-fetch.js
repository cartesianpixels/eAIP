// test-fetch.js
const axios = require('axios');
require('dotenv').config();

const AIRPORT_DB_TOKEN = process.env.AIRPORT_DB_TOKEN;
const AIRPORT_DB_URL = 'https://airportdb.io/api/v1/airport';

// Test airports including one missing
const TEST_AIRPORTS = ['GMMN', 'GMMX', 'GMFF', 'GMTT', 'GMAG'];

// Local fallback for missing airports
const MISSING_AIRPORTS = require('./missing-airports.json');

if (!AIRPORT_DB_TOKEN) {
  console.error('✗ AIRPORT_DB_TOKEN not set in .env');
  process.exit(1);
}

// Fetch airport from API or fallback
async function testFetch(icao) {
  // Check local fallback first
  if (MISSING_AIRPORTS[icao]) {
    const airport = MISSING_AIRPORTS[icao];
    console.log(`\n📍 ${icao} is missing in API — using local fallback`);
    console.log(`  Name: ${airport.name}`);
    console.log(`  Location: ${airport.latitude_deg}, ${airport.longitude_deg}`);
    console.log(`  Elevation: ${airport.elevation_ft} ft`);
    console.log(`  Type: ${airport.type}`);
    console.log(`  Scheduled Service: ${airport.scheduled_service}`);
    return airport;
  }

  // Otherwise fetch from API
  try {
    console.log(`\n📍 Testing ${icao}...`);
    const url = `${AIRPORT_DB_URL}/${icao}?apiToken=${AIRPORT_DB_TOKEN}`;
    const response = await axios.get(url, { timeout: 15000 });
    const airport = response.data;

    console.log('✓ Success!');
    console.log(`  Name: ${airport.name}`);
    console.log(`  Location: ${airport.latitude_deg}, ${airport.longitude_deg}`);
    console.log(`  Elevation: ${airport.elevation_ft} ft`);
    console.log(`  Type: ${airport.type}`);
    console.log(`  Scheduled Service: ${airport.scheduled_service}`);

    // Runways
    if (airport.runways?.length) {
      console.log(`  Runways: ${airport.runways.length}`);
      airport.runways.forEach(rwy => {
        const identifier = `${rwy.le_ident}/${rwy.he_ident}`;
        const surface = rwy.surface === 'ASP' ? 'Asphalt' : rwy.surface;
        const lighting = rwy.lighted === '1' ? '✓ Lit' : '✗ Unlit';
        console.log(`    - ${identifier}: ${rwy.length_ft}ft x ${rwy.width_ft}ft (${surface}) ${lighting}`);

        if (rwy.le_ils?.freq) console.log(`      LE ILS: ${rwy.le_ils.freq} MHz`);
        if (rwy.he_ils?.freq) console.log(`      HE ILS: ${rwy.he_ils.freq} MHz`);
      });
    } else {
      console.log('  Runways: No data');
    }

    // Frequencies
    if (airport.freqs?.length) {
      console.log('  Frequencies:');
      airport.freqs.forEach(freq => {
        console.log(`    - ${freq.type}: ${freq.frequency_mhz} MHz`);
      });
    }

    return airport;

  } catch (error) {
    console.error(`✗ Error fetching ${icao}: ${error.message}`);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

// Run tests sequentially
async function runTests() {
  console.log('🛫 eAIP Morocco - Airport Data Test');
  console.log('=====================================');
  console.log(`Using token: ${AIRPORT_DB_TOKEN.substring(0, 20)}...`);

  for (const icao of TEST_AIRPORTS) {
    await testFetch(icao);
    await new Promise(r => setTimeout(r, 300)); // small delay
  }

  console.log('\n✓ Test complete!\n');
}

runTests().catch(console.error);
