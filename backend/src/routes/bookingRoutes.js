const express = require('express');
const Booking = require('../models/Booking');
const Center = require('../models/Center');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings — parent requests a slot (capacity-checked server-side)
router.post('/', requireAuth, requireRole('parent'), async (req, res) => {
  try {
    const { centerId, childName, childAge, serviceType, dateNeeded, timeNeeded, notes } = req.body;
    if (!centerId || !childName || !childAge || !serviceType || !dateNeeded || !timeNeeded) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }
    const center = await Center.findById(centerId);
    if (!center) return res.status(404).json({ error: 'Center not found' });

    const reserved = await Booking.countDocuments({ center: centerId, dateNeeded, status: { $ne: 'declined' } });
    if (reserved >= center.capacity) {
      return res.status(409).json({ error: `This centre is fully booked for ${dateNeeded}. Please choose another date.` });
    }

    const booking = await Booking.create({
      parent: req.user.id, center: centerId, childName, childAge, serviceType, dateNeeded, timeNeeded, notes,
      status: 'pending',
    });
    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/mine — parent's own requests
router.get('/mine', requireAuth, requireRole('parent'), async (req, res) => {
  const bookings = await Booking.find({ parent: req.user.id }).populate('center', 'name area').sort({ createdAt: -1 });
  res.json({ bookings });
});

// GET /api/bookings/for-my-centers — requests sent to centres the logged-in owner runs
router.get('/for-my-centers', requireAuth, requireRole('center'), async (req, res) => {
  const myCenters = await Center.find({ owner: req.user.id }).select('_id');
  const centerIds = myCenters.map((c) => c._id);
  const bookings = await Booking.find({ center: { $in: centerIds } })
    .populate('center', 'name')
    .populate('parent', 'name phone')
    .sort({ createdAt: -1 });
  res.json({ bookings });
});

async function ownsBookingsCenter(userId, booking) {
  const center = await Center.findById(booking.center);
  return center && String(center.owner) === userId;
}

// PATCH /api/bookings/:id/respond — accept or decline (center owner only)
router.patch('/:id/respond', requireAuth, requireRole('center'), async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'declined'].includes(status)) return res.status(400).json({ error: 'status must be accepted or declined' });

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (!(await ownsBookingsCenter(req.user.id, booking))) return res.status(403).json({ error: 'Not your booking to respond to' });

  booking.status = status;
  await booking.save();
  res.json({ booking });
});

// PATCH /api/bookings/:id/check-in
router.patch('/:id/check-in', requireAuth, requireRole('center'), async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (!(await ownsBookingsCenter(req.user.id, booking))) return res.status(403).json({ error: 'Not your booking' });
  if (booking.status !== 'accepted') return res.status(400).json({ error: 'Only accepted bookings can be checked in' });

  booking.checkInAt = new Date();
  await booking.save();
  res.json({ booking });
});

// PATCH /api/bookings/:id/check-out
router.patch('/:id/check-out', requireAuth, requireRole('center'), async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (!(await ownsBookingsCenter(req.user.id, booking))) return res.status(403).json({ error: 'Not your booking' });
  if (!booking.checkInAt) return res.status(400).json({ error: 'Child has not been checked in yet' });

  booking.checkOutAt = new Date();
  await booking.save();
  res.json({ booking });
});

module.exports = router;
