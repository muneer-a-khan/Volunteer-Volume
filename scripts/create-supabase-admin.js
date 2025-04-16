#!/usr/bin/env node

const readline = require('readline');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

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

async function createRootAdmin() {
  try {
    console.log('🔐 Create Root Admin User Tool 🔐');
    console.log('--------------------------------');
    console.log('This tool will create a root administrator account directly in Supabase');
    console.log('');

    // Check for required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Error: Missing required environment variables.');
      console.log('Please ensure these variables are set in your .env file:');
      console.log('- NEXT_PUBLIC_SUPABASE_URL');
      console.log('- SUPABASE_SERVICE_ROLE_KEY');
      return;
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

    // Initialize Supabase client with service role key (admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Hash the password
    console.log('⏳ Hashing password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Check if user already exists
    console.log('⏳ Checking if user already exists...');
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', email)
      .maybeSingle();

    if (existingError) {
      console.error('❌ Error checking existing user:', existingError.message);
      return;
    }

    if (existingUser) {
      console.log('ℹ️ User with this email already exists');
      
      if (existingUser.role === 'ADMIN') {
        console.log('✅ User already has ADMIN role. No changes needed.');
        console.log(`User ID: ${existingUser.id}`);
        return;
      }
      
      // Update existing user to ADMIN role
      console.log('⏳ Upgrading user to ADMIN role...');
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ role: 'ADMIN' })
        .eq('id', existingUser.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('❌ Error updating user role:', updateError.message);
        return;
      }
      
      console.log('✅ User role updated to ADMIN successfully');
      console.log(`User ID: ${updatedUser.id}`);
      return;
    }

    // Create new user with UUID
    console.log('⏳ Creating admin user...');
    const userId = uuidv4();
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating admin user:', insertError.message);
      return;
    }

    console.log('');
    console.log('✅ Root admin user created successfully:');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Role: ADMIN`);
    console.log(`User ID: ${userId}`);
    console.log('');
    console.log('You can now log in to the application with these admin credentials.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

createRootAdmin(); 