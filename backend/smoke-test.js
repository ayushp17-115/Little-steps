process.env.JWT_SECRET = 'test-secret';

const { MongoMemoryServer } = require('mongodb-memory-server');
const http = require('http');

function req(port, method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = http.request(
      {
        hostname: 'localhost', port, path, method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => (chunks += c));
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(chunks); } catch { parsed = chunks; }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

function assert(cond, msg) {
  if (!cond) throw new Error('ASSERTION FAILED: ' + msg);
  console.log('  ok -', msg);
}

async function main() {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();

  const { app, start } = require('./server');
  await start();
  const port = process.env.PORT || 5000;

  console.log('\n== health check ==');
  let r = await req(port, 'GET', '/api/health');
  assert(r.status === 200 && r.body.ok === true, 'health endpoint responds');

  console.log('\n== register parent ==');
  r = await req(port, 'POST', '/api/auth/register', { name: 'Ritu Verma', email: 'ritu@example.com', password: 'pass1234', role: 'parent' });
  assert(r.status === 201, 'parent registered');
  const parentToken = r.body.token;

  console.log('\n== register center owner ==');
  r = await req(port, 'POST', '/api/auth/register', { name: 'Priya Shah', email: 'priya@example.com', password: 'pass1234', role: 'center' });
  assert(r.status === 201, 'center owner registered');
  const centerOwnerToken = r.body.token;

  console.log('\n== register admin (manually, simulating seeded admin) ==');
  r = await req(port, 'POST', '/api/auth/register', { name: 'LS Admin', email: 'admin@littlesteps.com', password: 'pass1234', role: 'admin' });
  // route forces role to parent for public registration - verify that safeguard works
  assert(r.body.user.role === 'parent', 'public registration cannot self-assign admin role (security check)');

  console.log('\n== login ==');
  r = await req(port, 'POST', '/api/auth/login', { email: 'ritu@example.com', password: 'pass1234' });
  assert(r.status === 200 && r.body.token, 'parent can log in');

  console.log('\n== create a center listing ==');
  r = await req(port, 'POST', '/api/centers', {
    name: 'Sunbeam Little Nest', area: 'Andheri West, Mumbai',
    services: ['Daycare', 'Crèche'], ageGroupsSupported: ['Toddler (1-3y)'],
    coverage: { type: '24x7' }, capacity: 2,
    pricingPlans: [{ name: 'Hourly', price: 150, unit: 'hour' }],
    description: 'Test centre',
  }, centerOwnerToken);
  assert(r.status === 201, 'center created: ' + JSON.stringify(r.body));
  const centerId = r.body.center._id;

  console.log('\n== browse centers (public) ==');
  r = await req(port, 'GET', '/api/centers');
  assert(r.status === 200 && r.body.centers.length === 1, 'center appears in public listing');
  assert(r.body.centers[0].availability.remaining === 2, 'availability starts at full capacity');

  console.log('\n== request verification ==');
  r = await req(port, 'POST', `/api/centers/${centerId}/request-verification`, { licenseNumber: 'MH-DCC-2291' }, centerOwnerToken);
  assert(r.status === 200 && r.body.center.verification.status === 'pending', 'verification request set to pending');

  console.log('\n== add a caregiver ==');
  r = await req(port, 'POST', '/api/caregivers', { centerId, name: 'Fatima Sheikh', role: 'Lead caregiver' }, centerOwnerToken);
  assert(r.status === 201, 'caregiver added');
  const caregiverId = r.body.caregiver._id;

  console.log('\n== parent books a slot ==');
  r = await req(port, 'POST', '/api/bookings', {
    centerId, childName: 'Aarav', childAge: '2 years', serviceType: 'Daycare',
    dateNeeded: '2026-09-10', timeNeeded: '9 AM - 6 PM',
  }, parentToken);
  assert(r.status === 201, 'booking created: ' + JSON.stringify(r.body));
  const bookingId = r.body.booking._id;

  console.log('\n== second booking fills capacity ==');
  r = await req(port, 'POST', '/api/bookings', {
    centerId, childName: 'Diya', childAge: '3 years', serviceType: 'Daycare',
    dateNeeded: '2026-09-10', timeNeeded: '9 AM - 6 PM',
  }, parentToken);
  assert(r.status === 201, 'second booking accepted (capacity=2)');

  console.log('\n== third booking on same date is rejected (capacity-aware booking) ==');
  r = await req(port, 'POST', '/api/bookings', {
    centerId, childName: 'Kabir', childAge: '2 years', serviceType: 'Daycare',
    dateNeeded: '2026-09-10', timeNeeded: '9 AM - 6 PM',
  }, parentToken);
  assert(r.status === 409, 'third booking correctly blocked as centre is full for that date');

  console.log('\n== center owner sees booking requests ==');
  r = await req(port, 'GET', '/api/bookings/for-my-centers', null, centerOwnerToken);
  assert(r.status === 200 && r.body.bookings.length === 2, 'owner sees both bookings for their centre');

  console.log('\n== center owner accepts booking ==');
  r = await req(port, 'PATCH', `/api/bookings/${bookingId}/respond`, { status: 'accepted' }, centerOwnerToken);
  assert(r.status === 200 && r.body.booking.status === 'accepted', 'booking accepted');

  console.log('\n== center owner checks child in and out ==');
  r = await req(port, 'PATCH', `/api/bookings/${bookingId}/check-in`, {}, centerOwnerToken);
  assert(r.status === 200 && r.body.booking.checkInAt, 'check-in recorded');
  r = await req(port, 'PATCH', `/api/bookings/${bookingId}/check-out`, {}, centerOwnerToken);
  assert(r.status === 200 && r.body.booking.checkOutAt, 'check-out recorded');

  console.log('\n== parent sees their bookings with status ==');
  r = await req(port, 'GET', '/api/bookings/mine', null, parentToken);
  assert(r.status === 200 && r.body.bookings.length === 2, 'parent sees own bookings');

  console.log('\n== non-admin cannot access admin queue ==');
  r = await req(port, 'GET', '/api/admin/queue', null, centerOwnerToken);
  assert(r.status === 403, 'center owner correctly blocked from admin routes');

  console.log('\n== promote a real admin directly via DB for testing, then review verification ==');
  const mongoose = require('mongoose');
  const User = require('./src/models/User');
  await User.findOneAndUpdate({ email: 'admin@littlesteps.com' }, { role: 'admin' });
  r = await req(port, 'POST', '/api/auth/login', { email: 'admin@littlesteps.com', password: 'pass1234' });
  const adminToken = r.body.token;

  r = await req(port, 'GET', '/api/admin/queue', null, adminToken);
  assert(r.status === 200 && r.body.pendingCenters.length === 1, 'admin sees pending center in queue');
  assert(r.body.pendingCaregivers.length === 0, 'caregiver not yet submitted for review shows as none pending (starts unverified, not pending)');

  r = await req(port, 'PATCH', `/api/admin/centers/${centerId}/review`, { decision: 'verified', reviewNote: 'Docs checked' }, adminToken);
  assert(r.status === 200 && r.body.center.verification.status === 'verified', 'admin approved center verification');

  console.log('\n== subscription flow ==');
  r = await req(port, 'POST', '/api/subscriptions', {
    centerId, planName: 'Monthly Daycare', price: 12000, unit: 'month', childName: 'Aarav', startDate: '2026-10-01',
  }, parentToken);
  assert(r.status === 201, 'subscription created');

  console.log('\n== admin overview KPIs ==');
  r = await req(port, 'GET', '/api/admin/overview', null, adminToken);
  assert(r.status === 200, 'admin overview responds');
  assert(r.body.kpis.verifiedCenters === 1, 'KPI: verified centers count correct');
  assert(r.body.kpis.totalBookingRequests === 2, 'KPI: total booking requests correct');
  assert(r.body.kpis.activeSubscriptions === 1, 'KPI: active subscriptions correct');
  console.log('     KPIs:', JSON.stringify(r.body.kpis));

  console.log('\nALL SMOKE TESTS PASSED ✔');
  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nSMOKE TEST FAILED:', err);
  process.exit(1);
});
