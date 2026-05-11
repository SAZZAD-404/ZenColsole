#!/usr/bin/env node

/**
 * Create User Script for ZenConsole
 * 
 * Usage:
 *   node scripts/create-user.js
 * 
 * This will generate SQL to create a user with bcrypt hashed password
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🔐 ZenConsole User Creator\n');
  console.log('This will generate SQL to create a user in Supabase.\n');

  try {
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const role = await question('Role (admin/user) [default: user]: ') || 'user';

    if (!username || !email || !password) {
      console.error('\n❌ Username, email, and password are required!');
      process.exit(1);
    }

    console.log('\n⏳ Generating password hash...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('\n✅ Hash generated! Copy and run this SQL in Supabase SQL Editor:\n');
    console.log('─'.repeat(80));
    console.log(`
-- Create user: ${username}
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '${username}',
  '${email}',
  '${passwordHash}',
  '${role}',
  true,
  NOW(),
  NOW()
);

-- Verify user created
SELECT username, email, role, is_active, created_at
FROM users 
WHERE email = '${email}';
`);
    console.log('─'.repeat(80));
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log('\n⚠️  Keep these credentials safe!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
