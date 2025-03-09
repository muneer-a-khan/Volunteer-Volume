import { signOut } from '../../../lib/aws/cognito';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // No authentication required for logout
  
  try {
    // Sign out from Cognito
    await signOut();
    
    // Clear session cookies
    res.setHeader('Set-Cookie', [
      'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly',
      'refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly',
    ]);
    
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Failed to logout', error: error.message });
  }
}