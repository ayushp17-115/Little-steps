const express = require('express');
const Center = require('../models/Center');
const Booking = require('../models/Booking');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function isHourCovered(hour, coverage) {
  if (coverage.type === '24x7') return true;
  if (coverage.type === 'day') return hour >= coverage.startHour && hour < coverage.endHour;
  const s = coverage.startHour, e = coverage.endHour;
  if (s === e) return true;
  if (s < e) return hour >= s && hour < e;
  return hour >= s || hour < e;
}

async function availabilityFor(centerId, capacity, dateStr) {
  const reserved = await Booking.countDocuments({ center: centerId, dateNeeded: dateStr, status: { $ne: 'declined' } });
  const remaining = Math.max(capacity - reserved, 0);
  return { reserved, capacity, remaining, isFull: remaining <= 0 };
}

// GET /api/centers?service=&verifiedOnly=&coverage247Only=&ageGroup=&q=&date=
router.get('/', async (req, res) => {
  try {
    const { service, verifiedOnly, coverage247Only, ageGroup, q, date } = req.query;
    const filter = {};
    if (service) filter.services = service;
    if (ageGroup) filter.ageGroupsSupported = ageGroup;
    if (verifiedOnly === 'true') filter['verification.status'] = 'verified';
    if (coverage247Only === 'true') filter['coverage.type'] = '24x7';
    if (q) filter.$text = { $search: q };

    const centers = await Center.find(filter).sort({ createdAt: -1 }).lean();
    const dateStr = date || new Date().toISOString().slice(0, 10);
    const withAvailability = await Promise.all(
      centers.map(async (c) => ({ ...c, availability: await availabilityFor(c._id, c.capacity, dateStr) }))
    );
    res.json({ centers: withAvailability, date: dateStr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/centers/mine — centres owned by the logged-in center user
router.get('/mine', requireAuth, requireRole('center'), async (req, res) => {
  const centers = await Center.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json({ centers });
});

// GET /api/centers/:id
router.get('/:id', async (req, res) => {
  const center = await Center.findById(req.params.id).lean();
  if (!center) return res.status(404).json({ error: 'Center not found' });
  const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
  center.availability = await availabilityFor(center._id, center.capacity, dateStr);
  res.json({ center });
});

// POST /api/centers — create a listing (center role)
router.post('/', requireAuth, requireRole('center'), async (req, res) => {
  try {
    const {
      name, area, services, ageGroupsSupported, coverage, capacity,
      pricingPlans, safetyCertifications, description, location,
    } = req.body;
    if (!name || !area || !services?.length || !coverage || !capacity) {
      return res.status(400).json({ error: 'name, area, services, coverage, and capacity are required' });
    }
    const center = await Center.create({
      owner: req.user.id, name, area, services, ageGroupsSupported, coverage,
      capacity, pricingPlans, safetyCertifications, description, location,
      verification: { status: 'unverified' },
    });
    res.status(201).json({ center });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/centers/:id — update a listing (owner only)
router.patch('/:id', requireAuth, requireRole('center'), async (req, res) => {
  const center = await Center.findById(req.params.id);
  if (!center) return res.status(404).json({ error: 'Center not found' });
  if (String(center.owner) !== req.user.id) return res.status(403).json({ error: 'Not your listing' });

  const editable = ['name', 'area', 'services', 'ageGroupsSupported', 'coverage', 'capacity', 'pricingPlans', 'safetyCertifications', 'description', 'location'];
  editable.forEach((key) => {
    if (req.body[key] !== undefined) center[key] = req.body[key];
  });
  await center.save();
  res.json({ center });
});

// POST /api/centers/:id/request-verification — owner submits license for admin review
router.post('/:id/request-verification', requireAuth, requireRole('center'), async (req, res) => {
  const center = await Center.findById(req.params.id);
  if (!center) return res.status(404).json({ error: 'Center not found' });
  if (String(center.owner) !== req.user.id) return res.status(403).json({ error: 'Not your listing' });

  const { licenseNumber, notes } = req.body;
  if (!licenseNumber) return res.status(400).json({ error: 'licenseNumber is required' });

  center.verification = { status: 'pending', licenseNumber, notes, reviewNote: '', reviewedBy: null, reviewedAt: null };
  await center.save();
  res.json({ center });
});

module.exports = router;
