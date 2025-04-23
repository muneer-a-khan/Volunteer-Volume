import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Return a simple success response
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
} 