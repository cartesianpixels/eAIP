const axios = require('axios');

const IVAO_WHAZZUP_URL = 'https://api.ivao.aero/v2/tracker/whazzup';

// Cache for IVAO network data
let ivaoCache = {
    data: null,
    timestamp: null,
    ttl: 60 * 1000 // 60 seconds cache (IVAO updates every 15 seconds, but we don't need to be that aggressive)
};

/**
 * Fetch current IVAO network data
 * @returns {Promise<Object>} IVAO whazzup data
 */
async function getWhazzupData() {
    // Check cache first
    if (ivaoCache.data && ivaoCache.timestamp) {
        const age = Date.now() - ivaoCache.timestamp;
        if (age < ivaoCache.ttl) {
            return ivaoCache.data;
        }
    }

    try {
        console.log('Fetching IVAO whazzup data...');
        const response = await axios.get(IVAO_WHAZZUP_URL, {
            timeout: 10000 // 10 second timeout
        });

        // Update cache
        ivaoCache.data = response.data;
        ivaoCache.timestamp = Date.now();

        return response.data;
    } catch (error) {
        console.error('Error fetching IVAO whazzup data:', error.message);
        // Return cached data if available, even if expired
        if (ivaoCache.data) {
            console.log('Returning stale IVAO cached data due to error');
            return ivaoCache.data;
        }
        throw error;
    }
}

/**
 * Check if a specific controller is online
 * @param {string} callsign - Controller callsign (e.g., "GMMM_CTR")
 * @returns {Promise<Object|null>} Controller data if online, null otherwise
 */
async function getControllerStatus(callsign) {
    try {
        const data = await getWhazzupData();
        const atcs = data.clients?.atcs || [];

        const controller = atcs.find(atc =>
            atc.callsign && atc.callsign.toUpperCase() === callsign.toUpperCase()
        );

        if (controller) {
            return {
                online: true,
                callsign: controller.callsign,
                userId: controller.userId,
                name: controller.name || 'Unknown',
                rating: controller.rating,
                frequency: controller.frequency || 'N/A',
                atis: controller.atis || null,
                atisCode: controller.atisCode || null,
                time: controller.time || null,
                serverId: controller.serverId || null
            };
        }

        return {
            online: false,
            callsign: callsign
        };
    } catch (error) {
        console.error(`Error checking controller status for ${callsign}:`, error.message);
        return {
            online: false,
            callsign: callsign,
            error: error.message
        };
    }
}

/**
 * Get GMMM_CTR (Casablanca Control) status
 * @returns {Promise<Object>} Controller status
 */
async function getGMMMCTRStatus() {
    return await getControllerStatus('GMMM_CTR');
}

/**
 * Get all online controllers for Morocco (GMMM)
 * @returns {Promise<Array>} Array of Moroccan controllers
 */
async function getMoroccanControllers() {
    try {
        const data = await getWhazzupData();
        const atcs = data.clients?.atcs || [];

        // Filter for Moroccan callsigns (starting with GMMM)
        return atcs.filter(atc =>
            atc.callsign && atc.callsign.toUpperCase().startsWith('GMMM')
        );
    } catch (error) {
        console.error('Error fetching Moroccan controllers:', error.message);
        return [];
    }
}

module.exports = {
    getWhazzupData,
    getControllerStatus,
    getGMMMCTRStatus,
    getMoroccanControllers
};
