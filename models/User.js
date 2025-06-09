const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  completed: { type: Boolean, default: false },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  currentTasks: [
    {
      title: String,
      completed: { type: Boolean, default: false },
    },
  ],
  completedTasksCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', UserSchema);