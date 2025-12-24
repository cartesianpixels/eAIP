// test-fetch.js
// Test script to verify AirportDB.io API integration

const axios = require('axios');
require('dotenv').config();

const AIRPORT_DB_TOKEN = process.env.AIRPORT_DB_TOKEN;
const AIRPORT_DB_URL = 'https://airportdb.io/api/v1/airport';

// Test airports
const TEST_AIRPORTS = ['GMMN', 'GMMX', 'GMFF', 'GMTT'];

async function testFetch(icao) {
  try {
    console.log(`\n📍 Testing ${icao}...`);
    
    const url = AIRPORT_DB_URL + '/' + icao + '?apiToken=' + AIRPORT_DB_TOKEN;
    const response = await axios.get(url, { timeout: 5000 });
    
    const airport = response.data;
    
    console.log(`✓ Success!`);
    console.log(`  Name: ${airport.name}`);
    console.log(`  Location: ${airport.latitude_deg}, ${airport.longitude_deg}`);
    console.log(`  Elevation: ${airport.elevation_ft} ft`);
    console.log(`  Type: ${airport.type}`);
    console.log(`  Scheduled Service: ${airport.scheduled_service}`);
    
    if (airport.runways && airport.runways.length > 0) {
      console.log(`  Runways: ${airport.runways.length}`);
      airport.runways.forEach(rwy => {
        const identifier = rwy.le_ident + '/' + rwy.he_ident;
        const surface = rwy.surface === 'ASP' ? 'Asphalt' : rwy.surface;
        const lighting = rwy.lighted === '1' ? '✓ Lit' : '✗ Unlit';
        console.log(`    - ${identifier}: ${rwy.length_ft}ft x ${rwy.width_ft}ft (${surface}) ${lighting}`);
        
        if (rwy.le_ils || rwy.he_ils) {
          if (rwy.le_ils) console.log(`      LE ILS: ${rwy.le_ils.freq} MHz`);
          if (rwy.he_ils) console.log(`      HE ILS: ${rwy.he_ils.freq} MHz`);
        }
      });
    } else {
      console.log(`  Runways: No data available`);
    }
    
    if (airport.freqs && airport.freqs.length > 0) {
      console.log(`  Frequencies:`);
      airport.freqs.forEach(freq => {
        console.log(`    - ${freq.type}: ${freq.frequency_mhz} MHz`);
      });
    }
    
    return airport;
    
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

async function runTests() {
  console.log('🛫 eAIP Morocco - Airport Data Test');
  console.log('=====================================');
  console.log(`Using token: ${AIRPORT_DB_TOKEN.substring(0, 20)}...`);
  
  for (const icao of TEST_AIRPORTS) {
    await testFetch(icao);
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n✓ Test complete!\n');
}

runTests().catch(console.error);