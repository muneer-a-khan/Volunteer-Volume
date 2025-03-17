import { google } from 'googleapis';
import { supabaseAdmin } from '../supabase-server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function getGoogleAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });
}

export async function handleGoogleCallback(code: string, userId: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in Supabase
    const { error } = await supabaseAdmin
      .from('google_credentials')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        scope: tokens.scope,
        token_type: tokens.token_type,
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error handling Google callback:', error);
    return false;
  }
}

export async function getCalendarClient(userId: string) {
  try {
    // Get stored credentials from Supabase
    const { data, error } = await supabaseAdmin
      .from('google_credentials')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Set credentials
    oauth2Client.setCredentials({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expiry_date: data.expiry_date,
      scope: data.scope,
      token_type: data.token_type,
    });

    // Create calendar client
    return google.calendar({ version: 'v3', auth: oauth2Client });
  } catch (error) {
    console.error('Error getting calendar client:', error);
    throw error;
  }
}

export async function createCalendarEvent(
  userId: string,
  event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
  }
) {
  try {
    const calendar = await getCalendarClient(userId);
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  event: {
    summary?: string;
    description?: string;
    start?: { dateTime: string; timeZone: string };
    end?: { dateTime: string; timeZone: string };
  }
) {
  try {
    const calendar = await getCalendarClient(userId);
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: event,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

export async function deleteCalendarEvent(userId: string, eventId: string) {
  try {
    const calendar = await getCalendarClient(userId);
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
} 