const mongoose = require('mongoose');

const coverageSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['24x7', 'day', 'custom'], default: '24x7' },
    startHour: { type: Number, min: 0, max: 23 }, // used when type is 'day' or 'custom'
    endHour: { type: Number, min: 0, max: 23 },
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected'], default: 'unverified' },
    licenseNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
    reviewNote: { type: String, trim: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { _id: false }
);

const pricingPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Hourly", "Full Day", "Monthly Subscription"
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ['hour', 'day', 'week', 'month'], required: true },
  },
  { _id: false }
);

const centerSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    services: [{ type: String, enum: ['Daycare', 'Crèche', 'Babysitting'] }],
    ageGroupsSupported: [{ type: String, enum: ['Infant (0-1y)', 'Toddler (1-3y)', 'Preschool (3-5y)', 'School age (5+)'] }],
    coverage: coverageSchema,
    capacity: { type: Number, required: true, min: 1 },
    pricingPlans: [pricingPlanSchema],
    verification: { type: verificationSchema, default: () => ({}) },
    safetyCertifications: [{ type: String, trim: true }],
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

centerSchema.index({ name: 'text', area: 'text' });

module.exports = mongoose.model('Center', centerSchema);
