const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      enum: ['SYSTEM', 'STORE', 'NOTIFICATION', 'SECURITY', 'AI_ML'],
      default: 'SYSTEM',
    },
    description: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: String,
      default: 'Admin User',
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

module.exports = Setting;
