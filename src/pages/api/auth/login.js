import * as cognitoService from '../../../lib/aws/cognito';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Validate inputs
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Authenticate with Cognito
    const cognitoUser = await cognitoService.signIn(email, password);
    
    // Get user from our database using Cognito ID
    let user = await prisma.user.findUnique({
      where: {
        cognitoId: cognitoUser.username
      },
      include: {
        profile: true
      }
    });

    // If user doesn't exist in our database yet (possible if registered directly with Cognito),
    // create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cognitoUser.attributes.email,
          name: cognitoUser.attributes.name || cognitoUser.attributes.email.split('@')[0],
          phone: cognitoUser.attributes.phone_number,
          cognitoId: cognitoUser.username,
          role: 'VOLUNTEER', // Default role is volunteer
          profile: {
            create: {} // Create an empty profile
          }
        },
        include: {
          profile: true
        }
      });
    }

    // Return user info along with Cognito session tokens
    const session = await cognitoService.getCurrentSession();
    
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        profile: user.profile
      },
      tokens: {
        idToken: session.getIdToken().getJwtToken(),
        accessToken: session.getAccessToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle different Cognito error codes
    if (error.code === 'NotAuthorizedException') {
      return res.status(401).json({ message: 'Incorrect username or password' });
    } else if (error.code === 'UserNotConfirmedException') {
      return res.status(403).json({ message: 'User is not confirmed. Please verify your email.' });
    }
    
    // Handle other errors
    return res.status(500).json({ message: error.message || 'Login failed' });
  }
}