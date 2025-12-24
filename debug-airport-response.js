// debug-airport-response.js
// Script to inspect actual AirportDB.io response structure

const axios = require('axios');
require('dotenv').config();

const AIRPORT_DB_TOKEN = process.env.AIRPORT_DB_TOKEN;
const AIRPORT_DB_URL = 'https://airportdb.io/api/v1/airport';

async function inspectResponse() {
  try {
    console.log('Fetching GMMN (Casablanca) to inspect response structure...\n');
    
    const url = `${AIRPORT_DB_URL}/GMMN?apiToken=${AIRPORT_DB_TOKEN}`;
    const response = await axios.get(url, { timeout: 5000 });
    
    const airport = response.data;
    
    console.log('📋 Full Response Structure:');
    console.log(JSON.stringify(airport, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

inspectResponse();