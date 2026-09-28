const express = require('express');
const Subscription = require('../models/Subscription');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/subscriptions — parent subscribes to a recurring plan at a center
router.post('/', requireAuth, requireRole('parent'), async (req, res) => {
  const { centerId, planName, price, unit, childName, startDate } = req.body;
  if (!centerId || !planName || !price || !unit || !childName || !startDate) {
    return res.status(400).json({ error: 'Missing required subscription fields' });
  }
  const sub = await Subscription.create({
    parent: req.user.id, center: centerId, planName, price, unit, childName, startDate, status: 'active',
  });
  res.status(201).json({ subscription: sub });
});

// GET /api/subscriptions/mine
router.get('/mine', requireAuth, requireRole('parent'), async (req, res) => {
  const subs = await Subscription.find({ parent: req.user.id }).populate('center', 'name area');
  res.json({ subscriptions: subs });
});

// PATCH /api/subscriptions/:id/cancel
router.patch('/:id/cancel', requireAuth, requireRole('parent'), async (req, res) => {
  const sub = await Subscription.findById(req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });
  if (String(sub.parent) !== req.user.id) return res.status(403).json({ error: 'Not your subscription' });
  sub.status = 'cancelled';
  await sub.save();
  res.json({ subscription: sub });
});

module.exports = router;
