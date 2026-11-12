const express = require('express');
const mongoose = require('mongoose');
const Damage = require('../models/Damage');

const router = express.Router();

// In-memory damages fallback when MongoDB is offline
const inMemoryDamages = new Map();

/**
 * Normalizes damage type for database storage
 */
function normalizeDamageType(type) {
  if (!type) return 'other';
  const lower = String(type).toLowerCase().trim();
  if (lower.includes('pothole')) return 'pothole';
  if (lower.includes('crack')) return 'crack';
  if (lower.includes('rut')) return 'rutting';
  if (lower.includes('ravel')) return 'ravelling';
  if (lower.includes('edge')) return 'edge_failure';
  return 'other';
}

/**
 * Normalizes damage severity
 */
function normalizeSeverity(sev) {
  if (!sev) return 'MEDIUM';
  const upper = String(sev).toUpperCase().trim();
  if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(upper)) {
    return upper;
  }
  return 'MEDIUM';
}

/**
 * Format document for frontend DamageRecord contract
 */
function formatDamageRecord(doc) {
  const d = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const id = d._id ? d._id.toString() : (d.id || `DMG-${Date.now().toString(36).toUpperCase()}`);
  return {
    id,
    _id: id,
    title: d.title,
    description: d.description || '',
    damageType: d.damageType,
    severity: d.severity || 'MEDIUM',
    status: d.status || 'REPORTED',
    location: d.location || { type: 'Point', coordinates: [0, 0] },
    address: d.address || '',
    roadName: d.roadName || '',
    photoUrl: d.photoUrl || undefined,
    reporterName: d.reporterName || 'Citizen Observer',
    reportedAt: d.createdAt ? d.createdAt.toISOString() : (d.reportedAt || new Date().toISOString()),
    repairEstimate: d.repairEstimate || undefined
  };
}

/**
 * GET /api/damages
 * Fetch all registered road damage reports
 */
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const docs = await Damage.find().sort({ createdAt: -1 }).limit(100);
      return res.status(200).json(docs.map(formatDamageRecord));
    }
  } catch (err) {
    // Fall back to in-memory on database read failure
  }

  const memoryList = Array.from(inMemoryDamages.values()).reverse();
  return res.status(200).json(memoryList.map(formatDamageRecord));
});

/**
 * GET /api/damages/nearby
 * Geospatial proximity search using 2dsphere index
 */
router.get('/nearby', async (req, res) => {
  const lng = parseFloat(req.query.lng);
  const lat = parseFloat(req.query.lat);
  const maxDistanceMeters = parseFloat(req.query.maxDistance) || 5000;

  if (isNaN(lng) || isNaN(lat)) {
    return res.status(400).json({ error: 'Valid lng and lat query parameters are required.' });
  }

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const docs = await Damage.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: maxDistanceMeters
          }
        }
      }).limit(50);
      return res.status(200).json(docs.map(formatDamageRecord));
    }
  } catch (err) {
    // Fall back to distance calculation on in-memory store
  }

  // Linear distance calculation fallback
  const results = [];
  for (const item of inMemoryDamages.values()) {
    const [iLng, iLat] = (item.location && item.location.coordinates) || [0, 0];
    const dLat = (lat - iLat) * 111320;
    const dLng = (lng - iLng) * 111320 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist <= maxDistanceMeters) {
      results.push(formatDamageRecord(item));
    }
  }

  return res.status(200).json(results);
});

/**
 * GET /api/damages/:id
 * Retrieve a single damage report by ID
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const doc = await Damage.findById(id);
        if (doc) return res.status(200).json(formatDamageRecord(doc));
      }
    }
  } catch (err) {
    // Fall back to memory
  }

  const memoryItem = inMemoryDamages.get(id);
  if (memoryItem) {
    return res.status(200).json(formatDamageRecord(memoryItem));
  }

  return res.status(404).json({ error: 'Damage report not found.' });
});

/**
 * POST /api/damages
 * Create and register a new road damage report
 */
router.post('/', async (req, res) => {
  const {
    title,
    description,
    damageType,
    severity,
    location,
    address,
    roadName,
    photoUrl,
    repairEstimate
  } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Damage report title is required.' });
  }

  if (!location || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
    return res.status(400).json({
      error: 'Location with valid [longitude, latitude] coordinates array is required.'
    });
  }

  const [lng, lat] = location.coordinates.map(Number);
  if (isNaN(lng) || isNaN(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    return res.status(400).json({
      error: 'Coordinates must be valid finite numbers: longitude (-180..180), latitude (-90..90).'
    });
  }

  const normalizedType = normalizeDamageType(damageType);
  const normalizedSev = normalizeSeverity(severity);

  const payload = {
    title: title.trim(),
    description: (description || '').trim(),
    damageType: normalizedType,
    severity: normalizedSev,
    status: 'SUBMITTED',
    location: {
      type: 'Point',
      coordinates: [lng, lat]
    },
    address: (address || '').trim(),
    roadName: (roadName || '').trim(),
    photoUrl: photoUrl || undefined,
    repairEstimate: repairEstimate || undefined,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const doc = new Damage(payload);
      await doc.save();
      return res.status(201).json(formatDamageRecord(doc));
    }
  } catch (dbErr) {
    // Log and continue to memory persistence
  }

  const id = `DMG-${Date.now().toString(36).toUpperCase()}`;
  const memoryRecord = { id, _id: id, ...payload };
  inMemoryDamages.set(id, memoryRecord);

  return res.status(201).json(formatDamageRecord(memoryRecord));
});

module.exports = router;
