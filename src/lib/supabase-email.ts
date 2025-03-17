import { supabase } from '@/lib/supabase';

interface EmailParams {
  to: string;
  subject: string;
  message: string;
}

/**
 * Send an email notification using Supabase Edge Functions
 */
export const sendEmail = async (params: EmailParams): Promise<void> => {
  try {
    const { to, subject, message } = params;
    
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to,
        subject,
        content: message
      }
    });

    if (error) {
      console.error("Error sending email notification:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error sending email notification:", error);
    throw error;
  }
};

/**
 * Send a notification based on a template
 */
export const sendTemplateEmail = async (
  to: string, 
  templateName: string, 
  data: Record<string, any>
): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('send-template-email', {
      body: {
        to,
        template: templateName,
        data
      }
    });

    if (error) {
      console.error("Error sending template email:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error sending template email:", error);
    throw error;
  }
};

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = async (
  email: string, 
  name: string
): Promise<void> => {
  return sendTemplateEmail(email, 'welcome', { name });
};

/**
 * Send a shift reminder to a volunteer
 */
export const sendShiftReminder = async (
  email: string,
  name: string,
  shiftTitle: string,
  shiftDate: string,
  startTime: string,
  endTime: string,
  location: string
): Promise<void> => {
  return sendTemplateEmail(email, 'shift-reminder', {
    name,
    shiftTitle,
    shiftDate,
    startTime,
    endTime,
    location
  });
};

/**
 * Send application approval notification
 */
export const sendApplicationApproval = async (
  email: string,
  name: string
): Promise<void> => {
  return sendTemplateEmail(email, 'application-approval', { name });
}; 