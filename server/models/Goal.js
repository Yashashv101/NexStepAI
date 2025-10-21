const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a goal name'],
    trim: true,
    maxlength: [100, 'Goal name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Goal', GoalSchema);