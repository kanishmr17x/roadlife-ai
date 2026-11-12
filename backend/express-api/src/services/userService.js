const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// In-memory store used when MongoDB is not connected (e.g. offline tests or local development without Atlas)
const inMemoryUsers = new Map();

/**
 * Seed initial test accounts into memory with proper bcrypt hashes
 */
async function initializeSeedUsers() {
  if (inMemoryUsers.size > 0) return;

  const citizenHash = await bcrypt.hash('CitizenPass123!', 10);
  const contractorHash = await bcrypt.hash('ContractorPass123!', 10);
  const pendingContractorHash = await bcrypt.hash('ContractorPass123!', 10);
  const govHash = await bcrypt.hash('GovOfficerPass123!', 10);

  const seedRecords = [
    {
      id: 'usr-cit-101',
      email: 'citizen@roadsense.local',
      passwordHash: citizenHash,
      fullName: 'Priya Sharma (Citizen Inspector)',
      role: 'CITIZEN',
      status: 'ACTIVE',
      isApproved: true,
      phone: '+91 98765 43210'
    },
    {
      id: 'usr-con-202',
      email: 'contractor@buildinfra.in',
      passwordHash: contractorHash,
      fullName: 'Vikram Patel (BuildInfra EPC)',
      role: 'CONTRACTOR',
      status: 'ACTIVE',
      isApproved: true,
      companyName: 'BuildInfra EPC Ltd.',
      licenseNumber: 'KA-BLR-CON-2024-889',
      phone: '+91 98450 11223'
    },
    {
      id: 'usr-con-pending',
      email: 'pending@apexroads.com',
      passwordHash: pendingContractorHash,
      fullName: 'Rajesh Verma (Apex Infra)',
      role: 'CONTRACTOR',
      status: 'PENDING_APPROVAL',
      isApproved: false,
      companyName: 'Apex Infra Projects',
      licenseNumber: 'KA-MYS-CON-2025-012',
      phone: '+91 99000 55443'
    },
    {
      id: 'usr-gov-303',
      email: 'officer@pwd.gov.in',
      passwordHash: govHash,
      fullName: 'Dr. Suresh Kumar (Superintending Engineer)',
      role: 'MUNICIPAL_AUTHORITY',
      status: 'ACTIVE',
      isApproved: true,
      department: 'Public Works Department (BBMP Zone)',
      phone: '+91 80 2221 4455'
    }
  ];

  // Development & Test Accounts (Strictly disabled in production)
  if (process.env.NODE_ENV !== 'production') {
    const devPassHash = await bcrypt.hash('1234', 10);
    seedRecords.push(
      {
        id: 'usr-dev-kanish1',
        email: 'kanish1@gmail.com',
        passwordHash: devPassHash,
        fullName: 'Kanish Citizen',
        role: 'CITIZEN',
        status: 'ACTIVE',
        isApproved: true,
        phone: '+91 90000 00001'
      },
      {
        id: 'usr-dev-kanish2',
        email: 'kanish2@gmail.com',
        passwordHash: devPassHash,
        fullName: 'Kanish Contractor',
        role: 'CONTRACTOR',
        status: 'ACTIVE',
        isApproved: true,
        companyName: 'Kanish Road Infra Ltd.',
        licenseNumber: 'KA-CON-2026-DEV-001',
        phone: '+91 90000 00002'
      },
      {
        id: 'usr-dev-kanish3',
        email: 'kanish3@gmail.com',
        passwordHash: devPassHash,
        fullName: 'Kanish Municipal Officer',
        role: 'MUNICIPAL_AUTHORITY',
        status: 'ACTIVE',
        isApproved: true,
        department: 'Municipal Road & Infrastructure Authority',
        phone: '+91 90000 00003'
      }
    );
  }

  for (const record of seedRecords) {
    inMemoryUsers.set(record.email.toLowerCase(), {
      ...record,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(candidate) {
        return bcrypt.compare(candidate, this.passwordHash);
      },
      toJSON() {
        const copy = { ...this };
        delete copy.passwordHash;
        return copy;
      }
    });
  }
}

// Auto-seed immediately
initializeSeedUsers().catch(console.error);

const userService = {
  /**
   * Reset in-memory users (useful for test isolation)
   */
  async resetForTesting() {
    inMemoryUsers.clear();
    await initializeSeedUsers();
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const normalized = (email || '').toLowerCase().trim();
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const user = await User.findOne({ email: normalized });
        if (user) return user;
      } catch (err) {
        // Fall back to in-memory on DB read error
      }
    }
    return inMemoryUsers.get(normalized) || null;
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(id);
        if (user) return user;
      } catch (err) {
        // Fall back to in-memory on DB read error
      }
    }
    for (const u of inMemoryUsers.values()) {
      if (u.id === id || (u._id && u._id.toString() === id)) {
        return u;
      }
    }
    return null;
  },

  /**
   * Create a new user
   */
  async createUser(userData) {
    const normalizedEmail = userData.email.toLowerCase().trim();
    const existing = await this.findByEmail(normalizedEmail);
    if (existing) {
      const error = new Error('An account with this email address already exists');
      error.statusCode = 409;
      throw error;
    }

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const user = new User({
          ...userData,
          email: normalizedEmail
        });
        await user.save();
        return user;
      } catch (err) {
        // Fall back to in-memory
      }
    }

    const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
    const memoryRecord = {
      id,
      ...userData,
      email: normalizedEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(candidate) {
        return bcrypt.compare(candidate, this.passwordHash);
      },
      toJSON() {
        const copy = { ...this };
        delete copy.passwordHash;
        return copy;
      }
    };
    inMemoryUsers.set(normalizedEmail, memoryRecord);
    return memoryRecord;
  }
};

module.exports = userService;
