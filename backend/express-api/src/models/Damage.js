const mongoose = require('mongoose');

/**
 * GeoJSON Point Subschema.
 * GeoJSON standard specifies coordinate ordering as [longitude, latitude].
 * Note: Coordinate bounds validation ensures numbers are in range (-180..180, -90..90).
 * It cannot detect swapped coordinates if both numbers fall within overlapping valid ranges (-90..90).
 */
const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates array [longitude, latitude] is required'],
      validate: [
        {
          validator: function (val) {
            // Must be an array of exactly 2 finite numbers
            if (!Array.isArray(val) || val.length !== 2) {
              return false;
            }
            const [lng, lat] = val;
            return (
              typeof lng === 'number' &&
              Number.isFinite(lng) &&
              typeof lat === 'number' &&
              Number.isFinite(lat)
            );
          },
          message: 'Coordinates must be an array of exactly two finite numbers: [longitude, latitude]'
        },
        {
          validator: function (val) {
            if (!Array.isArray(val) || val.length !== 2) return false;
            const [lng] = val;
            return lng >= -180 && lng <= 180;
          },
          message: 'Longitude must be between -180 and 180 degrees'
        },
        {
          validator: function (val) {
            if (!Array.isArray(val) || val.length !== 2) return false;
            const [, lat] = val;
            return lat >= -90 && lat <= 90;
          },
          message: 'Latitude must be between -90 and 90 degrees'
        }
      ]
    }
  },
  { _id: false }
);

/**
 * Embedded Machine Learning Assessment Schema.
 * Confidence score is standardized on a 0.0 to 1.0 probability scale.
 */
const mlAssessmentSchema = new mongoose.Schema(
  {
    predictedSeverity: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        message: '{VALUE} is not a valid predicted severity'
      }
    },
    estimatedCost: {
      type: Number,
      min: [0, 'Estimated cost cannot be negative']
    },
    confidenceScore: {
      type: Number,
      min: [0, 'Confidence score must be >= 0.0'],
      max: [1, 'Confidence score must be <= 1.0']
    }
  },
  { _id: false }
);

/**
 * Embedded Weather Snapshot Schema.
 * Precipitation probability is standardized on a 0 to 100 percentage scale.
 */
const weatherSnapshotSchema = new mongoose.Schema(
  {
    temperature: {
      type: Number,
      validate: {
        validator: (v) => v === undefined || Number.isFinite(v),
        message: 'Temperature must be a finite number'
      }
    },
    precipitationProbability: {
      type: Number,
      min: [0, 'Precipitation probability must be >= 0%'],
      max: [100, 'Precipitation probability must be <= 100%']
    },
    isConstructionSafe: {
      type: Boolean
    }
  },
  { _id: false }
);

/**
 * Embedded Repair Estimate Schema.
 */
const repairEstimateSchema = new mongoose.Schema(
  {
    materialKg: {
      type: Number,
      min: [0, 'Material kg cannot be negative']
    },
    workersNeeded: {
      type: Number,
      min: [0, 'Workers count cannot be negative']
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative']
    },
    estimatedCostINR: {
      type: Number,
      min: [0, 'Estimated cost INR cannot be negative']
    }
  },
  { _id: false }
);

const damageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Damage title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    damageType: {
      type: String,
      required: [true, 'Damage type is required'],
      enum: {
        values: ['pothole', 'crack', 'rutting', 'ravelling', 'edge_failure', 'other'],
        message: '{VALUE} is not a valid damage type'
      }
    },
    severity: {
      type: String,
      required: [true, 'Damage severity is required'],
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        message: '{VALUE} is not a valid severity level'
      },
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: {
        values: ['SUBMITTED', 'VERIFIED', 'IN_PROGRESS', 'REPAIRED', 'CLOSED'],
        message: '{VALUE} is not a valid damage status'
      },
      default: 'SUBMITTED'
    },
    photoUrl: {
      type: String,
      trim: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    address: {
      type: String,
      trim: true
    },
    location: {
      type: pointSchema,
      required: [true, 'Location is required'],
      validate: {
        validator: function (loc) {
          return Boolean(loc && Array.isArray(loc.coordinates) && loc.coordinates.length === 2);
        },
        message: 'Location with valid [longitude, latitude] coordinates is required'
      }
    },
    mlAssessment: {
      type: mlAssessmentSchema,
      required: false
    },
    weatherSnapshot: {
      type: weatherSnapshotSchema,
      required: false
    },
    repairEstimate: {
      type: repairEstimateSchema,
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Register 2dsphere index for geospatial queries
damageSchema.index({ location: '2dsphere' });

const Damage = mongoose.models.Damage || mongoose.model('Damage', damageSchema);

module.exports = Damage;
