const express = require('express');
const Center = require('../models/Center');
const Caregiver = require('../models/Caregiver');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Subscription = require('../models/Subscription');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/queue — centres and caregivers pending review
router.get('/queue', async (req, res) => {
  const pendingCenters = await Center.find({ 'verification.status': 'pending' }).populate('owner', 'name email');
  const pendingCaregivers = await Caregiver.find({ status: 'pending' }).populate('center', 'name');
  res.json({ pendingCenters, pendingCaregivers });
});

// PATCH /api/admin/centers/:id/review — approve/reject a center's verification
router.patch('/centers/:id/review', async (req, res) => {
  const { decision, reviewNote } = req.body; // 'verified' | 'rejected'
  if (!['verified', 'rejected'].includes(decision)) return res.status(400).json({ error: 'decision must be verified or rejected' });

  const center = await Center.findById(req.params.id);
  if (!center) return res.status(404).json({ error: 'Center not found' });

  center.verification.status = decision;
  center.verification.reviewNote = reviewNote || '';
  center.verification.reviewedBy = req.user.id;
  center.verification.reviewedAt = new Date();
  await center.save();
  res.json({ center });
});

// PATCH /api/admin/caregivers/:id/review
router.patch('/caregivers/:id/review', async (req, res) => {
  const { decision } = req.body;
  if (!['verified', 'rejected'].includes(decision)) return res.status(400).json({ error: 'decision must be verified or rejected' });

  const caregiver = await Caregiver.findById(req.params.id);
  if (!caregiver) return res.status(404).json({ error: 'Caregiver not found' });

  caregiver.status = decision;
  await caregiver.save();
  res.json({ caregiver });
});

// GET /api/admin/overview — platform-wide KPIs
router.get('/overview', async (req, res) => {
  const [userCount, verifiedCenterCount, totalCenterCount, bookingCount, acceptedBookingCount, subscriptionCount, centers] =
    await Promise.all([
      User.countDocuments({ role: 'parent' }),
      Center.countDocuments({ 'verification.status': 'verified' }),
      Center.countDocuments({}),
      Booking.countDocuments({}),
      Booking.countDocuments({ status: 'accepted' }),
      Subscription.countDocuments({ status: 'active' }),
      Center.find({}).lean(),
    ]);

  const today = new Date().toISOString().slice(0, 10);
  const utilization = await Promise.all(
    centers.map(async (c) => {
      const reserved = await Booking.countDocuments({ center: c._id, dateNeeded: today, status: { $ne: 'declined' } });
      return { centerId: c._id, name: c.name, reserved, capacity: c.capacity };
    })
  );

  res.json({
    kpis: {
      registeredParents: userCount,
      verifiedCenters: verifiedCenterCount,
      totalCenters: totalCenterCount,
      totalBookingRequests: bookingCount,
      bookingConversionRate: bookingCount ? +((acceptedBookingCount / bookingCount) * 100).toFixed(1) : 0,
      activeSubscriptions: subscriptionCount,
    },
    utilizationToday: utilization,
  });
});

module.exports = router;
