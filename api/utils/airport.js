import axios from 'axios';
import NodeCache from 'node-cache';
import MISSING_AIRPORTS from './missing-airports.json';

const cache = new NodeCache({ stdTTL: 3600 });

const AIRPORT_DB_TOKEN = process.env.AIRPORT_DB_TOKEN || 'YOUR_DEFAULT_TOKEN';
const AIRPORT_DB_URL = 'https://airportdb.io/api/v1/airport';

export const MOROCCAN_AIRPORTS = [
  'GMMN', 'GMMX', 'GMFF', 'GMTT', 'GMAD', 'GMME', 'GMFO', 'GMMZ', 'GMMI', 'GMMW',
  'GMTA', 'GMFK', 'GMAT', 'GMTN', 'GMMY', 'GMMD', 'GMFB', 'GMFM', 'GMMB', 'GMAG',
  'GMFI', 'GMSL', 'GMAZ', 'GMFA', 'GMMO', 'GMFZ', 'GMAA', 'GMMT',
  'GMML', 'GMMH', 'GMMA'
];

export async function fetchAirportRunways(icaoCode) {
  icaoCode = icaoCode.toUpperCase();

  const cached = cache.get(icaoCode);
  if (cached) return cached;

  // Use local fallback
  if (MISSING_AIRPORTS[icaoCode]) {
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

  // Fetch from AirportDB
  try {
    const url = `${AIRPORT_DB_URL}/${icaoCode}?apiToken=${AIRPORT_DB_TOKEN}`;
    const response = await axios.get(url, { timeout: 15000 });
    const airportData = response.data;

    const runways = (airportData.runways || []).map(rwy => ({
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
    }));

    const freqs = (airportData.freqs || []).reduce((acc, freq) => {
      const type = freq.type.toLowerCase();
      if (!acc[type]) acc[type] = [];
      acc[type].push(freq.frequency_mhz);
      return acc;
    }, {});

    const enrichedData = {
      icao: airportData.ident || airportData.icao_code,
      iata: airportData.iata_code || null,
      name: airportData.name || null,
      city: airportData.municipality || null,
      country: 'MA', // Always Morocco - southern airports should not show as EH
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
    return enrichedData;
  } catch (error) {
    return { icao: icaoCode, error: error.message, runways: [] };
  }
}

export async function fetchAllAirports() {
  const cachedData = cache.get('all_airports');
  if (cachedData) return cachedData;

  const results = [];
  for (let i = 0; i < MOROCCAN_AIRPORTS.length; i += 3) {
    const batch = MOROCCAN_AIRPORTS.slice(i, i + 3);
    const batchResults = await Promise.all(batch.map(fetchAirportRunways));
    results.push(...batchResults);
    if (i + 3 < MOROCCAN_AIRPORTS.length) await new Promise(r => setTimeout(r, 500));
  }

  cache.set('all_airports', results);
  return results;
}

export function clearCache() {
  cache.flushAll();
  return true;
}

export function getCacheStats() {
  return cache.getStats();
}
