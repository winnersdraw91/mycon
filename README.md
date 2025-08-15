# 🚀 Self-Hosted Real-Time Chat Application

A comprehensive self-hosted real-time chat application with visitor analytics, admin dashboard, and embeddable chat widget.

## ✨ Features

### Admin Dashboard
- **Real-time Analytics**: Active visitors, total chats, response times, unique countries
- **Visitor Tracking**: IP address, country, device type, OS, browser, traffic source
- **Live Chat Monitoring**: Real-time message feed from all conversations
- **Modern UI**: Glassmorphic design with smooth animations

### Chat Widget
- **Embeddable**: Works on any website with simple script inclusion
- **Responsive Design**: Adapts to mobile and desktop
- **Real-time Messaging**: Instant chat with typing indicators
- **Professional UI**: Modern chat bubble and window design

### Analytics Tracked
- **Traffic Source**: Referrer tracking (Google, Facebook, direct, etc.)
- **Device Information**: Desktop/Mobile/Tablet detection
- **Operating System**: Windows, macOS, Linux detection
- **IP & Location**: Country detection from IP
- **Browser Information**: Chrome, Firefox, Safari, etc.
- **Current Page**: Real-time page tracking
- **Session Duration**: Time spent on site

## 📁 Project Structure

```
chat-app/
├── admin.html          # Admin dashboard with analytics
├── chat-widget.js      # Embeddable chat widget
├── demo.html          # Demo page showcasing integration
└── README.md          # This file
```

## 🚀 Quick Start

### 1. View Admin Dashboard
Open `admin.html` in your browser to see the analytics dashboard:
```bash
# Open in browser
open admin.html
# or
start admin.html
```

### 2. Test Chat Widget
Open `demo.html` to see the chat widget in action:
```bash
# Open in browser
open demo.html
# or
start demo.html
```

### 3. Embed on Your Website
Add the following code to your website:

```html
<!-- Chat Widget Configuration -->
<script>
    window.chatWidgetConfig = {
        position: 'bottom-right',
        primaryColor: '#667eea',
        accentColor: '#764ba2',
        headerText: 'Chat with us',
        welcomeMessage: 'Hi! How can we help you today?',
        placeholderText: 'Type your message...',
        showTypingIndicator: true,
        showTimestamp: true,
        autoOpen: false
    };
</script>

<!-- Load Chat Widget -->
<script src="path/to/chat-widget.js"></script>
```

## ⚙️ Configuration Options

### Chat Widget Configuration

```javascript
window.chatWidgetConfig = {
    // Position: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    position: 'bottom-right',
    
    // Theme: 'modern', 'classic', 'minimal'
    theme: 'modern',
    
    // Colors
    primaryColor: '#667eea',
    accentColor: '#764ba2',
    textColor: '#333',
    backgroundColor: '#ffffff',
    
    // Appearance
    borderRadius: '12px',
    animation: 'slide', // 'slide', 'fade', 'bounce'
    
    // Features
    showTypingIndicator: true,
    showTimestamp: true,
    enableFileUpload: false,
    enableEmojis: true,
    
    // Behavior
    maxMessages: 100,
    autoOpen: false,
    
    // Text
    welcomeMessage: 'Hi! How can we help you today?',
    placeholderText: 'Type your message...',
    headerText: 'Chat with us',
    offlineMessage: 'We\'re currently offline. Leave us a message!'
};
```

### Analytics Configuration

```javascript
// Set analytics endpoint (optional)
window.chatAnalyticsEndpoint = '/api/analytics';
```

## 🔧 Implementation Steps for Production

### Backend Setup
1. **WebSocket Server**: Replace mock data with real WebSocket server (Node.js + Socket.IO)
2. **Database**: Add MongoDB/PostgreSQL for persistent storage
3. **IP Geolocation**: Integrate with services like MaxMind or IPinfo
4. **Authentication**: Add admin login system

### Additional Features
1. **File Uploads**: Support for sending files in chat
2. **Email Notifications**: Alert admins of new chats
3. **Canned Responses**: Quick reply templates
4. **Chat Assignment**: Route chats to specific agents

## 🛠️ Tech Stack Suggestions

### Backend
- **Node.js + Express**: Server framework
- **Socket.IO**: Real-time communication
- **MongoDB or PostgreSQL**: Data storage
- **Redis**: Session management

### Frontend
- **Vanilla JS**: As shown (or React/Vue)
- **Socket.IO client**: Real-time communication
- **Modern CSS**: With animations

## 📊 Analytics Events Tracked

The chat widget automatically tracks the following events:

- `pageview`: When a page is loaded
- `device_info`: Device, OS, and browser information
- `location_info`: IP and geographical location
- `traffic_source`: Referrer and traffic source
- `session_update`: Session duration and activity
- `visibility_change`: Page visibility changes
- `chat_opened`: When chat is opened
- `chat_closed`: When chat is closed
- `message_sent`: When user sends a message
- `agent_response`: When agent responds
- `user_typing`: When user is typing

## 🎨 Customization

### Styling
The chat widget uses CSS custom properties for easy theming:

```css
:root {
    --chat-primary-color: #667eea;
    --chat-accent-color: #764ba2;
    --chat-text-color: #333;
    --chat-bg-color: #ffffff;
    --chat-border-radius: 12px;
}
```

### Custom Messages
You can programmatically add messages:

```javascript
// Add a message from agent
window.chatWidget.addMessage('Hello! How can I help?', 'agent');

// Add a message from user
window.chatWidget.addMessage('I need help', 'user');
```

### Event Listeners
Listen to chat events:

```javascript
// Listen for chat events
document.addEventListener('chatOpened', function() {
    console.log('Chat was opened');
});

document.addEventListener('chatClosed', function() {
    console.log('Chat was closed');
});

document.addEventListener('messageSent', function(event) {
    console.log('Message sent:', event.detail.message);
});
```

## 📱 Mobile Responsiveness

The chat widget is fully responsive:
- **Desktop**: Standard floating widget
- **Mobile**: Full-screen overlay for better UX
- **Tablet**: Optimized sizing and touch interactions

## 🔒 Security Considerations

1. **Input Sanitization**: All user inputs are escaped to prevent XSS
2. **Rate Limiting**: Implement rate limiting for message sending
3. **Authentication**: Add proper authentication for admin dashboard
4. **HTTPS**: Always use HTTPS in production
5. **Data Privacy**: Comply with GDPR and other privacy regulations

## 🚀 Deployment

### Static Hosting
For the current version (frontend-only):
1. Upload files to any web server
2. Serve over HTTPS
3. Update analytics endpoint if needed

### Full Stack Deployment
For production with backend:
1. Deploy backend server (Node.js)
2. Set up database (MongoDB/PostgreSQL)
3. Configure WebSocket server
4. Set up analytics collection
5. Deploy frontend files

## 📈 Performance

- **Lightweight**: Minimal JavaScript footprint
- **Fast Loading**: Optimized CSS and JS
- **Efficient**: Event-driven architecture
- **Scalable**: Ready for WebSocket scaling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Check the documentation
- Review the demo implementation

---

**Built with ❤️ for better customer communication**