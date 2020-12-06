const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema(
  {
    colors: {
      availabilityLow: {
        type: String,
        default: '#f94416',
        match: [
          /^#(?:[0-9a-fA-F]{3}){1,2}$/,
          'Colour must be in HEX format prefixed by pound sign',
        ],
      },
      availabilityGood: {
        type: String,
        default: '#41d855',
        match: [
          /^#(?:[0-9a-fA-F]{3}){1,2}$/,
          'Colour must be in HEX format prefixed by pound sign',
        ],
      },
    },
    JCContract: {
      name: { type: String, default: 'dublin' },
      commercial_name: { type: String, default: 'dublinbikes' },
      cities: { type: Array, default: ['Dublin'] },
      country_code: { type: String, default: 'IE' },
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Settings', SettingsSchema);
