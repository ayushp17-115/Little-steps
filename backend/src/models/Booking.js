const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    center: { type: mongoose.Schema.Types.ObjectId, ref: 'Center', required: true },
    childName: { type: String, required: true, trim: true },
    childAge: { type: String, required: true, trim: true },
    serviceType: { type: String, required: true },
    dateNeeded: { type: String, required: true }, // 'YYYY-MM-DD'
    timeNeeded: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    checkInAt: { type: Date, default: null },
    checkOutAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
