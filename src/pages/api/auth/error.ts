import { NextApiRequest, NextApiResponse } from 'next';

/**
 * This is a custom error handler for NextAuth errors.
 * It returns structured JSON error responses instead of HTML,
 * which helps avoid the "not valid JSON" client errors.
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the error code from the query string
  const { error } = req.query;

  // Log the error details for debugging
  console.error(`[NextAuth] Auth error handler called with error: ${error}`);

  // Map standard NextAuth error codes to user-friendly messages
  let errorMessage = 'An authentication error occurred';
  let statusCode = 401;

  switch (error) {
    case 'Configuration':
      errorMessage = 'A server configuration error occurred';
      statusCode = 500;
      break;
    case 'AccessDenied':
      errorMessage = 'Access denied. You do not have permission to access this resource';
      statusCode = 403;
      break;
    case 'Verification':
      errorMessage = 'The verification link is invalid or has expired';
      statusCode = 400;
      break;
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
    case 'EmailCreateAccount':
    case 'Callback':
    case 'OAuthAccountNotLinked':
      errorMessage = 'There was a problem with the authentication service';
      statusCode = 500;
      break;
    case 'EmailSignin':
      errorMessage = 'The email sign-in link is invalid or has expired';
      statusCode = 400;
      break;
    case 'CredentialsSignin':
      errorMessage = 'Invalid credentials. Please check your email and password';
      statusCode = 401;
      break;
    case 'SessionRequired':
      errorMessage = 'You must be signed in to access this page';
      statusCode = 401;
      break;
    default:
      // If it's a custom error (starts with "Error:"), extract the message
      if (typeof error === 'string' && error.startsWith('Error:')) {
        errorMessage = error.substring(7);
      }
  }

  // Return a structured JSON response
  return res.status(statusCode).json({
    error: error || 'AuthError',
    message: errorMessage,
    status: statusCode,
    timestamp: new Date().toISOString()
  });
} 