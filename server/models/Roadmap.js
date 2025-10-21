const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  steps: [
    {
      title: {
        type: String,
        required: [true, 'Please add a step title'],
        trim: true
      },
      duration: {
        type: String,
        required: [true, 'Please add a duration']
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);