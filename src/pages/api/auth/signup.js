import prisma from '../../../lib/prisma';
import * as cognitoService from '../../../lib/aws/cognito';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, name, phone } = req.body;

  // Validate inputs
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Register user with Cognito
    const cognitoUser = await cognitoService.signUp(email, password, name, phone);
    
    // Store user in our database
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        cognitoId: cognitoUser.userSub,
        role: 'VOLUNTEER', // Default role is volunteer
        profile: {
          create: {} // Create an empty profile
        }
      },
      include: {
        profile: true
      }
    });

    // Return success response without sensitive data
    return res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      userId: user.id
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle Cognito-specific errors
    if (error.code === 'UsernameExistsException') {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Handle other errors
    return res.status(500).json({ message: error.message || 'Failed to create user' });
  }
}