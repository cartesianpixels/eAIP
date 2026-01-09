import { fetchAllAirports } from './utils/airport';

export default async function handler(req, res) {
  try {
    const data = await fetchAllAirports();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
