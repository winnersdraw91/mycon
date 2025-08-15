// Database configuration and schema for analytics data

// Database schema definition
const SCHEMA = {
  visitors: {
    id: 'string',
    sessionId: 'string',
    deviceType: 'string',
    os: 'string',
    browser: 'string',
    location: {
      country: 'string',
      city: 'string',
      region: 'string'
    },
    trafficSource: 'string',
    pageViews: 'number',
    sessionDuration: 'number',
    lastSeen: 'string',
    isActive: 'boolean',
    referrer: 'string',
    userAgent: 'string',
    ipAddress: 'string',
    createdAt: 'string'
  },
  chatMessages: {
    id: 'string',
    sessionId: 'string',
    sender: 'string', // 'user' or 'agent'
    message: 'string',
    timestamp: 'string',
    responseTime: 'number', // in seconds
    messageType: 'string', // 'text', 'image', 'file'
    isRead: 'boolean',
    sentiment: 'string' // 'positive', 'neutral', 'negative'
  },
  sessions: {
    id: 'string',
    sessionId: 'string',
    startTime: 'string',
    endTime: 'string',
    duration: 'number',
    pageViews: 'number',
    messageCount: 'number',
    status: 'string', // 'active', 'ended', 'abandoned'
    exitPage: 'string',
    conversionGoal: 'boolean'
  }
};

// Data validation functions
function validateVisitor(data) {
  const required = ['sessionId', 'deviceType', 'os', 'browser'];
  return required.every(field => data[field] !== undefined);
}

function validateMessage(data) {
  const required = ['sessionId', 'sender', 'message'];
  return required.every(field => data[field] !== undefined);
}

function validateSession(data) {
  const required = ['sessionId', 'startTime'];
  return required.every(field => data[field] !== undefined);
}

// Data sanitization functions
function sanitizeVisitor(data) {
  return {
    sessionId: String(data.sessionId || ''),
    deviceType: String(data.deviceType || 'unknown'),
    os: String(data.os || 'unknown'),
    browser: String(data.browser || 'unknown'),
    location: {
      country: String(data.location?.country || 'unknown'),
      city: String(data.location?.city || 'unknown'),
      region: String(data.location?.region || 'unknown')
    },
    trafficSource: String(data.trafficSource || 'direct'),
    pageViews: Number(data.pageViews || 1),
    sessionDuration: Number(data.sessionDuration || 0),
    isActive: Boolean(data.isActive !== false),
    referrer: String(data.referrer || ''),
    userAgent: String(data.userAgent || ''),
    ipAddress: String(data.ipAddress || ''),
    createdAt: data.createdAt || new Date().toISOString()
  };
}

function sanitizeMessage(data) {
  return {
    sessionId: String(data.sessionId || ''),
    sender: String(data.sender || 'user'),
    message: String(data.message || ''),
    messageType: String(data.messageType || 'text'),
    isRead: Boolean(data.isRead || false),
    sentiment: String(data.sentiment || 'neutral'),
    responseTime: Number(data.responseTime || 0)
  };
}

function sanitizeSession(data) {
  return {
    sessionId: String(data.sessionId || ''),
    startTime: data.startTime || new Date().toISOString(),
    endTime: data.endTime || null,
    duration: Number(data.duration || 0),
    pageViews: Number(data.pageViews || 1),
    messageCount: Number(data.messageCount || 0),
    status: String(data.status || 'active'),
    exitPage: String(data.exitPage || ''),
    conversionGoal: Boolean(data.conversionGoal || false)
  };
}

// Database utility functions
function generateAnalyticsReport(data) {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Filter data for different time periods
  const visitors24h = data.visitors.filter(v => new Date(v.createdAt) > last24Hours);
  const visitors7d = data.visitors.filter(v => new Date(v.createdAt) > last7Days);
  const messages24h = data.chatMessages.filter(m => new Date(m.timestamp) > last24Hours);
  const sessions24h = data.sessions.filter(s => new Date(s.startTime) > last24Hours);

  return {
    overview: {
      totalVisitors: data.visitors.length,
      totalMessages: data.chatMessages.length,
      totalSessions: data.sessions.length,
      activeVisitors: data.visitors.filter(v => 
        new Date() - new Date(v.lastSeen) < 5 * 60 * 1000
      ).length
    },
    last24Hours: {
      visitors: visitors24h.length,
      messages: messages24h.length,
      sessions: sessions24h.length,
      avgSessionDuration: calculateAvgDuration(sessions24h)
    },
    last7Days: {
      visitors: visitors7d.length,
      avgResponseTime: calculateAvgResponseTime(data.chatMessages),
      topTrafficSources: getTopTrafficSources(visitors7d),
      deviceBreakdown: getDeviceBreakdown(visitors7d)
    },
    trends: {
      visitorGrowth: calculateGrowthRate(data.visitors),
      messageVolume: calculateMessageVolume(data.chatMessages),
      conversionRate: calculateConversionRate(data.sessions)
    }
  };
}

// Helper functions for analytics
function calculateAvgDuration(sessions) {
  if (sessions.length === 0) return 0;
  const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  return Math.round(totalDuration / sessions.length);
}

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
  return Math.round(avgMs / 1000);
}

function getTopTrafficSources(visitors) {
  const sources = {};
  visitors.forEach(visitor => {
    const source = visitor.trafficSource || 'direct';
    sources[source] = (sources[source] || 0) + 1;
  });
  
  return Object.entries(sources)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([source, count]) => ({ source, count }));
}

function getDeviceBreakdown(visitors) {
  const devices = {};
  visitors.forEach(visitor => {
    const device = visitor.deviceType || 'unknown';
    devices[device] = (devices[device] || 0) + 1;
  });
  
  return devices;
}

function calculateGrowthRate(visitors) {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  
  const currentPeriod = visitors.filter(v => 
    new Date(v.createdAt) > last30Days
  ).length;
  
  const previousPeriod = visitors.filter(v => 
    new Date(v.createdAt) > previous30Days && new Date(v.createdAt) <= last30Days
  ).length;
  
  if (previousPeriod === 0) return currentPeriod > 0 ? 100 : 0;
  
  return Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100);
}

function calculateMessageVolume(messages) {
  const now = new Date();
  const hourlyVolume = {};
  
  for (let i = 0; i < 24; i++) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourKey = hour.getHours();
    hourlyVolume[hourKey] = 0;
  }
  
  messages.forEach(message => {
    const messageHour = new Date(message.timestamp).getHours();
    if (hourlyVolume[messageHour] !== undefined) {
      hourlyVolume[messageHour]++;
    }
  });
  
  return hourlyVolume;
}

function calculateConversionRate(sessions) {
  if (sessions.length === 0) return 0;
  
  const conversions = sessions.filter(session => session.conversionGoal).length;
  return Math.round((conversions / sessions.length) * 100);
}

module.exports = {
  SCHEMA,
  validateVisitor,
  validateMessage,
  validateSession,
  sanitizeVisitor,
  sanitizeMessage,
  sanitizeSession,
  generateAnalyticsReport
};