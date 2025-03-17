import { supabaseAdmin } from '@/lib/supabase-server';

export async function sendEmail(
  to: string,
  subject: string,
  template: string,
  data: Record<string, any>
) {
  try {
    const { data: response, error } = await supabaseAdmin.functions.invoke('send-email', {
      body: {
        to,
        subject,
        template,
        data,
      },
    });

    if (error) throw error;
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendSMS(
  to: string,
  message: string
) {
  try {
    const { data: response, error } = await supabaseAdmin.functions.invoke('send-sms', {
      body: {
        to,
        message,
      },
    });

    if (error) throw error;
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

export async function sendNotification(
  userId: string,
  type: 'EMAIL' | 'SMS' | 'PUSH',
  title: string,
  message: string,
  data?: Record<string, any>
) {
  try {
    const { data: response, error } = await supabaseAdmin.functions.invoke('send-notification', {
      body: {
        userId,
        type,
        title,
        message,
        data,
      },
    });

    if (error) throw error;
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
} 