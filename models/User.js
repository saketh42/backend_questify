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
      description: String,
      completed: { type: Boolean, default: false },
    },
  ],
  completedTasksCount: { type: Number, default: 0 },
  dailyTasks: {
    tasks: [
      {
        title: String,
        completed: { type: Boolean, default: false }
      }
    ],
    lastUpdated: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.comparePassword = async function(password) {
  // In a real app, you would use bcrypt.compare here
  // For simplicity, we're doing a direct comparison
  return this.password === password;
};

module.exports = mongoose.model('User', UserSchema);
