import { clearCache } from './utils/airport';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  clearCache();
  res.status(200).json({ success: true, message: 'Cache cleared' });
}
