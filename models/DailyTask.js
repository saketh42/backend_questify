const mongoose = require('mongoose');

const DailyTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  xpReward: { type: Number, default: 10 }
});

module.exports = mongoose.model('DailyTask', DailyTaskSchema);