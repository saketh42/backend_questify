const mongoose = require('mongoose');
const DailyTask = require('../models/DailyTask');
require('dotenv').config();

// Sample daily tasks
const sampleTasks = [
  { title: "Meditate for 10 minutes", xpReward: 15 },
  { title: "Drink 8 glasses of water", xpReward: 15 },
  { title: "Take a 15-minute walk", xpReward: 15 },
  { title: "Read 10 pages of a book", xpReward: 15 },
  { title: "Write in a journal", xpReward: 15 },
  { title: "Stretch for 5 minutes", xpReward: 15 },
  { title: "Practice a new skill", xpReward: 15 },
  { title: "Call a friend or family member", xpReward: 15 },
  { title: "Clean your workspace", xpReward: 15 },
  { title: "Plan your meals for tomorrow", xpReward: 15 },
  { title: "Do 20 push-ups or sit-ups", xpReward: 15 },
  { title: "Listen to a new podcast", xpReward: 15 },
  { title: "Try a new healthy recipe", xpReward: 15 },
  { title: "Declutter one small area", xpReward: 15 },
  { title: "Practice deep breathing for 5 minutes", xpReward: 15 }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/questify');
    console.log('Connected to MongoDB');
    
    // Clear existing tasks
    await DailyTask.deleteMany({});
    console.log('Cleared existing daily tasks');
    
    // Insert sample tasks
    const result = await DailyTask.insertMany(sampleTasks);
    console.log(`Added ${result.length} daily tasks to the database`);
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();