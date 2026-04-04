const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    preferences: {
      budget: {
        type: String,
        enum: ['budget', 'moderate', 'luxury'],
        default: 'moderate',
      },
      interests: [{ type: String }],
      travelStyle: {
        type: String,
        enum: ['adventure', 'leisure', 'cultural', 'business'],
        default: 'leisure',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
