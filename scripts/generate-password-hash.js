#!/usr/bin/env node

/**
 * Generate bcrypt password hash for ZenConsole users
 * Usage: node scripts/generate-password-hash.js <password>
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Password is required');
  console.log('\nUsage:');
  console.log('  node scripts/generate-password-hash.js <password>');
  console.log('\nExample:');
  console.log('  node scripts/generate-password-hash.js MyNewPassword123');
  process.exit(1);
}

console.log('🔐 Generating bcrypt hash...\n');

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('✅ Password hash generated successfully!\n');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('\n📋 Copy the hash above and use it in your SQL query.\n');
console.log('Example SQL:');
console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'your-email@example.com';`);
console.log('');
