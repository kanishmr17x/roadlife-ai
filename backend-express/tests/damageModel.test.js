const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const Damage = require('../src/models/Damage');

describe('Damage Mongoose Model Validation (Offline/No-DB)', () => {
  const baseValidData = {
    title: 'Severe Pothole on MG Road',
    description: 'Deep pothole in the center lane',
    damageType: 'pothole',
    severity: 'HIGH',
    status: 'SUBMITTED',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // [longitude, latitude] standard Bangalore coordinates
    }
  };

  test('1. Valid damage record passes document validation', async () => {
    const doc = new Damage(baseValidData);
    await assert.doesNotReject(async () => {
      await doc.validate();
    }, 'Expected valid document to have no validation errors');
  });

  test('2. Missing location or coordinates fails validation', async () => {
    // Missing location entirely
    const noLocation = new Damage({
      title: 'Pothole',
      damageType: 'pothole',
      severity: 'LOW'
    });
    await assert.rejects(
      async () => {
        await noLocation.validate();
      },
      (err) => {
        assert.ok(err.errors['location'] || err.errors['location.coordinates']);
        return true;
      }
    );

    // Missing coordinates
    const noCoords = new Damage({
      ...baseValidData,
      location: { type: 'Point' }
    });
    await assert.rejects(
      async () => {
        await noCoords.validate();
      },
      (err) => {
        assert.ok(err.errors['location.coordinates'] || err.errors['location']);
        return true;
      }
    );
  });

  test('3. Longitude outside -180 to 180 fails validation', async () => {
    const tooHighLng = new Damage({
      ...baseValidData,
      location: { type: 'Point', coordinates: [180.001, 12.9716] }
    });
    await assert.rejects(
      async () => {
        await tooHighLng.validate();
      },
      (err) => {
        assert.match(err.errors['location.coordinates'].message, /Longitude must be between -180 and 180/);
        return true;
      }
    );

    const tooLowLng = new Damage({
      ...baseValidData,
      location: { type: 'Point', coordinates: [-180.001, 12.9716] }
    });
    await assert.rejects(
      async () => {
        await tooLowLng.validate();
      },
      (err) => {
        assert.match(err.errors['location.coordinates'].message, /Longitude must be between -180 and 180/);
        return true;
      }
    );
  });

  test('4. Latitude outside -90 to 90 fails validation', async () => {
    const tooHighLat = new Damage({
      ...baseValidData,
      location: { type: 'Point', coordinates: [77.5946, 90.001] }
    });
    await assert.rejects(
      async () => {
        await tooHighLat.validate();
      },
      (err) => {
        assert.match(err.errors['location.coordinates'].message, /Latitude must be between -90 and 90/);
        return true;
      }
    );

    const tooLowLat = new Damage({
      ...baseValidData,
      location: { type: 'Point', coordinates: [77.5946, -90.001] }
    });
    await assert.rejects(
      async () => {
        await tooLowLat.validate();
      },
      (err) => {
        assert.match(err.errors['location.coordinates'].message, /Latitude must be between -90 and 90/);
        return true;
      }
    );
  });

  test('5. Non-finite, non-numeric, or incorrectly sized coordinate arrays fail validation', async () => {
    // Array of 1 element
    const oneElement = new Damage({
      ...baseValidData,
      location: { type: 'Point', coordinates: [77.5946] }
    });
    await assert.rejects(async () => {
      await oneElement.validate();
    });

    // Array of 3 elements
    const threeElements = new Damage({
      ...baseValidData,
      location: { type: 'Point', coordinates: [77.5946, 12.9716, 500] }
    });
    await assert.rejects(async () => {
      await threeElements.validate();
    });

    // NaN element
    const nanCoords = new Damage({
      ...baseValidData,
      location: { type: 'Point', coordinates: [NaN, 12.9716] }
    });
    await assert.rejects(async () => {
      await nanCoords.validate();
    });

    // String / non-numeric element
    const strCoords = new Damage({
      ...baseValidData,
      location: { type: 'Point', coordinates: ['invalid', 12.9716] }
    });
    await assert.rejects(async () => {
      await strCoords.validate();
    });
  });

  test('6. 2dsphere index is registered on location', () => {
    const indexes = Damage.schema.indexes();
    const has2dSphere = indexes.some(
      (idx) => idx[0] && idx[0].location === '2dsphere'
    );
    assert.ok(has2dSphere, 'Expected schema to register a 2dsphere index on location field');
  });

  test('7. Optional ML, weather, and repair fields can be absent without error', async () => {
    const minimalDoc = new Damage({
      title: 'Crack on Road',
      damageType: 'crack',
      severity: 'LOW',
      location: {
        type: 'Point',
        coordinates: [77.5, 12.9]
      }
    });
    await assert.doesNotReject(async () => {
      await minimalDoc.validate();
    });
    assert.equal(minimalDoc.mlAssessment, undefined);
    assert.equal(minimalDoc.weatherSnapshot, undefined);
    assert.equal(minimalDoc.repairEstimate, undefined);
  });

  test('8. Documented score scales and numeric bounds behave as intended', async () => {
    // Confidence score bounds: 0.0 to 1.0 scale
    const badConfidence = new Damage({
      ...baseValidData,
      mlAssessment: { confidenceScore: 1.2 }
    });
    await assert.rejects(
      async () => {
        await badConfidence.validate();
      },
      (err) => {
        assert.ok(err.errors['mlAssessment.confidenceScore']);
        return true;
      }
    );

    const validConfidence = new Damage({
      ...baseValidData,
      mlAssessment: { confidenceScore: 0.88, predictedSeverity: 'HIGH' }
    });
    await assert.doesNotReject(async () => {
      await validConfidence.validate();
    });

    // Weather precipitation probability: 0 to 100 percentage scale
    const badRain = new Damage({
      ...baseValidData,
      weatherSnapshot: { precipitationProbability: 110 }
    });
    await assert.rejects(
      async () => {
        await badRain.validate();
      },
      (err) => {
        assert.ok(err.errors['weatherSnapshot.precipitationProbability']);
        return true;
      }
    );

    // Repair cost cannot be negative
    const negativeCost = new Damage({
      ...baseValidData,
      repairEstimate: { estimatedCostINR: -500 }
    });
    await assert.rejects(
      async () => {
        await negativeCost.validate();
      },
      (err) => {
        assert.ok(err.errors['repairEstimate.estimatedCostINR']);
        return true;
      }
    );
  });

  test('9. Limitation note: range checks cannot detect swapped coordinates if both are in [-90, 90]', async () => {
    // Both 12.9716 and 77.5946 are between -90 and 90.
    // If coordinates are accidentally provided as [latitude, longitude] -> [12.9716, 77.5946],
    // range checks alone cannot know that 12.9716 was intended as latitude.
    // Both numbers satisfy [-180..180] and [-90..90].
    const invertedWithinBounds = new Damage({
      ...baseValidData,
      location: {
        type: 'Point',
        coordinates: [12.9716, 77.5946] // Inverted, but both within -90..90
      }
    });
    // This demonstrates the documented limitation: it validates successfully because both numbers are within valid ranges.
    await assert.doesNotReject(async () => {
      await invertedWithinBounds.validate();
    });
  });
});
