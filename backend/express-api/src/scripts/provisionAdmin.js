#!/usr/bin/env node
/**
 * Municipal Administrator Provisioning CLI Script
 * 
 * Usage:
 *   node src/scripts/provisionAdmin.js --email=officer.admin@pwd.gov.in --password=StrongPassword123! --name="Chief Engineer" --dept="State PWD"
 * Or via environment variables:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node src/scripts/provisionAdmin.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const userService = require('../services/userService');
const { connectDB } = require('../config/db');

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      args[key] = value;
    }
  });
  return args;
}

async function main() {
  const args = parseArgs();
  const email = (args.email || process.env.ADMIN_EMAIL || '').trim();
  const password = args.password || process.env.ADMIN_PASSWORD;
  const fullName = (args.name || process.env.ADMIN_NAME || 'Municipal Executive Administrator').trim();
  const department = (args.dept || process.env.ADMIN_DEPT || 'Public Works Department').trim();

  if (!email || !email.includes('@')) {
    console.error('[-] Error: Valid email address is required.');
    console.error('    Pass via --email=<email> or set ADMIN_EMAIL environment variable.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('[-] Error: A secure password of at least 8 characters is required.');
    console.error('    Pass via --password=<password> or set ADMIN_PASSWORD environment variable.');
    process.exit(1);
  }

  console.log(`[*] Connecting to database to provision administrator: ${email}...`);

  if (process.env.MONGO_URI) {
    try {
      await connectDB();
      console.log('[+] Connected to MongoDB Atlas.');
    } catch (err) {
      console.warn('[!] Note: MongoDB connection failed, provisioning into local storage repository.');
    }
  }

  const existing = await userService.findByEmail(email);
  if (existing) {
    console.log(`[*] Account ${email} already exists. Updating credentials and elevating to MUNICIPAL_AUTHORITY...`);
    existing.passwordHash = await bcrypt.hash(password, 10);
    existing.role = 'MUNICIPAL_AUTHORITY';
    existing.status = 'ACTIVE';
    existing.isApproved = true;
    existing.fullName = fullName;
    existing.department = department;
    if (typeof existing.save === 'function') {
      await existing.save();
    }
    console.log('[+] Administrator account successfully updated and elevated.');
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await userService.createUser({
      email,
      passwordHash,
      fullName,
      role: 'MUNICIPAL_AUTHORITY',
      status: 'ACTIVE',
      isApproved: true,
      department
    });
    console.log('[+] New Municipal Administrator account created successfully.');
  }

  console.log('----------------------------------------------------');
  console.log(`Email:      ${email}`);
  console.log(`Role:       MUNICIPAL_AUTHORITY`);
  console.log(`Full Name:  ${fullName}`);
  console.log(`Department: ${department}`);
  console.log(`Status:     ACTIVE (Approved)`);
  console.log('----------------------------------------------------');
  console.log('[+] Provisioning completed safely. Passwords are never logged in plaintext.');

  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('[-] Fatal provisioning error:', err.message);
  process.exit(1);
});
