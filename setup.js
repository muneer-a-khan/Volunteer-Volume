#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask user for input
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Load environment variables from .env.local file if it exists
try {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.log('No .env.local file found, using default environment variables');
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Print colored text
const print = {
  info: (text) => console.log(`${colors.cyan}${text}${colors.reset}`),
  success: (text) => console.log(`${colors.green}${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}${text}${colors.reset}`),
  title: (text) => console.log(`\n${colors.bright}${colors.magenta}${text}${colors.reset}`),
  step: (text) => console.log(`${colors.blue}→ ${text}${colors.reset}`)
};

// Run the command and handle errors
const runCommand = (command, errorMessage) => {
  try {
    print.step(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    print.error(`${errorMessage}: ${error.message}`);
    return false;
  }
};

// Check if a tool is installed
const isToolInstalled = (tool) => {
  try {
    execSync(`which ${tool}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
};

// Main setup function
async function setup() {
  print.title('🚀 Volunteer Volume Setup');
  print.info('This script will help you set up the Volunteer Volume application.');
  
  // Step 1: Check prerequisites
  print.title('Step 1: Checking Prerequisites');
  
  // Check Node.js
  if (!isToolInstalled('node')) {
    print.error('Node.js is not installed. Please install Node.js v16+ and try again.');
    process.exit(1);
  }
  const nodeVersion = execSync('node -v').toString().trim();
  print.success(`✅ Node.js ${nodeVersion} is installed.`);
  
  // Check npm
  if (!isToolInstalled('npm')) {
    print.error('npm is not installed. Please install npm and try again.');
    process.exit(1);
  }
  const npmVersion = execSync('npm -v').toString().trim();
  print.success(`✅ npm ${npmVersion} is installed.`);
  
  // Check AWS CLI (optional)
  if (!isToolInstalled('aws')) {
    print.warning('⚠️ AWS CLI is not installed. It is recommended for AWS service setup.');
    const installAws = await question('Do you want to continue without AWS CLI? (y/n) ');
    if (installAws.toLowerCase() !== 'y') {
      print.info('Please install AWS CLI and configure it with your credentials, then run this script again.');
      process.exit(0);
    }
  } else {
    const awsVersion = execSync('aws --version').toString().trim();
    print.success(`✅ ${awsVersion} is installed.`);
  }
  
  // Step 2: Install dependencies
  print.title('Step 2: Installing Dependencies');
  if (!runCommand('npm install', 'Failed to install dependencies')) {
    const retry = await question('Do you want to retry installing dependencies? (y/n) ');
    if (retry.toLowerCase() === 'y') {
      if (!runCommand('npm install', 'Failed to install dependencies again')) {
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
  print.success('✅ Dependencies installed successfully.');
  
  // Step 3: Set up environment variables
  print.title('Step 3: Setting Up Environment Variables');
  
  // Check if .env.local exists
  const envPath = path.resolve(process.cwd(), '.env.local');
  let createNewEnv = false;
  
  if (fs.existsSync(envPath)) {
    print.info('An .env.local file already exists.');
    const overwrite = await question('Do you want to overwrite it? (y/n) ');
    createNewEnv = overwrite.toLowerCase() === 'y';
  } else {
    createNewEnv = true;
  }
  
  if (createNewEnv) {
    print.step('Creating new .env.local file...');
    
    // Get AWS configuration
    print.info('Please provide your AWS configuration:');
    const awsRegion = await question('AWS Region (default: us-east-1): ') || 'us-east-1';
    const awsAccessKey = await question('AWS Access Key ID: ');
    const awsSecretKey = await question('AWS Secret Access Key: ');
    const awsCognitoPoolId = await question('AWS Cognito User Pool ID (leave blank to set up later): ');
    const awsCognitoClientId = await question('AWS Cognito App Client ID (leave blank to set up later): ');
    const awsS3Bucket = await question('AWS S3 Bucket Name (default: vadm-volunteer-files): ') || 'vadm-volunteer-files';
    const awsSnsTopicArn = await question('AWS SNS Topic ARN (leave blank to set up later): ');
    
    // Get database configuration
    print.info('\nPlease provide your database configuration:');
    const dbHost = await question('Database Host (default: localhost): ') || 'localhost';
    const dbPort = await question('Database Port (default: 3306): ') || '3306';
    const dbName = await question('Database Name (default: volunteer_volume): ') || 'volunteer_volume';
    const dbUser = await question('Database Username (default: root): ') || 'root';
    const dbPassword = await question('Database Password: ');
    
    // Generate database URL
    const dbUrl = `mysql://${dbUser}:${encodeURIComponent(dbPassword)}@${dbHost}:${dbPort}/${dbName}`;
    
    // Get Google Calendar API configuration
    print.info('\nPlease provide your Google Calendar configuration:');
    const googleApiKey = await question('Google Calendar API Key (leave blank to set up later): ');
    const googleCalendarId = await question('Google Calendar ID (leave blank to set up later): ');
    
    // Generate NEXTAUTH_SECRET
    const nextAuthSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Create .env.local content
    const envContent = `# AWS Configuration
NEXT_PUBLIC_AWS_REGION=${awsRegion}
NEXT_PUBLIC_AWS_COGNITO_REGION=${awsRegion}
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=${awsCognitoPoolId || 'your-user-pool-id'}
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_WEB_CLIENT_ID=${awsCognitoClientId || 'your-client-id'}
AWS_ACCESS_KEY_ID=${awsAccessKey || 'your-aws-access-key'}
AWS_SECRET_ACCESS_KEY=${awsSecretKey || 'your-aws-secret-key'}
NEXT_PUBLIC_AWS_S3_BUCKET=${awsS3Bucket}
NEXT_PUBLIC_AWS_SNS_TOPIC_ARN=${awsSnsTopicArn || 'your-sns-topic-arn'}

# Database
DATABASE_URL=${dbUrl}

# Google Calendar
GOOGLE_CALENDAR_API_KEY=${googleApiKey || 'your-google-api-key'}
GOOGLE_CALENDAR_ID=${googleCalendarId || 'your-calendar-id'}

# App Settings
NEXTAUTH_SECRET=${nextAuthSecret}
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development`;
    
    // Write to .env.local
    fs.writeFileSync(envPath, envContent);
    print.success('✅ .env.local file created successfully.');
  }
  
  // Step 4: Set up AWS services if needed
  print.title('Step 4: Setting Up AWS Services');
  const setupAws = await question('Do you want to set up AWS services now? (y/n) ');
  
  if (setupAws.toLowerCase() === 'y') {
    print.step('Running AWS service setup...');
    
    // Make setup scripts executable
    if (process.platform !== 'win32') {
      runCommand('chmod +x aws-setup/*.js', 'Failed to make AWS setup scripts executable');
    }
    
    // Run AWS setup script
    if (!runCommand('node aws-setup/setup-all.js', 'Failed to set up AWS services')) {
      print.warning('⚠️ AWS service setup encountered issues. You may need to set these up manually later.');
    } else {
      print.success('✅ AWS services set up successfully.');
    }
  } else {
    print.info('Skipping AWS service setup. You can set them up later using the scripts in the aws-setup directory.');
  }
  
  // Step 5: Set up database
  print.title('Step 5: Setting Up Database');
  
  // Generate Prisma client
  print.step('Generating Prisma client...');
  if (!runCommand('npx prisma generate', 'Failed to generate Prisma client')) {
    print.error('Failed to generate Prisma client. Please fix the issues and try again.');
    process.exit(1);
  }
  
  // Push database schema
  print.step('Pushing database schema to your database...');
  const pushDb = await question('Do you want to push the schema to your database now? (y/n) ');
  
  if (pushDb.toLowerCase() === 'y') {
    if (!runCommand('npx prisma db push', 'Failed to push database schema')) {
      print.error('Database schema push failed. Please check your database connection and try again.');
      process.exit(1);
    }
    print.success('✅ Database schema pushed successfully.');
  } else {
    print.info('Skipping database schema push. You can do this later by running: npx prisma db push');
  }
  
  // Step 6: Setup complete
  print.title('🎉 Setup Complete!');
  print.info('Volunteer Volume setup is complete. You can now start the development server:');
  print.step('npm run dev');
  print.info('\nVisit http://localhost:3000 in your browser to see the application.');
  print.info('\nAdditional Information:');
  print.info('- To set up AWS services later, run: node aws-setup/setup-all.js');
  print.info('- To update the database schema, run: npx prisma db push');
  print.info('- To generate Prisma client after schema changes: npx prisma generate');
  print.info('- For production deployment, follow the instructions in aws-setup/aws-setup.txt');
  
  rl.close();
}

// Run the setup
setup().catch(error => {
  print.error(`Setup failed: ${error.message}`);
  process.exit(1);
}); 