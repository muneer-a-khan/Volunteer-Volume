#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Prompt for input with a promise wrapper
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    try {
        console.log('🔐 Create Root Admin User Tool 🔐');
        console.log('--------------------------------');
        console.log('This tool will create a root administrator account with full system privileges.');
        console.log('');

        // Get admin secret from environment or user input
        let adminSecret = process.env.ADMIN_SECRET;
        if (!adminSecret) {
            adminSecret = await prompt('Enter the admin secret (or set ADMIN_SECRET in .env): ');
            if (!adminSecret) {
                console.error('❌ Error: Admin secret is required');
                return;
            }
        }

        // Get user details
        const name = await prompt('Enter admin name: ');
        const email = await prompt('Enter admin email: ');
        const password = await prompt('Enter admin password (min 8 characters): ');

        if (!name || !email || !password) {
            console.error('❌ Error: All fields are required');
            return;
        }

        if (password.length < 8) {
            console.error('❌ Error: Password must be at least 8 characters');
            return;
        }

        // Start the server in the background if not already running
        let serverRunning = false;
        try {
            // Try to make a request to check if the server is running
            await axios.get('http://localhost:3000/api/health');
            serverRunning = true;
            console.log('✅ Server is already running');
        } catch (error) {
            console.log('🚀 Starting development server...');
            try {
                // Start the server in a detached process
                execSync('npm run dev -- --no-open', { stdio: 'ignore', detached: true });
                console.log('✅ Server started');

                // Wait a moment for server to initialize
                console.log('⏳ Waiting for server to initialize...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (startError) {
                console.error('❌ Error starting server:', startError.message);
                return;
            }
        }

        // Make API request to create root admin
        console.log('⏳ Creating root admin user...');
        const response = await axios.post('http://localhost:3000/api/admin/create-root-user', {
            adminSecret,
            name,
            email,
            password
        });

        console.log('');
        console.log(response.data.message);
        console.log('');

        if (response.data.user) {
            console.log('✅ Admin user created successfully:');
            console.log(`Name: ${response.data.user.name}`);
            console.log(`Email: ${response.data.user.email}`);
            console.log(`Role: ${response.data.user.role}`);
            console.log(`User ID: ${response.data.user.id}`);
        } else if (response.data.userId) {
            console.log(`User ID: ${response.data.userId}`);
        }

        // Prompt to shut down the server if we started it
        if (!serverRunning) {
            const shutdownServer = await prompt('Would you like to shut down the development server? (y/n): ');
            if (shutdownServer.toLowerCase() === 'y') {
                console.log('Shutting down server...');
                // This is a simplified approach - in a real scenario you'd want to properly terminate the process
                execSync('pkill -f "next dev"', { stdio: 'ignore' });
                console.log('Server stopped');
            }
        }

        console.log('');
        console.log('You can now log in to the application with the admin credentials.');
    } catch (error) {
        console.error('❌ Error:', error.response?.data?.message || error.message);
    } finally {
        rl.close();
    }
}

main(); 