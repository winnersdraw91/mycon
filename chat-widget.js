(function() {
    'use strict';

    // Chat Widget Configuration
    const WIDGET_CONFIG = {
        position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
        theme: 'modern', // modern, classic, minimal
        primaryColor: '#667eea',
        accentColor: '#764ba2',
        textColor: '#333',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        animation: 'slide', // slide, fade, bounce
        showTypingIndicator: true,
        showTimestamp: true,
        enableFileUpload: false,
        enableEmojis: true,
        maxMessages: 100,
        autoOpen: false,
        welcomeMessage: 'Hi! How can we help you today?',
        placeholderText: 'Type your message...',
        headerText: 'Chat with us',
        offlineMessage: 'We\'re currently offline. Leave us a message!'
    };

    // Visitor Analytics
    class VisitorAnalytics {
        constructor() {
            this.sessionId = this.generateSessionId();
            this.startTime = Date.now();
            this.pageViews = [];
            this.init();
        }

        generateSessionId() {
            return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        }

        init() {
            this.trackPageView();
            this.detectDevice();
            this.detectLocation();
            this.trackReferrer();
            this.startSessionTracking();
        }

        trackPageView() {
            const pageData = {
                url: window.location.href,
                title: document.title,
                timestamp: Date.now(),
                referrer: document.referrer
            };
            this.pageViews.push(pageData);
            this.sendAnalytics('pageview', pageData);
        }

        detectDevice() {
            const userAgent = navigator.userAgent;
            let deviceType = 'Desktop';
            let os = 'Unknown';
            let browser = 'Unknown';

            // Device detection
            if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
                deviceType = 'Tablet';
            } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
                deviceType = 'Mobile';
            }

            // OS detection
            if (userAgent.indexOf('Windows NT 10.0') !== -1) os = 'Windows 10';
            else if (userAgent.indexOf('Windows NT 6.2') !== -1) os = 'Windows 8';
            else if (userAgent.indexOf('Windows NT 6.1') !== -1) os = 'Windows 7';
            else if (userAgent.indexOf('Windows NT 6.0') !== -1) os = 'Windows Vista';
            else if (userAgent.indexOf('Windows NT 5.1') !== -1) os = 'Windows XP';
            else if (userAgent.indexOf('Windows NT 5.0') !== -1) os = 'Windows 2000';
            else if (userAgent.indexOf('Mac') !== -1) os = 'Mac/iOS';
            else if (userAgent.indexOf('X11') !== -1) os = 'UNIX';
            else if (userAgent.indexOf('Linux') !== -1) os = 'Linux';

            // Browser detection
            if (userAgent.indexOf('Chrome') !== -1) browser = 'Chrome';
            else if (userAgent.indexOf('Safari') !== -1) browser = 'Safari';
            else if (userAgent.indexOf('Firefox') !== -1) browser = 'Firefox';
            else if (userAgent.indexOf('Edge') !== -1) browser = 'Edge';
            else if (userAgent.indexOf('Opera') !== -1) browser = 'Opera';
            else if (userAgent.indexOf('Trident') !== -1) browser = 'Internet Explorer';

            this.deviceInfo = { deviceType, os, browser };
            this.sendAnalytics('device_info', this.deviceInfo);
        }

        detectLocation() {
            // In a real implementation, you would use an IP geolocation service
            // For demo purposes, we'll simulate this
            fetch('https://ipapi.co/json/')
                .then(response => response.json())
                .then(data => {
                    this.locationInfo = {
                        ip: data.ip,
                        country: data.country_name,
                        city: data.city,
                        region: data.region
                    };
                    this.sendAnalytics('location_info', this.locationInfo);
                })
                .catch(() => {
                    // Fallback for demo
                    this.locationInfo = {
                        ip: '192.168.1.1',
                        country: 'Unknown',
                        city: 'Unknown',
                        region: 'Unknown'
                    };
                    this.sendAnalytics('location_info', this.locationInfo);
                });
        }

        trackReferrer() {
            let source = 'Direct';
            const referrer = document.referrer;
            
            if (referrer) {
                if (referrer.includes('google.com')) source = 'Google';
                else if (referrer.includes('facebook.com')) source = 'Facebook';
                else if (referrer.includes('twitter.com')) source = 'Twitter';
                else if (referrer.includes('linkedin.com')) source = 'LinkedIn';
                else if (referrer.includes('youtube.com')) source = 'YouTube';
                else if (referrer.includes('instagram.com')) source = 'Instagram';
                else source = 'Referral';
            }

            this.trafficSource = { source, referrer };
            this.sendAnalytics('traffic_source', this.trafficSource);
        }

        startSessionTracking() {
            // Track session duration
            setInterval(() => {
                const sessionDuration = Date.now() - this.startTime;
                this.sendAnalytics('session_update', {
                    sessionId: this.sessionId,
                    duration: sessionDuration,
                    pageViews: this.pageViews.length
                });
            }, 30000); // Update every 30 seconds

            // Track page visibility changes
            document.addEventListener('visibilitychange', () => {
                this.sendAnalytics('visibility_change', {
                    hidden: document.hidden,
                    timestamp: Date.now()
                });
            });
        }

        sendAnalytics(eventType, data) {
            const analyticsEvent = {
                eventType: eventType,
                data: data,
                timestamp: new Date().toISOString(),
                sessionId: this.sessionId
            };

            // Store in localStorage for admin dashboard (fallback)
            const existingEvents = JSON.parse(localStorage.getItem('chatAnalytics') || '[]');
            existingEvents.push(analyticsEvent);
            localStorage.setItem('chatAnalytics', JSON.stringify(existingEvents));

            // Send to database API endpoint
            this.sendToDatabase(eventType, data);

            console.log('Analytics Event:', analyticsEvent);
        }

        async sendToDatabase(eventType, data) {
            try {
                const apiEndpoint = window.chatAnalyticsEndpoint || '/api/analytics';
                
                let apiData = {};
                let apiType = '';

                // Map event types to database structure
                switch (eventType) {
                    case 'session_start':
                    case 'device_info':
                    case 'location':
                    case 'traffic_source':
                    case 'page_view':
                    case 'session_update':
                        apiType = 'visitor';
                        apiData = {
                            sessionId: this.sessionId,
                            ...data,
                            lastSeen: new Date().toISOString()
                        };
                        break;
                    
                    case 'chat_message':
                        apiType = 'message';
                        apiData = {
                            sessionId: this.sessionId,
                            ...data
                        };
                        break;
                    
                    default:
                        apiType = 'session';
                        apiData = {
                            sessionId: this.sessionId,
                            ...data
                        };
                }

                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: apiType,
                        data: apiData
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Data sent to database:', result);
            } catch (error) {
                console.log('Database API not available, using localStorage fallback:', error);
            }
        }
    }

    // Chat Widget Class
    class ChatWidget {
        constructor(config = {}) {
            this.config = { ...WIDGET_CONFIG, ...config };
            this.isOpen = false;
            this.messages = [];
            this.isTyping = false;
            this.analytics = new VisitorAnalytics();
            this.init();
        }

        init() {
            this.createStyles();
            this.createWidget();
            this.bindEvents();
            
            if (this.config.autoOpen) {
                setTimeout(() => this.openChat(), 2000);
            }

            // Add welcome message
            if (this.config.welcomeMessage) {
                setTimeout(() => {
                    this.addMessage(this.config.welcomeMessage, 'agent');
                }, 1000);
            }
        }

        createStyles() {
            const styles = `
                .chat-widget {
                    position: fixed;
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    ${this.getPositionStyles()}
                }

                .chat-toggle {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.config.accentColor});
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    color: white;
                    font-size: 24px;
                }

                .chat-toggle:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
                }

                .chat-window {
                    width: 350px;
                    height: 500px;
                    background: ${this.config.backgroundColor};
                    border-radius: ${this.config.borderRadius};
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    margin-bottom: 20px;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                }

                .chat-window.open {
                    display: flex;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .chat-header {
                    background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.config.accentColor});
                    color: white;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .chat-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }

                .chat-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .chat-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background: #f8f9fa;
                }

                .message {
                    margin-bottom: 15px;
                    display: flex;
                    align-items: flex-end;
                }

                .message.user {
                    justify-content: flex-end;
                }

                .message-bubble {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    font-size: 14px;
                    line-height: 1.4;
                    word-wrap: break-word;
                }

                .message.user .message-bubble {
                    background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.config.accentColor});
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message.agent .message-bubble {
                    background: white;
                    color: ${this.config.textColor};
                    border: 1px solid #e1e5e9;
                    border-bottom-left-radius: 4px;
                }

                .message-time {
                    font-size: 11px;
                    color: #999;
                    margin-top: 4px;
                    text-align: center;
                }

                .typing-indicator {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    background: white;
                    border-radius: 18px;
                    border-bottom-left-radius: 4px;
                    margin-bottom: 15px;
                    border: 1px solid #e1e5e9;
                }

                .typing-dots {
                    display: flex;
                    gap: 4px;
                }

                .typing-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #999;
                    animation: typingAnimation 1.4s infinite;
                }

                .typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typingAnimation {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.5;
                    }
                    30% {
                        transform: translateY(-10px);
                        opacity: 1;
                    }
                }

                .chat-input {
                    padding: 20px;
                    border-top: 1px solid #e1e5e9;
                    background: white;
                }

                .input-container {
                    display: flex;
                    gap: 10px;
                    align-items: flex-end;
                }

                .chat-input input {
                    flex: 1;
                    border: 1px solid #e1e5e9;
                    border-radius: 20px;
                    padding: 12px 16px;
                    font-size: 14px;
                    outline: none;
                    resize: none;
                    font-family: inherit;
                }

                .chat-input input:focus {
                    border-color: ${this.config.primaryColor};
                }

                .send-button {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.config.accentColor});
                    border: none;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transition: all 0.2s ease;
                }

                .send-button:hover {
                    transform: scale(1.05);
                }

                .send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                @media (max-width: 480px) {
                    .chat-window {
                        width: 100vw;
                        height: 100vh;
                        border-radius: 0;
                        margin: 0;
                    }
                    
                    .chat-widget {
                        bottom: 0;
                        right: 0;
                        left: 0;
                        top: 0;
                    }
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        }

        getPositionStyles() {
            const positions = {
                'bottom-right': 'bottom: 20px; right: 20px;',
                'bottom-left': 'bottom: 20px; left: 20px;',
                'top-right': 'top: 20px; right: 20px;',
                'top-left': 'top: 20px; left: 20px;'
            };
            return positions[this.config.position] || positions['bottom-right'];
        }

        createWidget() {
            const widget = document.createElement('div');
            widget.className = 'chat-widget';
            widget.innerHTML = `
                <div class="chat-window" id="chatWindow">
                    <div class="chat-header">
                        <h3>${this.config.headerText}</h3>
                        <button class="chat-close" id="chatClose">×</button>
                    </div>
                    <div class="chat-messages" id="chatMessages"></div>
                    <div class="chat-input">
                        <div class="input-container">
                            <input type="text" id="messageInput" placeholder="${this.config.placeholderText}" maxlength="500">
                            <button class="send-button" id="sendButton">➤</button>
                        </div>
                    </div>
                </div>
                <button class="chat-toggle" id="chatToggle">💬</button>
            `;

            document.body.appendChild(widget);
            this.widget = widget;
        }

        bindEvents() {
            const toggle = this.widget.querySelector('#chatToggle');
            const close = this.widget.querySelector('#chatClose');
            const input = this.widget.querySelector('#messageInput');
            const sendButton = this.widget.querySelector('#sendButton');

            toggle.addEventListener('click', () => this.toggleChat());
            close.addEventListener('click', () => this.closeChat());
            sendButton.addEventListener('click', () => this.sendMessage());
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            input.addEventListener('input', () => {
                this.handleTyping();
            });
        }

        toggleChat() {
            if (this.isOpen) {
                this.closeChat();
            } else {
                this.openChat();
            }
        }

        openChat() {
            const window = this.widget.querySelector('#chatWindow');
            const toggle = this.widget.querySelector('#chatToggle');
            
            window.classList.add('open');
            toggle.style.display = 'none';
            this.isOpen = true;

            // Focus input
            setTimeout(() => {
                this.widget.querySelector('#messageInput').focus();
            }, 300);

            // Track chat open event
            this.analytics.sendAnalytics('chat_opened', {
                timestamp: Date.now()
            });
        }

        closeChat() {
            const window = this.widget.querySelector('#chatWindow');
            const toggle = this.widget.querySelector('#chatToggle');
            
            window.classList.remove('open');
            toggle.style.display = 'flex';
            this.isOpen = false;

            // Track chat close event
            this.analytics.sendAnalytics('chat_closed', {
                timestamp: Date.now(),
                messageCount: this.messages.length
            });
        }

        sendMessage() {
            const input = this.widget.querySelector('#messageInput');
            const message = input.value.trim();
            
            if (!message) return;

            this.addMessage(message, 'user');
            input.value = '';

            // Track message sent
            this.analytics.sendAnalytics('message_sent', {
                message: message,
                timestamp: Date.now()
            });

            // Send chat message analytics
            this.analytics.sendAnalytics('chat_message', {
                message: message,
                type: 'visitor',
                sender: 'Visitor'
            });

            // Simulate agent response
            this.simulateAgentResponse();
        }

        addMessage(text, sender, timestamp = null) {
            const messagesContainer = this.widget.querySelector('#chatMessages');
            const messageTime = timestamp || new Date();
            
            const messageElement = document.createElement('div');
            messageElement.className = `message ${sender}`;
            
            messageElement.innerHTML = `
                <div class="message-bubble">${this.escapeHtml(text)}</div>
                ${this.config.showTimestamp ? `<div class="message-time">${this.formatTime(messageTime)}</div>` : ''}
            `;

            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            this.messages.push({
                text,
                sender,
                timestamp: messageTime
            });

            // Limit message history
            if (this.messages.length > this.config.maxMessages) {
                this.messages.shift();
                messagesContainer.removeChild(messagesContainer.firstChild);
            }
        }

        simulateAgentResponse() {
            if (this.config.showTypingIndicator) {
                this.showTypingIndicator();
            }

            setTimeout(() => {
                this.hideTypingIndicator();
                
                const responses = [
                    "Thanks for your message! How can I help you today?",
                    "I'll be happy to assist you with that.",
                    "Let me check that information for you.",
                    "That's a great question! Let me help you with that.",
                    "I understand your concern. Let me provide you with more details."
                ];
                
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                this.addMessage(randomResponse, 'agent');

                // Track agent response
                this.analytics.sendAnalytics('agent_response', {
                    response: randomResponse,
                    timestamp: Date.now()
                });

                // Send agent response analytics
                this.analytics.sendAnalytics('chat_message', {
                    message: randomResponse,
                    type: 'agent',
                    sender: 'Support Agent'
                });
            }, Math.random() * 2000 + 1000); // 1-3 seconds delay
        }

        showTypingIndicator() {
            const messagesContainer = this.widget.querySelector('#chatMessages');
            
            const typingElement = document.createElement('div');
            typingElement.className = 'typing-indicator';
            typingElement.id = 'typingIndicator';
            typingElement.innerHTML = `
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;

            messagesContainer.appendChild(typingElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            this.isTyping = true;
        }

        hideTypingIndicator() {
            const typingIndicator = this.widget.querySelector('#typingIndicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            this.isTyping = false;
        }

        handleTyping() {
            // Track user typing
            this.analytics.sendAnalytics('user_typing', {
                timestamp: Date.now()
            });
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        formatTime(date) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    // Auto-initialize if script is loaded directly
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.chatWidget = new ChatWidget(window.chatWidgetConfig || {});
        });
    } else {
        window.chatWidget = new ChatWidget(window.chatWidgetConfig || {});
    }

    // Export for manual initialization
    window.ChatWidget = ChatWidget;
})();