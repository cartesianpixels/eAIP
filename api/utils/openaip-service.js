const axios = require('axios');
require('dotenv').config();

const OPENAIP_API_KEY = process.env.OPENAIP_API_KEY;
const OPENAIP_BASE_URL = 'https://api.core.openaip.net/api';

// Cache for airspace data
let airspaceCache = {
    data: null,
    timestamp: null,
    ttl: 24 * 60 * 60 * 1000 // 24 hours cache
};

/**
 * Fetch all airspace data for Morocco
 * @returns {Promise<Array>} Array of airspace objects
 */
async function getMoroccoAirspace() {
    // Check cache first
    if (airspaceCache.data && airspaceCache.timestamp) {
        const age = Date.now() - airspaceCache.timestamp;
        if (age < airspaceCache.ttl) {
            console.log('Returning cached airspace data');
            return airspaceCache.data;
        }
    }

    try {
        console.log('Fetching Morocco airspace from openAIP...');
        const response = await axios.get(`${OPENAIP_BASE_URL}/airspaces`, {
            params: {
                apiKey: OPENAIP_API_KEY,
                country: 'MA',
                limit: 100
            }
        });

        const airspaces = response.data.items || [];

        // Update cache
        airspaceCache.data = airspaces;
        airspaceCache.timestamp = Date.now();

        console.log(`Fetched ${airspaces.length} airspace items for Morocco`);
        return airspaces;
    } catch (error) {
        console.error('Error fetching airspace from openAIP:', error.message);
        // Return cached data if available, even if expired
        if (airspaceCache.data) {
            console.log('Returning stale cached data due to error');
            return airspaceCache.data;
        }
        throw error;
    }
}

/**
 * Get FIR boundaries (type 0 = CTA/FIR)
 * @returns {Promise<Array>} Array of FIR boundary objects
 */
async function getFIRBoundaries() {
    const airspaces = await getMoroccoAirspace();
    return airspaces.filter(airspace => airspace.type === 0);
}

/**
 * Get specific FIR by name
 * @param {string} name - FIR name (e.g., "CTA CASABLANCA")
 * @returns {Promise<Object|null>} FIR object or null
 */
async function getFIRByName(name) {
    const firs = await getFIRBoundaries();
    return firs.find(fir => fir.name.toUpperCase().includes(name.toUpperCase())) || null;
}

/**
 * Get Casablanca FIR (GMMM)
 * @returns {Promise<Object|null>} Casablanca FIR object or null
 */
async function getCasablancaFIR() {
    return await getFIRByName('CASABLANCA');
}

module.exports = {
    getMoroccoAirspace,
    getFIRBoundaries,
    getFIRByName,
    getCasablancaFIR
};
