const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');

describe('Database Connection Module (Unit)', () => {
  test('1. Importing db.js does not connect automatically', () => {
    // readyState 0 = disconnected
    assert.equal(
      mongoose.connection.readyState,
      0,
      'Expected mongoose to be in disconnected state (0) upon module import'
    );
  });

  test('2. connectDB throws explicit error when MONGO_URI is missing', async () => {
    const originalUri = process.env.MONGO_URI;
    delete process.env.MONGO_URI;

    try {
      await assert.rejects(
        async () => {
          await connectDB();
        },
        (err) => {
          assert.equal(err.message, 'MONGO_URI is not defined. Please set it in your environment.');
          return true;
        }
      );
    } finally {
      if (originalUri !== undefined) {
        process.env.MONGO_URI = originalUri;
      }
    }
  });

  test('3. connectDB throws explicit error when MONGO_URI is empty whitespace', async () => {
    await assert.rejects(
      async () => {
        await connectDB('   ');
      },
      (err) => {
        assert.equal(err.message, 'MONGO_URI is not defined. Please set it in your environment.');
        return true;
      }
    );
  });
});
