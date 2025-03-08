import { Amplify, Auth } from 'aws-amplify';

// Configure Amplify
Amplify.configure({
  Auth: {
    region: process.env.NEXT_PUBLIC_AWS_COGNITO_REGION,
    userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_WEB_CLIENT_ID,
    identityPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_IDENTITY_POOL_ID,
    mandatorySignIn: true,
  }
});

// User Registration
export const signUp = async (email, password, name, phone) => {
  try {
    const { user } = await Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        name,
        phone_number: phone,
      }
    });
    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Confirm Registration
export const confirmSignUp = async (email, code) => {
  try {
    return await Auth.confirmSignUp(email, code);
  } catch (error) {
    console.error('Error confirming sign up:', error);
    throw error;
  }
};

// User Login
export const signIn = async (email, password) => {
  try {
    const user = await Auth.signIn(email, password);
    return user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// User Logout
export const signOut = async () => {
  try {
    await Auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Current User
export const getCurrentUser = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Get Current Session (for JWT token)
export const getCurrentSession = async () => {
  try {
    const session = await Auth.currentSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Get ID Token
export const getIdToken = async () => {
  try {
    const session = await Auth.currentSession();
    return session.getIdToken().getJwtToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

// Password Reset Request
export const forgotPassword = async (email) => {
  try {
    return await Auth.forgotPassword(email);
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

// Complete Password Reset
export const forgotPasswordSubmit = async (email, code, newPassword) => {
  try {
    return await Auth.forgotPasswordSubmit(email, code, newPassword);
  } catch (error) {
    console.error('Error submitting new password:', error);
    throw error;
  }
};

// Change Password
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return await Auth.changePassword(user, oldPassword, newPassword);
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Update User Attributes
export const updateUserAttributes = async (attributes) => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    return await Auth.updateUserAttributes(user, attributes);
  } catch (error) {
    console.error('Error updating user attributes:', error);
    throw error;
  }
};