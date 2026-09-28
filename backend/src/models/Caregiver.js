const mongoose = require('mongoose');

const caregiverSchema = new mongoose.Schema(
  {
    center: { type: mongoose.Schema.Types.ObjectId, ref: 'Center', required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected'], default: 'unverified' },
    idProofNote: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Caregiver', caregiverSchema);
