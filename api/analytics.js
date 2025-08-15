// Serverless function for analytics data operations
const fs = require('fs');
const path = require('path');

// Simple JSON file-based database
const DB_PATH = '/tmp/analytics.json';

// Initialize database if it doesn't exist
function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      visitors: [],
      chatMessages: [],
      sessions: [],
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

// Read data from database
function readDB() {
  initDB();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { visitors: [], chatMessages: [], sessions: [] };
  }
}

// Write data to database
function writeDB(data) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = readDB();

    switch (req.method) {
      case 'GET':
        // Return all analytics data
        const stats = {
          totalVisitors: db.visitors.length,
          activeVisitors: db.visitors.filter(v => 
            new Date() - new Date(v.lastSeen) < 5 * 60 * 1000 // Active in last 5 minutes
          ).length,
          totalMessages: db.chatMessages.length,
          avgResponseTime: calculateAvgResponseTime(db.chatMessages)
        };

        res.status(200).json({
          success: true,
          data: {
            visitors: db.visitors,
            chatMessages: db.chatMessages,
            sessions: db.sessions,
            stats
          }
        });
        break;

      case 'POST':
        const { type, data } = req.body;

        switch (type) {
          case 'visitor':
            // Add or update visitor
            const existingVisitorIndex = db.visitors.findIndex(v => v.sessionId === data.sessionId);
            if (existingVisitorIndex >= 0) {
              db.visitors[existingVisitorIndex] = { ...db.visitors[existingVisitorIndex], ...data, lastSeen: new Date().toISOString() };
            } else {
              db.visitors.push({ ...data, id: generateId(), lastSeen: new Date().toISOString() });
            }
            break;

          case 'message':
            // Add chat message
            db.chatMessages.push({
              ...data,
              id: generateId(),
              timestamp: new Date().toISOString()
            });
            break;

          case 'session':
            // Add session data
            db.sessions.push({
              ...data,
              id: generateId(),
              timestamp: new Date().toISOString()
            });
            break;

          default:
            return res.status(400).json({ success: false, error: 'Invalid data type' });
        }

        if (writeDB(db)) {
          res.status(200).json({ success: true, message: 'Data saved successfully' });
        } else {
          res.status(500).json({ success: false, error: 'Failed to save data' });
        }
        break;

      case 'DELETE':
        // Clear all data (for testing)
        const clearedData = {
          visitors: [],
          chatMessages: [],
          sessions: [],
          lastUpdated: new Date().toISOString()
        };
        
        if (writeDB(clearedData)) {
          res.status(200).json({ success: true, message: 'Data cleared successfully' });
        } else {
          res.status(500).json({ success: false, error: 'Failed to clear data' });
        }
        break;

      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Helper function to calculate average response time
function calculateAvgResponseTime(messages) {
  const responseTimes = [];
  
  for (let i = 0; i < messages.length - 1; i++) {
    const current = messages[i];
    const next = messages[i + 1];
    
    if (current.sender === 'user' && next.sender === 'agent') {
      const responseTime = new Date(next.timestamp) - new Date(current.timestamp);
      responseTimes.push(responseTime);
    }
  }
  
  if (responseTimes.length === 0) return 0;
  
  const avgMs = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  return Math.round(avgMs / 1000); // Convert to seconds
}