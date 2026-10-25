const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address format']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters']
    },
    role: {
      type: String,
      required: true,
      enum: ['CITIZEN', 'CONTRACTOR', 'MUNICIPAL_AUTHORITY', 'GOVERNMENT', 'ADMIN'],
      default: 'CITIZEN'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    isApproved: {
      type: Boolean,
      default: true
    },
    department: {
      type: String,
      trim: true
    },
    companyName: {
      type: String,
      trim: true
    },
    licenseNumber: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Compare plaintext password with stored bcrypt hash
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash || !candidatePassword) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Remove sensitive credentials from API serialization
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

/**
 * Idempotently seed development test accounts in MongoDB
 * Strictly gated to non-production environments
 */
userSchema.statics.seedDevelopmentAccounts = async function () {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const devAccounts = [
    {
      email: 'kanish1@gmail.com',
      password: '1234',
      fullName: 'Kanish Citizen',
      role: 'CITIZEN',
      status: 'ACTIVE',
      isApproved: true,
      phone: '+91 90000 00001'
    },
    {
      email: 'kanish2@gmail.com',
      password: '1234',
      fullName: 'Kanish Contractor',
      role: 'CONTRACTOR',
      status: 'ACTIVE',
      isApproved: true,
      companyName: 'Kanish Road Infra Ltd.',
      licenseNumber: 'KA-CON-2026-DEV-001',
      phone: '+91 90000 00002'
    },
    {
      email: 'kanish3@gmail.com',
      password: '1234',
      fullName: 'Kanish Municipal Officer',
      role: 'MUNICIPAL_AUTHORITY',
      status: 'ACTIVE',
      isApproved: true,
      department: 'Municipal Road & Infrastructure Authority',
      phone: '+91 90000 00003'
    }
  ];

  for (const account of devAccounts) {
    const existing = await this.findOne({ email: account.email.toLowerCase() });
    if (!existing) {
      const passwordHash = await bcrypt.hash(account.password, 10);
      const user = new this({
        ...account,
        passwordHash
      });
      await user.save();
    }
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
