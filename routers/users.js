const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ✅ Create user with password
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required and must be a string' });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password is required and must be at least 4 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const user = new User({
      username,
      password,
      level: 1,
      xp: 0,
      currentTasks: [],
      completedTasksCount: 0
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get user by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update XP and level
router.put('/:username/progress', async (req, res) => {
  try {
    const { xp } = req.body;

    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Increment XP
    user.xp += xp;

    // Update level (example: 100 XP per level)
    user.level = Math.floor(user.xp / 100) + 1;

    await user.save();

    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Add a task
router.post('/:username/tasks', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.currentTasks.push(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Mark task as completed
router.put('/:username/tasks/:taskId/complete', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const task = user.currentTasks.id(req.params.taskId);
    if (task) {
      task.completed = true;
      user.completedTasksCount += 1;
      // Award XP for completing task
      user.xp += 10;
      user.level = Math.floor(user.xp / 100) + 1;
      
      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
