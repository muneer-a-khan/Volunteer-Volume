// Simple script to test email sending
require('dotenv').config();
const nodemailer = require('nodemailer');

async function main() {
  console.log('Testing email configuration...');
  
  // Check for required environment variables
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Missing required environment variables:');
    console.error('- GMAIL_USER:', process.env.GMAIL_USER ? '✓' : '✗');
    console.error('- GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✓' : '✗');
    return false;
  }
  
  // Create a test transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  
  try {
    // Send a test email
    const info = await transporter.sendMail({
      from: `"VADM Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Send to yourself for testing
      subject: "Email Configuration Test",
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify that your email configuration is working correctly.</p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
      `,
    });
    
    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send test email:', error);
    return false;
  }
}

main()
  .then(success => {
    if (success) {
      console.log('Email configuration test completed successfully.');
    } else {
      console.error('Email configuration test failed.');
      process.exit(1);
    }
  })
  .catch(e => {
    console.error('Script error:', e);
    process.exit(1);
  }); 