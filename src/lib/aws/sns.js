import { SNSClient, PublishCommand, CreateTopicCommand, SubscribeCommand } from "@aws-sdk/client-sns";

// Initialize SNS client
const snsClient = new SNSClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// SNS Topic ARN from environment variables
const SNS_TOPIC_ARN = process.env.NEXT_PUBLIC_AWS_SNS_TOPIC_ARN;

// Send SMS notification
export const sendSMS = async (phoneNumber, message) => {
  try {
    // Format phone number to E.164 format if not already
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const params = {
      Message: message,
      PhoneNumber: formattedPhone,
    };

    const command = new PublishCommand(params);
    const data = await snsClient.send(command);
    return data;
  } catch (error) {
    console.error("Error sending SMS notification:", error);
    throw error;
  }
};

// Send notification to a topic
export const sendTopicNotification = async (message, subject) => {
  try {
    const params = {
      Message: message,
      TopicArn: SNS_TOPIC_ARN,
      Subject: subject,
    };

    const command = new PublishCommand(params);
    const data = await snsClient.send(command);
    return data;
  } catch (error) {
    console.error("Error sending topic notification:", error);
    throw error;
  }
};

// Create a new SNS topic
export const createTopic = async (topicName) => {
  try {
    const params = {
      Name: topicName,
    };

    const command = new CreateTopicCommand(params);
    const data = await snsClient.send(command);
    return data.TopicArn;
  } catch (error) {
    console.error("Error creating SNS topic:", error);
    throw error;
  }
};

// Subscribe to a topic
export const subscribeTopic = async (topicArn, protocol, endpoint) => {
  try {
    const params = {
      Protocol: protocol, // "email", "sms", etc.
      TopicArn: topicArn,
      Endpoint: endpoint,
    };

    const command = new SubscribeCommand(params);
    const data = await snsClient.send(command);
    return data.SubscriptionArn;
  } catch (error) {
    console.error("Error subscribing to topic:", error);
    throw error;
  }
};

// Send shift reminder
export const sendShiftReminder = async (volunteer, shift) => {
  try {
    const message = `Hello ${volunteer.name}, this is a reminder that you have a shift at Virginia Discovery Museum tomorrow from ${formatTime(shift.startTime)} to ${formatTime(shift.endTime)}. Location: ${shift.location}`;
    
    // Send SMS if phone number is available
    if (volunteer.phone) {
      await sendSMS(volunteer.phone, message);
    }
    
    return true;
  } catch (error) {
    console.error("Error sending shift reminder:", error);
    throw error;
  }
};

// Helper function to format phone numbers to E.164 format
const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Ensure it has the country code (assume US +1 if not present)
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length > 10 && !cleaned.startsWith('+')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('+')) {
    return cleaned;
  } else {
    throw new Error('Invalid phone number format');
  }
};

// Helper function to format time
const formatTime = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};