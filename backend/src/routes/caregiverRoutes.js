const express = require('express');
const Caregiver = require('../models/Caregiver');
const Center = require('../models/Center');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/caregivers?center=<centerId>
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.center) filter.center = req.query.center;
  const caregivers = await Caregiver.find(filter).sort({ createdAt: -1 });
  res.json({ caregivers });
});

// POST /api/caregivers — owner adds a caregiver to their center
router.post('/', requireAuth, requireRole('center'), async (req, res) => {
  const { centerId, name, role } = req.body;
  if (!centerId || !name || !role) return res.status(400).json({ error: 'centerId, name, and role are required' });

  const center = await Center.findById(centerId);
  if (!center) return res.status(404).json({ error: 'Center not found' });
  if (String(center.owner) !== req.user.id) return res.status(403).json({ error: 'Not your center' });

  const caregiver = await Caregiver.create({ center: centerId, name, role, status: 'unverified' });
  res.status(201).json({ caregiver });
});

module.exports = router;
