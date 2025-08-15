# Deployment Guide for Chat Widget with Database

This guide will help you deploy your chat widget application with database functionality to Vercel.

## Prerequisites

- Node.js 18+ installed
- Vercel CLI installed (`npm i -g vercel`)
- Git repository (optional but recommended)

## Project Structure

```
chat-app/
├── api/
│   ├── analytics.js      # Main API endpoint for analytics data
│   └── database.js       # Database schema and utilities
├── admin.html            # Admin dashboard
├── chat-widget.js        # Chat widget with database integration
├── login.html           # Authentication page
├── package.json         # Project dependencies
├── vercel.json          # Vercel configuration
└── README.md            # Project documentation
```

## Deployment Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Test Locally

```bash
# Start local development server
npm run dev

# Test the API endpoints
curl http://localhost:8080/api/analytics
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy the project
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? chat-widget-app
# - Directory? ./
# - Override settings? No
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository or upload files
4. Configure build settings (usually auto-detected)
5. Click "Deploy"

### 4. Configure Environment Variables (Optional)

If you need to set environment variables:

```bash
# Using Vercel CLI
vercel env add NODE_ENV production
vercel env add DATABASE_URL your-database-url

# Or through Vercel Dashboard:
# Project Settings > Environment Variables
```

## API Endpoints

Once deployed, your API will be available at:

- `GET /api/analytics` - Retrieve all analytics data
- `POST /api/analytics` - Store new analytics data
- `DELETE /api/analytics` - Clear all data (for testing)

### API Usage Examples

#### Get Analytics Data
```javascript
fetch('/api/analytics')
  .then(response => response.json())
  .then(data => console.log(data));
```

#### Store Visitor Data
```javascript
fetch('/api/analytics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'visitor',
    data: {
      sessionId: 'unique-session-id',
      deviceType: 'desktop',
      os: 'Windows',
      browser: 'Chrome',
      location: {
        country: 'US',
        city: 'New York'
      }
    }
  })
})
.then(response => response.json())
.then(result => console.log(result));
```

#### Store Chat Message
```javascript
fetch('/api/analytics', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'message',
    data: {
      sessionId: 'unique-session-id',
      sender: 'user',
      message: 'Hello, I need help!'
    }
  })
})
.then(response => response.json())
.then(result => console.log(result));
```

## Database Features

### Data Storage
- **Visitors**: Device info, location, traffic source, session duration
- **Messages**: Chat conversations with timestamps and response times
- **Sessions**: Session tracking with duration and page views

### Analytics Reports
- Real-time visitor tracking
- Message volume analysis
- Response time metrics
- Traffic source breakdown
- Device and browser statistics

### Data Persistence
- Uses JSON file storage in `/tmp` directory
- Automatic data initialization
- Data validation and sanitization
- Error handling with fallbacks

## Configuration

### Vercel Settings

The `vercel.json` file configures:
- Serverless function routing
- Build settings
- Environment variables
- Function timeouts

### Chat Widget Configuration

Update your chat widget integration:

```html
<!-- Set the analytics endpoint -->
<script>
  window.chatAnalyticsEndpoint = '/api/analytics';
</script>

<!-- Include the chat widget -->
<script src="/chat-widget.js"></script>
```

## Monitoring and Maintenance

### View Logs
```bash
# View function logs
vercel logs

# View specific deployment logs
vercel logs [deployment-url]
```

### Update Deployment
```bash
# Redeploy after changes
vercel --prod
```

### Database Management

- Data is stored in `/tmp` directory (ephemeral)
- For persistent storage, consider upgrading to a proper database
- Regular backups recommended for production use

## Troubleshooting

### Common Issues

1. **API not responding**
   - Check Vercel function logs
   - Verify `vercel.json` configuration
   - Ensure Node.js version compatibility

2. **CORS errors**
   - API includes CORS headers
   - Check browser console for specific errors

3. **Data not persisting**
   - `/tmp` storage is ephemeral on Vercel
   - Consider external database for production

4. **Function timeout**
   - Check function execution time
   - Optimize database operations
   - Increase timeout in `vercel.json`

### Support

For issues:
1. Check Vercel documentation
2. Review function logs
3. Test API endpoints directly
4. Verify chat widget integration

## Next Steps

1. **Production Database**: Integrate with MongoDB, PostgreSQL, or other database
2. **Authentication**: Add proper API authentication
3. **Rate Limiting**: Implement request rate limiting
4. **Monitoring**: Add application monitoring and alerts
5. **Backup**: Implement data backup strategies

## Security Considerations

- API endpoints are public by default
- Implement authentication for sensitive operations
- Validate and sanitize all input data
- Use HTTPS in production
- Regular security updates

Your chat widget with database functionality is now ready for deployment on Vercel!