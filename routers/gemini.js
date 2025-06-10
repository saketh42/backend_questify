const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

// Updated Gemini API endpoint - using the correct model path
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBkbzFYxEdKF-FdFJzJhUKHFpRdg2WJ0LY';

// Productivity-focused system prompt
const SYSTEM_PROMPT = `You are QuestBot, a productivity assistant for the Questify app. 
Your primary goal is to help users boost their productivity, manage tasks effectively, and stay motivated.
Keep responses concise (under 100 words), friendly, and focused on productivity tips.
If asked about topics unrelated to productivity, tasks, motivation, or the Questify app, 
politely redirect the conversation to how you can help with productivity. return only plain text no need of formatting`;

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API key not configured',
        fallbackResponse: getLocalResponse(message)
      });
    }
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: 'user',
            parts: [
              { text: SYSTEM_PROMPT },
              { text: message }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
          topP: 0.95,
          topK: 40
        }
      }
    );
    
    const generatedText = response.data.candidates[0]?.content?.parts[0]?.text || 
                          "I'm having trouble connecting to my knowledge base. Let me help with a simpler response.";
    
    res.json({ response: generatedText });
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    
    // Return a fallback response if the API call fails
    res.status(500).json({ 
      error: 'Failed to get response from Gemini',
      fallbackResponse: getLocalResponse(req.body.message)
    });
  }
});

// Fallback responses for when Gemini API is unavailable
function getLocalResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! How can I assist you with your productivity today?";
  } else if (lowerMessage.includes('level') || lowerMessage.includes('xp')) {
    return "To level up faster, complete daily quests and focus training sessions. Each completed task gives you XP!";
  } else if (lowerMessage.includes('quest') || lowerMessage.includes('task')) {
    return "You can add new quests from your dashboard. Breaking down large tasks into smaller ones can help you make progress more consistently.";
  } else if (lowerMessage.includes('focus') || lowerMessage.includes('concentrate')) {
    return "Try the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break. Our Focus Training feature can help you practice this!";
  } else if (lowerMessage.includes('procrastinate') || lowerMessage.includes('procrastination')) {
    return "To beat procrastination, start with just 2 minutes of work on the task. Often, getting started is the hardest part!";
  } else if (lowerMessage.includes('motivate') || lowerMessage.includes('motivation')) {
    return "Visualize completing your tasks and the satisfaction you'll feel. Also, try to connect your tasks to your bigger goals and values.";
  } else if (lowerMessage.includes('help')) {
    return "I can help with productivity tips, task management strategies, focus techniques, and motivation. What specific area would you like help with?";
  } else if (lowerMessage.includes('thank')) {
    return "You're welcome! Remember, small consistent steps lead to big results. Anything else I can help with?";
  } else {
    return "I'm here to help boost your productivity! Try asking about focus techniques, beating procrastination, or effective task management.";
  }
}

module.exports = router;
