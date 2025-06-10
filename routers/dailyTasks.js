const express = require('express');
const router = express.Router();
const DailyTask = require('../models/DailyTask');
const User = require('../models/User');

// Get all daily tasks (admin only in a real app)
router.get('/', async (req, res) => {
  try {
    const tasks = await DailyTask.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's daily tasks
router.get('/user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Check if we need to refresh daily tasks (if last update was not today)
    const today = new Date();
    const lastUpdated = user.dailyTasks?.lastUpdated || new Date(0);
    
    // Force refresh for testing or if tasks don't exist yet
    const shouldRefresh = !user.dailyTasks || 
                          !user.dailyTasks.tasks || 
                          user.dailyTasks.tasks.length === 0 ||
                          lastUpdated.getDate() !== today.getDate() || 
                          lastUpdated.getMonth() !== today.getMonth() || 
                          lastUpdated.getFullYear() !== today.getFullYear();
    
    console.log('Should refresh tasks:', shouldRefresh);
    console.log('Last updated:', lastUpdated);
    console.log('Today:', today);
    
    if (shouldRefresh) {
      console.log('Refreshing daily tasks for user:', user.username);
      
      // Get 3 random tasks from the pool
      const allTasks = await DailyTask.find();
      console.log('Available tasks in pool:', allTasks.length);
      
      const randomTasks = [];
      
      if (allTasks.length > 0) {
        // Get up to 3 random tasks
        const taskCount = Math.min(3, allTasks.length);
        const shuffled = [...allTasks].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < taskCount; i++) {
          randomTasks.push({
            title: shuffled[i].title,
            completed: false
          });
        }
        
        console.log('Generated random tasks:', randomTasks);
      } else {
        console.log('No tasks available in the pool');
      }
      
      // Update user's daily tasks
      user.dailyTasks = {
        tasks: randomTasks,
        lastUpdated: today
      };
      
      await user.save();
      console.log('User saved with new daily tasks');
    } else {
      console.log('Using existing daily tasks');
    }
    
    res.json(user.dailyTasks);
  } catch (err) {
    console.error('Error fetching daily tasks:', err);
    res.status(500).json({ error: err.message });
  }
});

// Complete a daily task
router.put('/user/:username/complete/:taskIndex', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const taskIndex = parseInt(req.params.taskIndex);
    if (isNaN(taskIndex) || taskIndex < 0 || !user.dailyTasks || !user.dailyTasks.tasks || taskIndex >= user.dailyTasks.tasks.length) {
      return res.status(400).json({ error: 'Invalid task index' });
    }
    
    console.log(`Marking task ${taskIndex} as completed for user ${user.username}`);
    console.log('Current task state:', user.dailyTasks.tasks[taskIndex]);
    
    // Mark task as completed
    if (!user.dailyTasks.tasks[taskIndex].completed) {
      user.dailyTasks.tasks[taskIndex].completed = true;
      
      // Award XP
      user.xp += 15; // Daily tasks give more XP
      user.level = Math.floor(user.xp / 100) + 1;
      
      await user.save();
      console.log('Task marked as completed and user saved');
      console.log('New task state:', user.dailyTasks.tasks[taskIndex]);
    } else {
      console.log('Task was already completed');
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error completing daily task:', err);
    res.status(500).json({ error: err.message });
  }
});

// Force refresh daily tasks (for testing)
router.post('/user/:username/refresh', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Get 3 random tasks from the pool
    const allTasks = await DailyTask.find();
    const randomTasks = [];
    
    if (allTasks.length > 0) {
      // Get up to 3 random tasks
      const taskCount = Math.min(3, allTasks.length);
      const shuffled = [...allTasks].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < taskCount; i++) {
        randomTasks.push({
          title: shuffled[i].title,
          completed: false
        });
      }
    }
    
    // Update user's daily tasks
    user.dailyTasks = {
      tasks: randomTasks,
      lastUpdated: new Date()
    };
    
    await user.save();
    res.json(user.dailyTasks);
  } catch (err) {
    console.error('Error refreshing daily tasks:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;




