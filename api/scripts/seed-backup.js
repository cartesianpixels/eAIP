const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuration (mirroring api/index.js)
const AIRPORT_DB_TOKEN = process.env.AIRPORT_DB_TOKEN;
const AIRPORT_DB_URL = 'https://airportdb.io/api/v1/airport';

// Morocco (MA) and Southern Territories (EH) ICAO codes
const MOROCCAN_AIRPORTS = [
    'GMMN', 'GMMX', 'GMFF', 'GMTT', 'GMAD', 'GMME', 'GMFO', 'GMMZ', 'GMMI', 'GMMW',
    'GMTA', 'GMFK', 'GMAT', 'GMTN', 'GMMY', 'GMMD', 'GMFB', 'GMFM', 'GMMB', 'GMAG',
    'GMFI', 'GMSL', 'GMAZ', 'GMFA', 'GMMO', 'GMFZ', 'GMAA', 'GMMT',
    'GMML', 'GMMH', 'GMMA'
];

async function fetchAirport(icao) {
    try {
        console.log(`Fetching ${icao}...`);
        const url = `${AIRPORT_DB_URL}/${icao}?apiToken=${AIRPORT_DB_TOKEN}`;
        const response = await axios.get(url, { timeout: 10000 });
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${icao}:`, error.message);
        return null;
    }
}

async function seedBackup() {
    if (!AIRPORT_DB_TOKEN) {
        console.warn('WARNING: AIRPORT_DB_TOKEN not found in environment variables. Fetching might fail.');
    }

    const backupData = {};
    let successCount = 0;

    for (const icao of MOROCCAN_AIRPORTS) {
        const rawData = await fetchAirport(icao);
        if (rawData) {
            // Process/Enrich data similarly to api/index.js to ensure consistency
            // Extract runways
            const runways = rawData.runways ? rawData.runways.map(rwy => ({
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
            const freqs = rawData.freqs ? rawData.freqs.reduce((acc, freq) => {
                const type = freq.type.toLowerCase();
                if (!acc[type]) acc[type] = [];
                acc[type].push(freq.frequency_mhz);
                return acc;
            }, {}) : {};

            const enrichedData = {
                icao: rawData.ident || rawData.icao_code,
                iata: rawData.iata_code || null,
                name: rawData.name || null,
                city: rawData.municipality || null,
                country: 'MA', // Always Morocco - southern airports should not show as EH
                latitude: parseFloat(rawData.latitude_deg),
                longitude: parseFloat(rawData.longitude_deg),
                elevation_ft: parseInt(rawData.elevation_ft),
                elevation_m: rawData.elevation_ft ? Math.round(parseInt(rawData.elevation_ft) * 0.3048) : null,
                type: rawData.type || null,
                scheduled_service: rawData.scheduled_service === 'yes',
                runways,
                frequencies: {
                    tower: freqs.twr ? freqs.twr[0] : null,
                    ground: freqs.gnd ? freqs.gnd[0] : null,
                    approach: freqs.app ? freqs.app[0] : null,
                    atis: freqs.atis ? freqs.atis[0] : null,
                    unicom: freqs.unicom ? freqs.unicom[0] : null,
                    all_frequencies: rawData.freqs || []
                },
                navaids: rawData.navaids || [],
                wikipedia_link: rawData.wikipedia_link || null,
                home_link: rawData.home_link || null
            };

            backupData[icao] = enrichedData;
            successCount++;
            console.log(`✓ Fetched ${icao}`);
        }

        // Polite delay
        await new Promise(r => setTimeout(r, 200));
    }

    const outputPath = path.join(__dirname, '..', 'utils', 'backup-airports.json');
    fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2));
    console.log(`\nSuccess! Saved ${successCount} airports to ${outputPath}`);
}

seedBackup();
