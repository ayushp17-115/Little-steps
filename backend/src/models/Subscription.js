const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    center: { type: mongoose.Schema.Types.ObjectId, ref: 'Center', required: true },
    planName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ['week', 'month'], required: true },
    childName: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
    startDate: { type: String, required: true }, // 'YYYY-MM-DD'
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
