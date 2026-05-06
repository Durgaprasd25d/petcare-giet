const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Vaccination', 'Checkup', 'Grooming', 'Training', 'Nutrition'],
    required: true
  },
  targetAgeMonths: {
    type: Number,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  icon: {
    type: String // Name of the icon to display
  }
});

const wellnessPlanSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  milestones: [milestoneSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('WellnessPlan', wellnessPlanSchema);
