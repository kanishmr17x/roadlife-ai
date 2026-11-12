const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

// In-process HTTP simulation helper (requires no network/TCP socket binding)
async function makeRequest(handler, { method = 'GET', url = '/', body = null, headers = {} }) {
  return new Promise((resolve) => {
    const req = {
      method,
      url,
      headers: { ...headers },
      body: body || {},
      query: {}
    };

    // Parse query string for in-process simulation
    if (url.includes('?')) {
      const qs = url.split('?')[1];
      const params = new URLSearchParams(qs);
      for (const [k, v] of params.entries()) {
        req.query[k] = v;
      }
    }

    let statusCode = 200;
    const resHeaders = {};
    let responseBody = null;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      setHeader(name, val) {
        resHeaders[name] = val;
      },
      json(data) {
        responseBody = data;
        resolve({ status: statusCode, headers: resHeaders, body: responseBody });
      },
      end(data) {
        responseBody = data;
        resolve({ status: statusCode, headers: resHeaders, body: responseBody });
      }
    };

    handler(req, res);
  });
}

describe('Damage Reporting & Geospatial API (/api/damages)', () => {
  test('1. GET /api/damages returns 200 with an array of reports', async () => {
    const res = await makeRequest(app, { url: '/api/damages', method: 'GET' });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });

  test('2. POST /api/damages rejects missing title with 400 Bad Request', async () => {
    const res = await makeRequest(app, {
      url: '/api/damages',
      method: 'POST',
      body: {
        location: { type: 'Point', coordinates: [77.5946, 12.9716] }
      }
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.includes('title'));
  });

  test('3. POST /api/damages rejects invalid coordinates with 400 Bad Request', async () => {
    const res = await makeRequest(app, {
      url: '/api/damages',
      method: 'POST',
      body: {
        title: 'Deep Pothole on Ring Road',
        location: { type: 'Point', coordinates: [200.0, 12.0] } // Longitude > 180
      }
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error.includes('Coordinates'));
  });

  test('4. POST /api/damages successfully creates a damage report with 201 Created', async () => {
    const res = await makeRequest(app, {
      url: '/api/damages',
      method: 'POST',
      body: {
        title: 'Pothole near Sector 4 Cross',
        description: 'Severe depth approx 10cm, hazardous for two-wheelers',
        damageType: 'POTHOLE',
        severity: 'HIGH',
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        address: 'Outer Ring Road, Bengaluru'
      }
    });
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.id);
    assert.strictEqual(res.body.title, 'Pothole near Sector 4 Cross');
    assert.strictEqual(res.body.damageType, 'pothole');
    assert.strictEqual(res.body.severity, 'HIGH');
    assert.deepStrictEqual(res.body.location.coordinates, [77.5946, 12.9716]);
  });

  test('5. GET /api/damages/:id retrieves the created damage record', async () => {
    const createRes = await makeRequest(app, {
      url: '/api/damages',
      method: 'POST',
      body: {
        title: 'Transverse crack near flyover',
        damageType: 'crack',
        severity: 'MEDIUM',
        location: { type: 'Point', coordinates: [77.6000, 12.9800] }
      }
    });
    assert.strictEqual(createRes.status, 201);
    const id = createRes.body.id;

    const getRes = await makeRequest(app, { url: `/api/damages/${id}`, method: 'GET' });
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.body.id, id);
    assert.strictEqual(getRes.body.title, 'Transverse crack near flyover');
  });

  test('6. GET /api/damages/nearby returns reports within proximity radius', async () => {
    const res = await makeRequest(app, {
      url: '/api/damages/nearby?lng=77.5946&lat=12.9716&maxDistance=10000',
      method: 'GET'
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });

  test('7. GET /api/damages/nearby rejects missing coordinates with 400', async () => {
    const res = await makeRequest(app, { url: '/api/damages/nearby', method: 'GET' });
    assert.strictEqual(res.status, 400);
  });

  test('8. POST /api/damages/ai-detect rejects missing image payload with 400', async () => {
    const res = await makeRequest(app, {
      url: '/api/damages/ai-detect',
      method: 'POST',
      body: {}
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
  });

  test('9. POST /api/damages/ai-detect gracefully falls back when ML service is offline', async () => {
    const res = await makeRequest(app, {
      url: '/api/damages/ai-detect',
      method: 'POST',
      body: {
        imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/'
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'degraded');
    assert.strictEqual(res.body.aiServiceAvailable, false);
  });

  test('10. POST /api/materials/material-verify rejects missing image payload with 400', async () => {
    const res = await makeRequest(app, {
      url: '/api/materials/material-verify',
      method: 'POST',
      body: {}
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error);
  });

  test('11. POST /api/materials/material-verify gracefully falls back when ML service is offline', async () => {
    const res = await makeRequest(app, {
      url: '/api/materials/material-verify',
      method: 'POST',
      body: {
        imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/',
        materialType: 'AGGREGATE'
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.material_type, 'AGGREGATE');
    assert.ok(res.body.overall_quality_score);
    assert.strictEqual(res.body.compliance, 'COMPLIANT');
  });
});
