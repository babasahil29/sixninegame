# Crypto Crash Backend - Deployment Guide

This guide provides comprehensive instructions for deploying the Crypto Crash backend to various hosting platforms including Render, Railway, Heroku, and VPS servers.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Render Deployment](#render-deployment)
- [Railway Deployment](#railway-deployment)
- [Heroku Deployment](#heroku-deployment)
- [VPS Deployment](#vps-deployment)
- [Docker Deployment](#docker-deployment)
- [WebSocket Client Deployment](#websocket-client-deployment)
- [Testing Deployment](#testing-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Quick Start

For immediate deployment to Render (recommended):

1. **Upload project to GitHub**
2. **Create MongoDB Atlas database**
3. **Deploy to Render** (see [Render Deployment](#render-deployment))
4. **Seed database** with sample data
5. **Test with Postman collection**

## Prerequisites

### Required Accounts
- **GitHub Account**: For code repository
- **MongoDB Atlas Account**: For database hosting
- **Hosting Platform Account**: Choose one:
  - Render (recommended)
  - Railway
  - Heroku
  - VPS provider (DigitalOcean, AWS, etc.)

### Required Software (for local development)
- Node.js (v16 or higher)
- npm or yarn
- Git
- MongoDB (for local development)

## Local Development Setup

### 1. Extract and Setup Project

```bash
# Extract the project ZIP file
unzip crypto-crash-backend.zip
cd crypto-crash-backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/crypto-crash

# API Configuration
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Game Configuration
CACHE_DURATION=10000
GAME_ROUND_DURATION=10000
MAX_CRASH_MULTIPLIER=120
```

### 3. Start Local MongoDB

```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed Database

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

The server will be available at `http://localhost:3000`.

## Environment Configuration

### Production Environment Variables

For production deployment, configure these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/crypto-crash` |
| `COINGECKO_API_URL` | CoinGecko API base URL | `https://api.coingecko.com/api/v3` |
| `CACHE_DURATION` | Price cache duration (ms) | `10000` |
| `GAME_ROUND_DURATION` | Time between rounds (ms) | `10000` |
| `MAX_CRASH_MULTIPLIER` | Maximum crash point | `120` |

## Database Setup

### MongoDB Atlas Setup

1. **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)

2. **Create Cluster**:
   - Choose free tier (M0)
   - Select region closest to your hosting platform
   - Name your cluster (e.g., "crypto-crash")

3. **Configure Security**:
   - Create database user with read/write permissions
   - Add IP addresses to whitelist (0.0.0.0/0 for all IPs)

4. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

5. **Create Database**:
   - Database name: `crypto-crash`
   - Collection will be created automatically

### Local MongoDB Setup

For local development:

```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt update
sudo apt install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify installation
mongo --version
```

## Render Deployment

Render is the recommended hosting platform for its simplicity and free tier.

### 1. Prepare Repository

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/crypto-crash-backend.git
git push -u origin main
```

### 2. Create Render Service

1. **Sign up** at [Render](https://render.com)
2. **Connect GitHub** account
3. **Create New Web Service**:
   - Repository: Select your crypto-crash-backend repo
   - Branch: `main`
   - Root Directory: Leave empty
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

### 3. Configure Environment Variables

In Render dashboard, add environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/crypto-crash
COINGECKO_API_URL=https://api.coingecko.com/api/v3
CACHE_DURATION=10000
GAME_ROUND_DURATION=10000
MAX_CRASH_MULTIPLIER=120
```

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Note the provided URL (e.g., `https://crypto-crash-backend.onrender.com`)

### 5. Seed Production Database

After deployment, seed the database:

```bash
# Using the Render shell (if available) or run locally with production MONGODB_URI
MONGODB_URI="your-production-uri" npm run seed
```

## Railway Deployment

Railway offers excellent developer experience with automatic deployments.

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 2. Initialize Project

```bash
cd crypto-crash-backend
railway init
```

### 3. Add MongoDB Plugin

```bash
railway add mongodb
```

### 4. Configure Environment

```bash
# Set environment variables
railway variables set NODE_ENV=production
railway variables set COINGECKO_API_URL=https://api.coingecko.com/api/v3
railway variables set CACHE_DURATION=10000
railway variables set GAME_ROUND_DURATION=10000
railway variables set MAX_CRASH_MULTIPLIER=120

# MongoDB URI will be automatically set by the plugin
```

### 5. Deploy

```bash
railway up
```

## Heroku Deployment

Heroku provides a robust platform with extensive add-on ecosystem.

### 1. Install Heroku CLI

Download from [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

### 2. Create Heroku App

```bash
cd crypto-crash-backend
heroku create crypto-crash-backend-app
```

### 3. Add MongoDB Add-on

```bash
heroku addons:create mongolab:sandbox
```

### 4. Configure Environment

```bash
heroku config:set NODE_ENV=production
heroku config:set COINGECKO_API_URL=https://api.coingecko.com/api/v3
heroku config:set CACHE_DURATION=10000
heroku config:set GAME_ROUND_DURATION=10000
heroku config:set MAX_CRASH_MULTIPLIER=120
```

### 5. Deploy

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 6. Seed Database

```bash
heroku run npm run seed
```

## VPS Deployment

For full control, deploy to a Virtual Private Server.

### 1. Server Setup (Ubuntu 20.04+)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/crypto-crash-backend.git
cd crypto-crash-backend

# Install dependencies
npm install --production

# Configure environment
cp .env.example .env
# Edit .env with production values

# Seed database
npm run seed

# Start with PM2
pm2 start src/server.js --name crypto-crash-backend
pm2 save
pm2 startup
```

### 3. Configure Nginx (Optional)

```bash
# Install Nginx
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/crypto-crash-backend
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/crypto-crash-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Docker Deployment

Containerize the application for consistent deployment across environments.

### 1. Dockerfile

The project includes a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/crypto-crash
      - COINGECKO_API_URL=https://api.coingecko.com/api/v3
    depends_on:
      - mongo

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### 3. Deploy with Docker

```bash
# Build and start
docker-compose up -d

# Seed database
docker-compose exec app npm run seed

# View logs
docker-compose logs -f app
```

## WebSocket Client Deployment

Deploy the WebSocket test client to Netlify or Vercel.

### Netlify Deployment

1. **Prepare Client**:
   ```bash
   cd websocket-client
   # Update WebSocket URL in script.js to production server
   ```

2. **Deploy**:
   - Drag and drop `websocket-client` folder to [Netlify](https://netlify.com)
   - Or connect GitHub repository

### Vercel Deployment

```bash
cd websocket-client
npx vercel --prod
```

### Update WebSocket URL

In `websocket-client/script.js`, update the default server URL:

```javascript
// Change from
this.serverUrl.value = 'ws://localhost:3000';

// To your production URL
this.serverUrl.value = 'wss://your-backend-url.com';
```

## Testing Deployment

### 1. Health Check

```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "memory": {...},
  "version": "v18.x.x"
}
```

### 2. API Testing

Import the Postman collection and update the `base_url` variable to your production URL.

### 3. WebSocket Testing

1. Open the deployed WebSocket client
2. Update server URL to production
3. Test connection and basic functionality

### 4. Database Verification

```bash
# Check if data was seeded properly
curl https://your-backend-url.com/api/wallet/players
curl https://your-backend-url.com/api/game/history
```

## Monitoring and Maintenance

### Application Monitoring

1. **Health Endpoint**: Monitor `/health` for uptime
2. **Logs**: Check application logs regularly
3. **Performance**: Monitor response times and memory usage
4. **Database**: Monitor MongoDB Atlas metrics

### Automated Monitoring

Set up monitoring with services like:
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring
- **New Relic**: Application performance monitoring

### Backup Strategy

1. **Database Backups**: MongoDB Atlas provides automatic backups
2. **Code Backups**: Ensure code is in version control
3. **Environment Backups**: Document all environment variables

### Updates and Maintenance

1. **Security Updates**: Keep dependencies updated
2. **Node.js Updates**: Update Node.js version regularly
3. **Database Maintenance**: Monitor and optimize queries
4. **Log Rotation**: Implement log rotation for long-running deployments

## Troubleshooting

### Common Issues

#### 1. Connection Refused
**Problem**: Cannot connect to the server
**Solutions**:
- Check if server is running
- Verify port configuration
- Check firewall settings
- Ensure correct URL/domain

#### 2. Database Connection Failed
**Problem**: Cannot connect to MongoDB
**Solutions**:
- Verify MongoDB URI format
- Check database credentials
- Ensure IP whitelist includes server IP
- Test connection string locally

#### 3. WebSocket Connection Failed
**Problem**: WebSocket connections not working
**Solutions**:
- Ensure server supports WebSocket upgrades
- Check proxy/load balancer configuration
- Verify CORS settings
- Test with different clients

#### 4. High Memory Usage
**Problem**: Server consuming too much memory
**Solutions**:
- Check for memory leaks
- Optimize database queries
- Implement connection pooling
- Monitor garbage collection

#### 5. Rate Limiting Issues
**Problem**: API requests being rate limited
**Solutions**:
- Review rate limiting configuration
- Implement proper caching
- Optimize client request patterns
- Consider increasing limits for production

### Debug Commands

```bash
# Check server logs
pm2 logs crypto-crash-backend

# Monitor server resources
pm2 monit

# Restart server
pm2 restart crypto-crash-backend

# Check database connection
mongo "your-mongodb-uri"

# Test API endpoints
curl -X GET https://your-backend-url.com/api/game/state
curl -X POST https://your-backend-url.com/api/crypto/prices
```

### Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Connection Pooling**: Configure MongoDB connection pooling
3. **Caching**: Implement Redis for advanced caching
4. **CDN**: Use CDN for static assets
5. **Compression**: Enable gzip compression

### Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Implement appropriate rate limits
4. **Input Validation**: Validate all user inputs
5. **CORS**: Configure CORS appropriately
6. **Updates**: Keep all dependencies updated

## Support and Resources

### Documentation
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [WebSocket API](https://developer.mozilla.org/docs/Web/API/WebSocket)

### Community
- [Node.js Community](https://nodejs.org/community/)
- [Express.js Community](https://expressjs.com/community.html)
- [MongoDB Community](https://community.mongodb.com/)

### Hosting Platform Documentation
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [Heroku Documentation](https://devcenter.heroku.com/)

This deployment guide provides comprehensive instructions for deploying the Crypto Crash backend to various platforms. Choose the deployment method that best fits your needs and technical requirements.

