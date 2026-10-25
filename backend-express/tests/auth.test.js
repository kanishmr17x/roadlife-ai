const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const userService = require('../src/services/userService');
const { JWT_SECRET } = require('../src/middleware/auth');

// Helper to simulate HTTP requests without external network dependencies
async function makeRequest(handler, { method = 'GET', url = '/', body = null, headers = {} }) {
  return new Promise((resolve) => {
    const req = {
      method,
      url,
      headers: { ...headers },
      body: body || {}
    };

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

describe('RoadSense Authentication & RBAC Engine (Express)', () => {
  beforeEach(async () => {
    await userService.resetForTesting();
  });

  test('1. Valid citizen credentials open citizen session', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'citizen@roadsense.local',
        password: 'CitizenPass123!',
        portalRole: 'CITIZEN'
      }
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.token, 'Expected JWT token to be issued');
    assert.equal(res.body.user.role, 'CITIZEN');
    assert.equal(res.body.user.email, 'citizen@roadsense.local');
    assert.equal(res.body.user.passwordHash, undefined, 'Password hash must never be returned');
  });

  test('2. Valid approved contractor credentials open contractor session', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'contractor@buildinfra.in',
        password: 'ContractorPass123!',
        portalRole: 'CONTRACTOR'
      }
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'CONTRACTOR');
    assert.equal(res.body.user.isApproved, true);
  });

  test('3. Valid authorized municipal credentials open municipal session', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'officer@pwd.gov.in',
        password: 'GovOfficerPass123!',
        portalRole: 'MUNICIPAL_AUTHORITY'
      }
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'MUNICIPAL_AUTHORITY');
  });

  test('4. Invalid password rejected with 401 Unauthorized', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'citizen@roadsense.local',
        password: 'WrongPassword999!'
      }
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Invalid email address or password.');
  });

  test('5. Non-existent email rejected with generic 401 (no user enumeration)', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'unknown.ghost@example.com',
        password: 'SomePassword123!'
      }
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Invalid email address or password.');
  });

  test('6. Missing email or password rejected with 400 Bad Request', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: { email: 'citizen@roadsense.local' }
    });

    assert.equal(res.status, 400);
  });

  test('7. Contractor with PENDING_APPROVAL rejected with 403 Forbidden', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'pending@apexroads.com',
        password: 'ContractorPass123!',
        portalRole: 'CONTRACTOR'
      }
    });

    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'PENDING_APPROVAL');
  });

  test('8. Portal role mismatch rejected with 403 Forbidden', async () => {
    // Citizen attempts to authenticate into Contractor Portal
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'citizen@roadsense.local',
        password: 'CitizenPass123!',
        portalRole: 'CONTRACTOR'
      }
    });

    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'ROLE_MISMATCH');
  });

  test('9. Public registration cannot assign MUNICIPAL_AUTHORITY (403 Forbidden)', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/register',
      body: {
        email: 'rogue.admin@test.local',
        password: 'Password123!',
        fullName: 'Imposter Officer',
        role: 'MUNICIPAL_AUTHORITY'
      }
    });

    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'PRIVILEGED_ROLE_NOT_PERMITTED');
  });

  test('10. Public citizen registration creates active citizen and issues token', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/register',
      body: {
        email: 'ananya.field@test.local',
        password: 'CitizenPass123!',
        fullName: 'Ananya Rao',
        role: 'CITIZEN'
      }
    });

    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'CITIZEN');
    assert.equal(res.body.user.status, 'ACTIVE');
  });

  test('11. Contractor onboarding requires company details and enters PENDING_APPROVAL', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/register',
      body: {
        email: 'newcon@sharmainfra.in',
        password: 'ContractorPass123!',
        fullName: 'Sharma Infra Ltd',
        role: 'CONTRACTOR',
        companyName: 'Sharma Infra Ltd',
        licenseNumber: 'KA-BLR-2026-901'
      }
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'PENDING_APPROVAL');
    assert.equal(res.body.user.isApproved, false);
  });

  test('12. Protected resource rejects missing token with 401', async () => {
    const res = await makeRequest(app, {
      method: 'GET',
      url: '/api/citizen/reports'
    });

    assert.equal(res.status, 401);
  });

  test('13. Citizen forbidden from contractor projects (403)', async () => {
    // Generate valid citizen token
    const token = jwt.sign(
      { id: 'usr-cit-101', email: 'citizen@roadsense.local', role: 'CITIZEN' },
      JWT_SECRET
    );

    const res = await makeRequest(app, {
      method: 'GET',
      url: '/api/contractor/projects',
      headers: { authorization: `Bearer ${token}` }
    });

    assert.equal(res.status, 403);
  });

  test('14. Contractor forbidden from municipal audit logs (403)', async () => {
    const token = jwt.sign(
      { id: 'usr-con-202', email: 'contractor@buildinfra.in', role: 'CONTRACTOR' },
      JWT_SECRET
    );

    const res = await makeRequest(app, {
      method: 'GET',
      url: '/api/government/audit-logs',
      headers: { authorization: `Bearer ${token}` }
    });

    assert.equal(res.status, 403);
  });

  test('15. Municipal authority permitted to access audit logs (200)', async () => {
    const token = jwt.sign(
      { id: 'usr-gov-303', email: 'officer@pwd.gov.in', role: 'MUNICIPAL_AUTHORITY' },
      JWT_SECRET
    );

    const res = await makeRequest(app, {
      method: 'GET',
      url: '/api/government/audit-logs',
      headers: { authorization: `Bearer ${token}` }
    });

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.logs));
  });

  test('16. /api/auth/me returns authenticated profile without password hash', async () => {
    const token = jwt.sign(
      { id: 'usr-cit-101', email: 'citizen@roadsense.local', role: 'CITIZEN' },
      JWT_SECRET
    );

    const res = await makeRequest(app, {
      method: 'GET',
      url: '/api/auth/me',
      headers: { authorization: `Bearer ${token}` }
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, 'citizen@roadsense.local');
    assert.equal(res.body.user.passwordHash, undefined);
  });

  test('17. Development account kanish1@gmail.com authenticates into Citizen portal', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'kanish1@gmail.com',
        password: '1234',
        portalRole: 'CITIZEN'
      }
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'CITIZEN');
    assert.equal(res.body.user.email, 'kanish1@gmail.com');
  });

  test('18. Development account kanish2@gmail.com authenticates into Contractor portal', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'kanish2@gmail.com',
        password: '1234',
        portalRole: 'CONTRACTOR'
      }
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'CONTRACTOR');
    assert.equal(res.body.user.email, 'kanish2@gmail.com');
  });

  test('19. Development account kanish3@gmail.com authenticates into Municipal portal', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'kanish3@gmail.com',
        password: '1234',
        portalRole: 'MUNICIPAL_AUTHORITY'
      }
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'MUNICIPAL_AUTHORITY');
    assert.equal(res.body.user.email, 'kanish3@gmail.com');
  });

  test('20. Invalid password for kanish1@gmail.com is rejected with 401', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'kanish1@gmail.com',
        password: 'wrong_password_999'
      }
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Invalid email address or password.');
  });

  test('21. kanish1@gmail.com citizen attempting to log into Contractor portal is rejected with 403', async () => {
    const res = await makeRequest(app, {
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'kanish1@gmail.com',
        password: '1234',
        portalRole: 'CONTRACTOR'
      }
    });

    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'ROLE_MISMATCH');
  });
});
