import { google } from 'googleapis';
import { format } from 'date-fns';

// Initialize the Google Calendar API
const calendar = google.calendar({
  version: 'v3',
  auth: process.env.GOOGLE_CALENDAR_API_KEY
});

// Calendar ID from environment variables
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// Create a new event in Google Calendar
export const createCalendarEvent = async (shift) => {
  try {
    // Format the event
    const event = {
      summary: shift.title,
      description: shift.description || 'Volunteer shift at Virginia Discovery Museum',
      location: shift.location || 'Virginia Discovery Museum, Charlottesville, VA',
      start: {
        dateTime: new Date(shift.startTime).toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: new Date(shift.endTime).toISOString(),
        timeZone: 'America/New_York',
      },
      colorId: '9', // Use a specific color for volunteer shifts
      attendees: [], // Will add attendees when volunteers sign up
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
    });

    return response.data.id;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
};

// Update an existing event in Google Calendar
export const updateCalendarEvent = async (eventId, shift) => {
  try {
    // Format the event
    const event = {
      summary: shift.title,
      description: shift.description || 'Volunteer shift at Virginia Discovery Museum',
      location: shift.location || 'Virginia Discovery Museum, Charlottesville, VA',
      start: {
        dateTime: new Date(shift.startTime).toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: new Date(shift.endTime).toISOString(),
        timeZone: 'America/New_York',
      },
    };

    // Get existing event to preserve fields we don't want to change
    const existingEvent = await calendar.events.get({
      calendarId: CALENDAR_ID,
      eventId: eventId,
    });

    // Merge the existing event with our updated fields
    const updatedEvent = {
      ...existingEvent.data,
      ...event,
    };

    const response = await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: eventId,
      resource: updatedEvent,
    });

    return response.data;
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    throw error;
  }
};

// Delete an event from Google Calendar
export const deleteCalendarEvent = async (eventId) => {
  try {
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: eventId,
    });
    return true;
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    throw error;
  }
};

// Add an attendee to an event
export const addAttendeeToEvent = async (eventId, volunteer) => {
  try {
    // Get the current event
    const existingEvent = await calendar.events.get({
      calendarId: CALENDAR_ID,
      eventId: eventId,
    });

    // Add the new attendee
    const attendees = existingEvent.data.attendees || [];
    attendees.push({
      email: volunteer.email,
      displayName: volunteer.name,
      responseStatus: 'accepted',
    });

    // Update the event with the new attendee
    const response = await calendar.events.patch({
      calendarId: CALENDAR_ID,
      eventId: eventId,
      resource: {
        attendees: attendees,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error adding attendee to Google Calendar event:', error);
    throw error;
  }
};

// Remove an attendee from an event
export const removeAttendeeFromEvent = async (eventId, volunteerEmail) => {
  try {
    // Get the current event
    const existingEvent = await calendar.events.get({
      calendarId: CALENDAR_ID,
      eventId: eventId,
    });

    // Remove the attendee
    const attendees = (existingEvent.data.attendees || []).filter(
      (attendee) => attendee.email !== volunteerEmail
    );

    // Update the event with the modified attendee list
    const response = await calendar.events.patch({
      calendarId: CALENDAR_ID,
      eventId: eventId,
      resource: {
        attendees: attendees,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error removing attendee from Google Calendar event:', error);
    throw error;
  }
};

// Get upcoming events from Google Calendar
export const getUpcomingEvents = async (maxResults = 10) => {
  try {
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items;
  } catch (error) {
    console.error('Error fetching upcoming events from Google Calendar:', error);
    throw error;
  }
};