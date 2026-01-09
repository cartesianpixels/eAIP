import { getCacheStats } from './utils/airport';

export default function handler(req, res) {
  res.status(200).json({ success: true, message: 'Airport service is running', cacheStats: getCacheStats() });
}
