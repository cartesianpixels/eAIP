import { fetchAirportRunways } from '../utils/airport';

export default async function handler(req, res) {
  const { icao } = req.query;
  if (!icao) return res.status(400).json({ success: false, error: 'Missing ICAO code' });

  try {
    const data = await fetchAirportRunways(icao);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
