# Crypto Crash - Complete Deployment Guide

**Author:** Manus AI  
**Version:** 1.0  
**Date:** August 8, 2025

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Local Development Setup](#local-development-setup)
5. [Production Deployment](#production-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [Frontend Deployment](#frontend-deployment)
9. [Backend Deployment](#backend-deployment)
10. [Monitoring and Maintenance](#monitoring-and-maintenance)
11. [Troubleshooting](#troubleshooting)
12. [Security Considerations](#security-considerations)

## Project Overview

Crypto Crash is a real-time multiplayer crash game that combines cryptocurrency trading simulation with gambling mechanics. The application consists of two main components:

- **Backend**: Node.js/Express.js server with WebSocket support, MongoDB database, and cryptocurrency price integration
- **Frontend**: React.js application with real-time updates, modern UI components, and responsive design

The game allows players to bet in USD (converted to cryptocurrency), watch a multiplier increase exponentially, and cash out before the game "crashes" at a random point. The system implements provably fair algorithms to ensure transparency and includes comprehensive wallet simulation with transaction logging.



## Architecture

The Crypto Crash application follows a modern full-stack architecture designed for scalability, real-time performance, and maintainability. The system is built using industry-standard technologies and follows best practices for web application development.

### System Components

The application architecture consists of several interconnected components that work together to deliver a seamless gaming experience. The frontend serves as the user interface, providing an interactive and responsive experience for players. The backend handles all business logic, game mechanics, and data persistence. Real-time communication between frontend and backend is facilitated through WebSocket connections, ensuring instant updates for multiplier changes, game events, and player actions.

The database layer uses MongoDB to store player information, game rounds, transaction history, and system configuration. MongoDB's document-based structure is particularly well-suited for this application because it can efficiently handle the varying data structures required for different types of transactions and game events. The flexible schema allows for easy expansion of features without requiring complex database migrations.

External API integration provides real-time cryptocurrency price feeds from CoinGecko, ensuring that all USD-to-cryptocurrency conversions use current market rates. This integration includes intelligent caching mechanisms to respect API rate limits while maintaining data freshness. The system implements fallback mechanisms to ensure continued operation even if external APIs become temporarily unavailable.

### Technology Stack

**Frontend Technologies:**
- React.js 18+ for component-based user interface development
- Vite for fast development builds and hot module replacement
- Tailwind CSS for utility-first styling and responsive design
- shadcn/ui for pre-built, accessible UI components
- Lucide React for consistent iconography
- Recharts for data visualization and multiplier graphs
- WebSocket API for real-time communication

**Backend Technologies:**
- Node.js runtime environment for server-side JavaScript execution
- Express.js web framework for RESTful API development
- WebSocket (ws) library for real-time bidirectional communication
- MongoDB with Mongoose ODM for data persistence and modeling
- bcrypt for cryptographic operations and provably fair algorithms
- express-rate-limit for API protection and abuse prevention
- cors for cross-origin resource sharing configuration

**Infrastructure and DevOps:**
- MongoDB Atlas for managed database hosting (production)
- PM2 for process management and application monitoring
- Nginx for reverse proxy and static file serving
- SSL/TLS certificates for secure HTTPS communication
- Docker for containerization and deployment consistency

### Data Flow Architecture

The application implements a sophisticated data flow that ensures consistency and real-time updates across all connected clients. When a game round begins, the backend generates a cryptographically secure seed and calculates the crash point using provably fair algorithms. This information is immediately broadcast to all connected clients via WebSocket, triggering the start of the multiplier animation and enabling the betting phase.

Player actions such as placing bets or cashing out are processed through the RESTful API, which validates the request, updates the database, and broadcasts relevant information to all connected clients. This dual-channel approach (HTTP for actions, WebSocket for updates) ensures both reliability and real-time responsiveness. The system maintains strict consistency by using database transactions for critical operations and implementing proper error handling throughout the data flow.

## Prerequisites

Before deploying the Crypto Crash application, ensure that your development and production environments meet the following requirements. These prerequisites are essential for proper application functionality and optimal performance.

### System Requirements

**Minimum Hardware Requirements:**
- CPU: 2 cores, 2.4 GHz or equivalent
- RAM: 4 GB minimum, 8 GB recommended
- Storage: 20 GB available disk space
- Network: Stable internet connection with minimum 10 Mbps bandwidth

**Recommended Production Hardware:**
- CPU: 4+ cores, 3.0 GHz or equivalent
- RAM: 16 GB or more
- Storage: SSD with 50+ GB available space
- Network: High-speed internet with redundant connections

### Software Dependencies

**Required Software:**
- Node.js version 16.0 or higher (LTS version recommended)
- npm version 8.0 or higher, or pnpm version 7.0 or higher
- MongoDB version 4.4 or higher (6.0+ recommended for production)
- Git version control system for code management

**Development Tools:**
- Code editor with JavaScript/React support (VS Code recommended)
- MongoDB Compass for database management and monitoring
- Postman or similar tool for API testing
- Web browser with developer tools for frontend debugging

### Network and Security Requirements

The application requires specific network configurations to function properly. Ensure that the following ports are available and properly configured in your firewall settings:

- Port 3000: Backend API server (configurable via environment variables)
- Port 5173: Frontend development server (Vite default)
- Port 27017: MongoDB database connection (default MongoDB port)
- Port 80/443: HTTP/HTTPS for production web traffic

For production deployments, implement proper SSL/TLS certificates to ensure secure communication between clients and servers. The application handles sensitive financial data and requires encrypted connections to maintain user trust and comply with security best practices.

### External Service Dependencies

The application integrates with external services that require proper configuration and potentially API keys or authentication credentials:

**CoinGecko API:** Used for real-time cryptocurrency price feeds. While the free tier is sufficient for development and small-scale deployments, production environments with high traffic may require a paid plan to ensure adequate rate limits and service reliability.

**MongoDB Atlas (Optional):** For production deployments, consider using MongoDB Atlas for managed database hosting. This service provides automatic backups, monitoring, and scaling capabilities that significantly reduce operational overhead.

### Environment-Specific Considerations

**Development Environment:** The development setup is designed to run entirely on localhost with minimal configuration. MongoDB can be installed locally or run via Docker containers. The frontend development server includes hot module replacement for efficient development workflows.

**Production Environment:** Production deployments require additional considerations including process management, load balancing, monitoring, and backup strategies. The application is designed to be stateless, making it suitable for horizontal scaling across multiple server instances.

**Cloud Deployment:** The application is compatible with major cloud platforms including AWS, Google Cloud Platform, Azure, and DigitalOcean. Container-based deployments using Docker are supported and recommended for consistent deployment across different environments.


## Local Development Setup

Setting up the Crypto Crash application for local development is straightforward and designed to get developers up and running quickly. The following steps will guide you through the complete setup process, from initial installation to running both frontend and backend components.

### Initial Project Setup

Begin by extracting the complete project archive to your desired development directory. The project structure includes both backend and frontend components in separate directories, along with comprehensive documentation and configuration files.

```bash
# Extract the project archive
unzip crypto-crash-complete.zip
cd crypto-crash-project

# Verify project structure
ls -la
# Should show: crypto-crash-backend/ crypto-crash-frontend/ DEPLOYMENT_GUIDE.md
```

The project follows a monorepo-style organization where both frontend and backend are contained within the same parent directory. This structure facilitates easier development workflows and ensures that both components remain synchronized during development.

### Backend Development Setup

The backend setup involves installing dependencies, configuring the database connection, and starting the development server. Navigate to the backend directory and follow these steps:

```bash
# Navigate to backend directory
cd crypto-crash-backend

# Install Node.js dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit environment variables as needed
nano .env
```

The environment configuration file contains all necessary settings for local development. The default values are optimized for localhost development, but you may need to adjust certain parameters based on your specific setup requirements.

**Key Environment Variables for Development:**
- `PORT=3000`: Backend server port
- `NODE_ENV=development`: Enables development features and logging
- `MONGODB_URI=mongodb://localhost:27017/crypto-crash`: Local MongoDB connection
- `GAME_ROUND_DURATION=10000`: Time between game rounds (10 seconds)
- `CACHE_DURATION=10000`: Cryptocurrency price cache duration

### Database Setup for Development

MongoDB installation and configuration is required for the backend to function properly. The application uses MongoDB to store player data, game rounds, transaction history, and system configuration.

**Installing MongoDB on Ubuntu/Debian:**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list and install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Installing MongoDB on macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

**Installing MongoDB on Windows:**
Download the MongoDB Community Server installer from the official MongoDB website and follow the installation wizard. Ensure that MongoDB is configured to run as a Windows service for automatic startup.

**Alternative: Using Docker for MongoDB:**
If you prefer containerized development, MongoDB can be run using Docker:

```bash
# Run MongoDB in Docker container
docker run -d \
  --name mongodb-crypto-crash \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:6.0

# Verify MongoDB is running
docker ps | grep mongodb-crypto-crash
```

### Starting the Backend Development Server

Once MongoDB is running and environment variables are configured, start the backend development server:

```bash
# From the crypto-crash-backend directory
npm run dev

# Alternative: start in production mode
npm start
```

The development server includes automatic restart functionality when files are modified, making the development process more efficient. You should see output indicating successful database connection and WebSocket server initialization:

```
Server running on port 3000
WebSocket server ready
Environment: development
Starting game loop...
MongoDB Connected: localhost
```

The backend automatically begins running game rounds every 10 seconds, generating crash points and broadcasting updates to connected WebSocket clients. This continuous operation simulates the live gaming environment and allows for comprehensive testing of all game mechanics.

### Frontend Development Setup

The frontend setup process involves installing dependencies and starting the development server with hot module replacement enabled:

```bash
# Navigate to frontend directory
cd ../crypto-crash-frontend

# Install dependencies using pnpm (recommended)
pnpm install

# Alternative: using npm
npm install

# Start development server
pnpm run dev --host

# Alternative: using npm
npm run dev -- --host
```

The `--host` flag enables network access to the development server, allowing testing from other devices on the same network. This is particularly useful for mobile testing and multi-device development workflows.

The frontend development server will start on port 5173 by default and provide the following output:

```
VITE v6.3.5  ready in 684 ms
➜  Local:   http://localhost:5173/
➜  Network: http://[your-ip]:5173/
➜  press h + enter to show help
```

### Development Workflow

With both servers running, you can access the complete application by navigating to `http://localhost:5173` in your web browser. The frontend will automatically connect to the backend WebSocket server and begin receiving real-time game updates.

**Recommended Development Workflow:**
1. Keep both backend and frontend servers running in separate terminal windows
2. Use browser developer tools to monitor WebSocket connections and API requests
3. Test game functionality by placing bets and observing real-time multiplier updates
4. Monitor backend logs for game events, database operations, and error messages
5. Use MongoDB Compass to inspect database collections and document structures

**Hot Reload and Development Features:**
The development setup includes hot module replacement for the frontend, meaning changes to React components will be reflected immediately in the browser without losing application state. The backend server also supports automatic restart when files are modified, ensuring that code changes are quickly reflected in the running application.

**Testing Real-time Functionality:**
To fully test the real-time aspects of the application, open multiple browser windows or tabs pointing to the frontend URL. Actions performed in one window (such as placing bets) should be immediately reflected in all other connected clients, demonstrating the real-time synchronization capabilities of the WebSocket implementation.

### Development Tools and Debugging

Several tools and techniques can enhance the development experience and help with debugging:

**Browser Developer Tools:** Use the Network tab to monitor HTTP API requests and the Console tab to view WebSocket message traffic. The React Developer Tools extension provides additional insights into component state and props.

**MongoDB Compass:** This graphical interface for MongoDB allows you to inspect database collections, run queries, and monitor database performance. Connect to `mongodb://localhost:27017` to access your local development database.

**API Testing:** Use tools like Postman or curl to test backend API endpoints independently of the frontend. The backend includes comprehensive API documentation with example requests and responses.

**Log Monitoring:** Both frontend and backend generate detailed logs during development. Monitor these logs to understand application behavior and identify potential issues early in the development process.


## Production Deployment

Deploying the Crypto Crash application to production requires careful consideration of performance, security, scalability, and reliability factors. This section provides comprehensive guidance for deploying both frontend and backend components in production environments, including cloud platforms and traditional server infrastructure.

### Production Architecture Overview

A production deployment typically involves multiple components working together to ensure high availability and optimal performance. The recommended production architecture includes a reverse proxy (Nginx), process manager (PM2), managed database service (MongoDB Atlas), and SSL termination for secure communications.

The frontend should be built as static assets and served through a content delivery network (CDN) or high-performance web server. The backend requires a robust process management solution to handle automatic restarts, load balancing, and monitoring. Database operations should utilize a managed MongoDB service to ensure proper backups, monitoring, and scaling capabilities.

### Server Requirements and Sizing

Production server requirements depend on expected user load and concurrent connections. For a small to medium-scale deployment supporting up to 1,000 concurrent users, the following specifications are recommended:

**Application Server:**
- CPU: 4-8 cores, 3.0 GHz or higher
- RAM: 16-32 GB
- Storage: SSD with 100+ GB available space
- Network: High-speed internet with redundant connections
- Operating System: Ubuntu 20.04 LTS or CentOS 8+

**Database Server (if self-hosted):**
- CPU: 4-8 cores optimized for database workloads
- RAM: 32+ GB with sufficient buffer pool allocation
- Storage: High-performance SSD with 500+ GB capacity
- Network: Low-latency connection to application servers

For larger deployments, consider implementing horizontal scaling with multiple application server instances behind a load balancer. The stateless nature of the application makes it well-suited for horizontal scaling strategies.

### Environment Configuration for Production

Production environment configuration requires careful attention to security, performance, and monitoring settings. Create a production-specific environment file with the following considerations:

```bash
# Production environment variables
NODE_ENV=production
PORT=3000

# Database configuration with connection pooling
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crypto-crash?retryWrites=true&w=majority

# API configuration with rate limiting
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Game configuration optimized for production
CACHE_DURATION=30000
GAME_ROUND_DURATION=15000
MAX_CRASH_MULTIPLIER=100

# Security and monitoring
LOG_LEVEL=info
ENABLE_CORS=true
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=1000
```

**Security Considerations for Environment Variables:**
Never commit production environment files to version control. Use secure secret management systems such as AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault for sensitive configuration data. Implement proper access controls and audit logging for all configuration changes.

### Database Setup and Configuration

For production deployments, MongoDB Atlas is strongly recommended due to its comprehensive management features, automatic backups, and built-in monitoring capabilities. However, self-hosted MongoDB installations are also supported with proper configuration.

**MongoDB Atlas Setup:**
1. Create a MongoDB Atlas account and new cluster
2. Configure network access to allow connections from your application servers
3. Create a database user with appropriate permissions
4. Obtain the connection string and update your environment configuration
5. Configure backup schedules and monitoring alerts

**Self-Hosted MongoDB Configuration:**
If deploying MongoDB on your own infrastructure, implement the following production configurations:

```javascript
// MongoDB production configuration
{
  "storage": {
    "dbPath": "/var/lib/mongodb",
    "journal": {
      "enabled": true
    },
    "wiredTiger": {
      "engineConfig": {
        "cacheSizeGB": 8
      }
    }
  },
  "systemLog": {
    "destination": "file",
    "logAppend": true,
    "path": "/var/log/mongodb/mongod.log"
  },
  "net": {
    "port": 27017,
    "bindIp": "127.0.0.1"
  },
  "replication": {
    "replSetName": "crypto-crash-rs"
  }
}
```

**Database Indexing and Performance:**
Implement appropriate database indexes to ensure optimal query performance:

```javascript
// Recommended indexes for production
db.players.createIndex({ "playerId": 1 }, { unique: true })
db.gamerounds.createIndex({ "roundId": 1 }, { unique: true })
db.gamerounds.createIndex({ "startTime": -1 })
db.transactions.createIndex({ "playerId": 1, "timestamp": -1 })
db.transactions.createIndex({ "transactionType": 1, "timestamp": -1 })
```

### Process Management and Monitoring

Production deployments require robust process management to ensure application availability and automatic recovery from failures. PM2 is the recommended process manager for Node.js applications, providing clustering, monitoring, and automatic restart capabilities.

**PM2 Configuration:**
Create a PM2 ecosystem file for production deployment:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'crypto-crash-backend',
    script: 'src/server.js',
    cwd: '/path/to/crypto-crash-backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/var/log/crypto-crash/combined.log',
    out_file: '/var/log/crypto-crash/out.log',
    error_file: '/var/log/crypto-crash/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=4096'
  }]
}
```

**Starting the Production Application:**
```bash
# Install PM2 globally
npm install -g pm2

# Start application using ecosystem file
pm2 start ecosystem.config.js --env production

# Save PM2 configuration for automatic startup
pm2 save
pm2 startup

# Monitor application status
pm2 status
pm2 logs crypto-crash-backend
```

### Reverse Proxy Configuration

Nginx serves as the reverse proxy, handling SSL termination, static file serving, and load balancing. The following configuration provides a robust foundation for production deployments:

```nginx
# /etc/nginx/sites-available/crypto-crash
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Frontend static files
    location / {
        root /path/to/crypto-crash-frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Backend API proxy
    location /api/ {
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

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### SSL Certificate Management

Secure communication is essential for production deployments. Implement SSL/TLS certificates using Let's Encrypt for free certificates or commercial certificate authorities for extended validation certificates.

**Let's Encrypt Certificate Setup:**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify automatic renewal
sudo certbot renew --dry-run
```

**Certificate Renewal Automation:**
Configure automatic certificate renewal using cron jobs:

```bash
# Add to crontab
0 12 * * * /usr/bin/certbot renew --quiet
```

### Load Balancing and High Availability

For high-traffic deployments, implement load balancing across multiple application server instances. The stateless nature of the Crypto Crash application makes it well-suited for horizontal scaling.

**Nginx Load Balancing Configuration:**
```nginx
upstream crypto_crash_backend {
    least_conn;
    server 127.0.0.1:3000 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3001 weight=1 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3002 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    # ... SSL configuration ...
    
    location /api/ {
        proxy_pass http://crypto_crash_backend;
        # ... proxy headers ...
    }
}
```

**Session Affinity for WebSockets:**
WebSocket connections require session affinity to ensure consistent connections. Configure Nginx to use IP hash-based load balancing for WebSocket endpoints:

```nginx
upstream crypto_crash_websocket {
    ip_hash;
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}
```


## Frontend Deployment

The frontend deployment process involves building the React application into optimized static assets and serving them through a high-performance web server or content delivery network. This section covers the complete frontend deployment workflow, from build optimization to CDN configuration.

### Building for Production

The frontend build process optimizes the React application for production by minifying JavaScript and CSS, optimizing images, and implementing code splitting for improved loading performance. The build process also generates source maps for debugging and implements cache-busting strategies for efficient browser caching.

```bash
# Navigate to frontend directory
cd crypto-crash-frontend

# Install production dependencies
pnpm install --frozen-lockfile

# Build for production
pnpm run build

# Verify build output
ls -la dist/
```

The build process generates a `dist/` directory containing all optimized static assets. The typical build output includes:

- `index.html`: Main HTML file with optimized asset references
- `assets/`: Directory containing minified JavaScript, CSS, and image files
- `vite.svg`: Application favicon and icons
- Source maps for debugging (optional in production)

**Build Optimization Configuration:**
The Vite build configuration can be customized for specific deployment requirements:

```javascript
// vite.config.js production optimizations
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable source maps for production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          charts: ['recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
```

### Static File Hosting Options

The built frontend can be deployed using various hosting solutions, each with specific advantages and configuration requirements. Choose the option that best fits your infrastructure and performance requirements.

**Option 1: Nginx Static File Serving**
For self-hosted deployments, Nginx provides excellent performance for serving static files:

```nginx
# Nginx configuration for static frontend
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    root /var/www/crypto-crash-frontend/dist;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Option 2: CDN Deployment**
Content delivery networks provide global distribution and improved performance:

```bash
# Deploy to AWS CloudFront
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

# Deploy to Cloudflare Pages
npx wrangler pages publish dist

# Deploy to Netlify
npx netlify deploy --prod --dir=dist
```

**Option 3: Container-Based Deployment**
Docker containers provide consistent deployment across different environments:

```dockerfile
# Dockerfile for frontend
FROM nginx:alpine

# Copy built assets
COPY dist/ /usr/share/nginx/html/

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Environment-Specific Configuration

Frontend applications often require different configurations for different environments. Implement environment-specific builds using Vite's environment variable system:

```javascript
// Environment-specific API endpoints
const config = {
  development: {
    API_BASE: 'http://localhost:3000/api',
    WS_URL: 'ws://localhost:3000'
  },
  production: {
    API_BASE: 'https://api.your-domain.com/api',
    WS_URL: 'wss://api.your-domain.com'
  }
}

export default config[import.meta.env.MODE] || config.development
```

**Build-Time Environment Variables:**
```bash
# Production build with environment variables
VITE_API_BASE=https://api.your-domain.com/api \
VITE_WS_URL=wss://api.your-domain.com \
pnpm run build
```

### Performance Optimization

Implement additional performance optimizations for production deployments:

**Code Splitting and Lazy Loading:**
```javascript
// Implement route-based code splitting
import { lazy, Suspense } from 'react'

const GameComponent = lazy(() => import('./components/Game'))
const WalletComponent = lazy(() => import('./components/Wallet'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/game" element={<GameComponent />} />
        <Route path="/wallet" element={<WalletComponent />} />
      </Routes>
    </Suspense>
  )
}
```

**Service Worker Implementation:**
```javascript
// Register service worker for caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered'))
      .catch(error => console.log('SW registration failed'))
  })
}
```

## Backend Deployment

Backend deployment involves configuring the Node.js application for production environments, implementing proper process management, and ensuring high availability and performance. This section provides comprehensive guidance for deploying the backend API and WebSocket server.

### Production Build Preparation

Unlike frontend applications, Node.js backend applications don't require a build step, but they do require proper dependency management and configuration for production environments:

```bash
# Navigate to backend directory
cd crypto-crash-backend

# Install production dependencies only
npm ci --only=production

# Verify all required files are present
ls -la src/ config/ scripts/

# Test production configuration
NODE_ENV=production node src/server.js
```

**Production Dependency Optimization:**
Review and optimize the package.json file to ensure only necessary dependencies are included in production deployments:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "ws": "^8.13.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^6.10.0",
    "bcrypt": "^5.1.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2"
  }
}
```

### Process Management with PM2

PM2 provides enterprise-grade process management for Node.js applications, including clustering, monitoring, and automatic restart capabilities. Configure PM2 for optimal production performance:

```javascript
// ecosystem.config.js - Advanced PM2 configuration
module.exports = {
  apps: [{
    name: 'crypto-crash-api',
    script: 'src/server.js',
    cwd: '/opt/crypto-crash-backend',
    instances: 'max',
    exec_mode: 'cluster',
    
    // Environment configuration
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      MONGODB_URI: process.env.MONGODB_URI,
      LOG_LEVEL: 'info'
    },
    
    // Logging configuration
    log_file: '/var/log/crypto-crash/combined.log',
    out_file: '/var/log/crypto-crash/out.log',
    error_file: '/var/log/crypto-crash/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Performance and reliability
    max_memory_restart: '2G',
    node_args: '--max-old-space-size=4096',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Health monitoring
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Advanced clustering options
    instance_var: 'INSTANCE_ID',
    increment_var: 'PORT'
  }]
}
```

**PM2 Deployment Commands:**
```bash
# Deploy application
pm2 start ecosystem.config.js --env production

# Monitor application performance
pm2 monit

# View logs in real-time
pm2 logs crypto-crash-api --lines 100

# Restart application with zero downtime
pm2 reload crypto-crash-api

# Scale application instances
pm2 scale crypto-crash-api 4

# Save current PM2 configuration
pm2 save

# Setup automatic startup
pm2 startup
```

### Database Connection Optimization

Production database connections require careful configuration for optimal performance and reliability:

```javascript
// config/database.js - Production MongoDB configuration
const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool settings
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      
      // Buffering settings
      bufferMaxEntries: 0,
      bufferCommands: false,
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
      
      // Compression
      compressors: ['zlib'],
      zlibCompressionLevel: 6
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err)
    })
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected')
    })
    
    mongoose.connection.on('reconnected', () => {
      console.info('MongoDB reconnected')
    })
    
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  }
}

module.exports = connectDB
```

### Security Hardening

Implement comprehensive security measures for production deployments:

**Rate Limiting Configuration:**
```javascript
// middleware/rateLimiter.js - Production rate limiting
const rateLimit = require('express-rate-limit')

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.round(windowMs / 1000)
      })
    }
  })
}

module.exports = {
  general: createRateLimiter(15 * 60 * 1000, 1000, 'Too many requests'),
  auth: createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts'),
  api: createRateLimiter(1 * 60 * 1000, 100, 'API rate limit exceeded'),
  game: createRateLimiter(10 * 1000, 10, 'Game action rate limit exceeded')
}
```

**Input Validation and Sanitization:**
```javascript
// middleware/validation.js - Enhanced validation
const { body, param, query, validationResult } = require('express-validator')

const validateBet = [
  body('playerId')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Invalid player ID format'),
    
  body('usdAmount')
    .isFloat({ min: 0.01, max: 10000 })
    .withMessage('Bet amount must be between $0.01 and $10,000'),
    
  body('cryptocurrency')
    .isIn(['bitcoin', 'ethereum'])
    .withMessage('Unsupported cryptocurrency'),
    
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }
    next()
  }
]

module.exports = { validateBet }
```

### Monitoring and Logging

Implement comprehensive monitoring and logging for production environments:

**Application Logging:**
```javascript
// utils/logger.js - Production logging configuration
const winston = require('winston')

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'crypto-crash-backend' },
  transports: [
    new winston.transports.File({ 
      filename: '/var/log/crypto-crash/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: '/var/log/crypto-crash/combined.log' 
    })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

module.exports = logger
```

**Health Check Endpoints:**
```javascript
// routes/health.js - Health monitoring endpoints
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

router.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  }
  
  res.status(200).json(health)
})

router.get('/ready', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping()
    res.status(200).json({ status: 'ready' })
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message })
  }
})

module.exports = router
```

### Container Deployment

Docker containers provide consistent deployment environments and simplified scaling:

```dockerfile
# Dockerfile for backend
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "src/server.js"]
```

**Docker Compose for Production:**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
    volumes:
      - ./logs:/var/log/crypto-crash
    restart: unless-stopped
    depends_on:
      - mongodb
    
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ../crypto-crash-frontend/dist:/usr/share/nginx/html:ro
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongodb_data:
```


## Monitoring and Maintenance

Effective monitoring and maintenance are crucial for ensuring the long-term reliability and performance of the Crypto Crash application. This section covers comprehensive monitoring strategies, maintenance procedures, and performance optimization techniques for production deployments.

### Application Performance Monitoring

Implementing robust application performance monitoring (APM) provides insights into system behavior, user experience, and potential issues before they impact users. The monitoring strategy should encompass both technical metrics and business metrics relevant to the gaming application.

**Key Performance Indicators (KPIs):**
- Response time for API endpoints (target: <200ms for 95th percentile)
- WebSocket connection stability and message latency
- Database query performance and connection pool utilization
- Memory usage and garbage collection patterns
- CPU utilization across application instances
- Concurrent user count and session duration
- Game round completion rates and crash point distribution
- Transaction success rates and error frequencies

**Monitoring Tools Integration:**
```javascript
// monitoring/metrics.js - Custom metrics collection
const prometheus = require('prom-client')

// Create custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
})

const websocketConnections = new prometheus.Gauge({
  name: 'websocket_connections_total',
  help: 'Total number of active WebSocket connections'
})

const gameRounds = new prometheus.Counter({
  name: 'game_rounds_total',
  help: 'Total number of game rounds',
  labelNames: ['status']
})

const betAmounts = new prometheus.Histogram({
  name: 'bet_amounts_usd',
  help: 'Distribution of bet amounts in USD',
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000]
})

// Middleware for HTTP request monitoring
const monitorRequests = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration)
  })
  
  next()
}

module.exports = {
  httpRequestDuration,
  websocketConnections,
  gameRounds,
  betAmounts,
  monitorRequests,
  register: prometheus.register
}
```

**Health Check Implementation:**
```javascript
// health/healthcheck.js - Comprehensive health monitoring
const mongoose = require('mongoose')
const WebSocket = require('ws')

class HealthChecker {
  constructor() {
    this.checks = new Map()
    this.registerChecks()
  }
  
  registerChecks() {
    this.checks.set('database', this.checkDatabase.bind(this))
    this.checks.set('memory', this.checkMemory.bind(this))
    this.checks.set('websocket', this.checkWebSocket.bind(this))
    this.checks.set('external_apis', this.checkExternalAPIs.bind(this))
  }
  
  async checkDatabase() {
    try {
      const start = Date.now()
      await mongoose.connection.db.admin().ping()
      const latency = Date.now() - start
      
      return {
        status: 'healthy',
        latency: `${latency}ms`,
        connections: mongoose.connection.readyState
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      }
    }
  }
  
  async checkMemory() {
    const usage = process.memoryUsage()
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024)
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024)
    const utilization = (usedMB / totalMB) * 100
    
    return {
      status: utilization < 90 ? 'healthy' : 'warning',
      heap_total: `${totalMB}MB`,
      heap_used: `${usedMB}MB`,
      utilization: `${utilization.toFixed(1)}%`
    }
  }
  
  async checkWebSocket() {
    // Implementation depends on WebSocket server setup
    return {
      status: 'healthy',
      active_connections: global.wsServer?.clients?.size || 0
    }
  }
  
  async checkExternalAPIs() {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/ping')
      return {
        status: response.ok ? 'healthy' : 'degraded',
        coingecko: response.status
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      }
    }
  }
  
  async runAllChecks() {
    const results = {}
    let overallStatus = 'healthy'
    
    for (const [name, check] of this.checks) {
      try {
        results[name] = await check()
        if (results[name].status === 'unhealthy') {
          overallStatus = 'unhealthy'
        } else if (results[name].status === 'warning' && overallStatus === 'healthy') {
          overallStatus = 'warning'
        }
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: error.message
        }
        overallStatus = 'unhealthy'
      }
    }
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results
    }
  }
}

module.exports = HealthChecker
```

### Log Management and Analysis

Comprehensive logging provides visibility into application behavior and enables rapid troubleshooting of issues. Implement structured logging with appropriate log levels and centralized log aggregation for production environments.

**Structured Logging Implementation:**
```javascript
// utils/logger.js - Enhanced production logging
const winston = require('winston')
const { ElasticsearchTransport } = require('winston-elasticsearch')

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: 'crypto-crash-backend',
      environment: process.env.NODE_ENV,
      instance: process.env.INSTANCE_ID || 'unknown',
      ...meta
    })
  })
)

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: '/var/log/crypto-crash/error.log',
      level: 'error',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: '/var/log/crypto-crash/combined.log',
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 10
    })
  ]
})

// Add Elasticsearch transport for centralized logging
if (process.env.ELASTICSEARCH_URL) {
  logger.add(new ElasticsearchTransport({
    level: 'info',
    clientOpts: { node: process.env.ELASTICSEARCH_URL },
    index: 'crypto-crash-logs'
  }))
}

// Console logging for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

module.exports = logger
```

**Log Rotation and Retention:**
```bash
# /etc/logrotate.d/crypto-crash
/var/log/crypto-crash/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nodejs nodejs
    postrotate
        /bin/kill -USR1 $(cat /var/run/crypto-crash.pid 2>/dev/null) 2>/dev/null || true
    endscript
}
```

### Database Maintenance

Regular database maintenance ensures optimal performance and prevents issues related to data growth and index fragmentation. Implement automated maintenance procedures for production MongoDB deployments.

**Database Optimization Scripts:**
```javascript
// scripts/maintenance.js - Database maintenance automation
const mongoose = require('mongoose')

class DatabaseMaintenance {
  constructor() {
    this.db = mongoose.connection.db
  }
  
  async optimizeIndexes() {
    console.log('Starting index optimization...')
    
    const collections = ['players', 'gamerounds', 'transactions']
    
    for (const collectionName of collections) {
      try {
        const collection = this.db.collection(collectionName)
        
        // Rebuild indexes
        await collection.reIndex()
        console.log(`Rebuilt indexes for ${collectionName}`)
        
        // Get index statistics
        const stats = await collection.indexStats()
        console.log(`Index stats for ${collectionName}:`, stats)
        
      } catch (error) {
        console.error(`Error optimizing ${collectionName}:`, error)
      }
    }
  }
  
  async cleanupOldData() {
    console.log('Starting data cleanup...')
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    try {
      // Remove old completed game rounds
      const result = await this.db.collection('gamerounds').deleteMany({
        status: 'completed',
        endTime: { $lt: thirtyDaysAgo }
      })
      console.log(`Removed ${result.deletedCount} old game rounds`)
      
      // Archive old transactions
      const transactions = await this.db.collection('transactions').find({
        timestamp: { $lt: thirtyDaysAgo }
      }).toArray()
      
      if (transactions.length > 0) {
        await this.db.collection('transactions_archive').insertMany(transactions)
        await this.db.collection('transactions').deleteMany({
          timestamp: { $lt: thirtyDaysAgo }
        })
        console.log(`Archived ${transactions.length} old transactions`)
      }
      
    } catch (error) {
      console.error('Error during data cleanup:', error)
    }
  }
  
  async generateReport() {
    console.log('Generating database report...')
    
    const report = {
      timestamp: new Date().toISOString(),
      collections: {}
    }
    
    const collections = await this.db.listCollections().toArray()
    
    for (const collection of collections) {
      const stats = await this.db.collection(collection.name).stats()
      report.collections[collection.name] = {
        documents: stats.count,
        size: stats.size,
        avgObjSize: stats.avgObjSize,
        indexes: stats.nindexes,
        indexSize: stats.totalIndexSize
      }
    }
    
    console.log('Database Report:', JSON.stringify(report, null, 2))
    return report
  }
}

module.exports = DatabaseMaintenance
```

**Automated Maintenance Scheduling:**
```bash
#!/bin/bash
# scripts/maintenance.sh - Automated maintenance script

# Database optimization (weekly)
0 2 * * 0 /usr/bin/node /opt/crypto-crash-backend/scripts/maintenance.js optimize

# Data cleanup (daily)
0 3 * * * /usr/bin/node /opt/crypto-crash-backend/scripts/maintenance.js cleanup

# Generate reports (daily)
0 4 * * * /usr/bin/node /opt/crypto-crash-backend/scripts/maintenance.js report
```

## Troubleshooting

This section provides comprehensive troubleshooting guidance for common issues that may arise during deployment and operation of the Crypto Crash application. The troubleshooting procedures are organized by component and include diagnostic steps, common solutions, and preventive measures.

### Common Deployment Issues

**Issue: MongoDB Connection Failures**
MongoDB connection issues are among the most common problems during initial deployment. These issues typically manifest as connection timeouts, authentication failures, or network connectivity problems.

*Symptoms:*
- Application fails to start with "MongoDB connection error"
- Intermittent database connection drops
- Authentication failed errors in logs

*Diagnostic Steps:*
```bash
# Test MongoDB connectivity
mongosh "mongodb://localhost:27017/crypto-crash"

# Check MongoDB service status
sudo systemctl status mongod

# Verify network connectivity
telnet localhost 27017

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

*Solutions:*
1. Verify MongoDB service is running and accessible
2. Check firewall rules and network connectivity
3. Validate connection string format and credentials
4. Ensure MongoDB version compatibility
5. Review MongoDB configuration for binding and authentication settings

**Issue: WebSocket Connection Problems**
WebSocket connectivity issues can prevent real-time game updates and significantly impact user experience.

*Symptoms:*
- Frontend shows "Disconnected" status
- No real-time multiplier updates
- Players cannot receive game events

*Diagnostic Steps:*
```bash
# Test WebSocket connectivity
wscat -c ws://localhost:3000

# Check for proxy interference
curl -H "Upgrade: websocket" -H "Connection: Upgrade" http://localhost:3000

# Monitor WebSocket connections
netstat -an | grep :3000
```

*Solutions:*
1. Verify WebSocket server is properly initialized
2. Check for proxy or load balancer WebSocket support
3. Ensure proper CORS configuration for WebSocket connections
4. Review firewall rules for WebSocket traffic
5. Implement WebSocket connection retry logic in frontend

**Issue: Frontend Build and Deployment Failures**
Frontend build failures can prevent successful deployment and may be caused by dependency issues, configuration problems, or resource constraints.

*Symptoms:*
- Build process fails with dependency errors
- Static assets not loading correctly
- Routing issues in production

*Diagnostic Steps:*
```bash
# Clear dependency cache
rm -rf node_modules package-lock.json
npm install

# Run build with verbose output
npm run build -- --verbose

# Check build output
ls -la dist/

# Test production build locally
npm run preview
```

*Solutions:*
1. Clear dependency cache and reinstall packages
2. Verify Node.js and npm versions meet requirements
3. Check for conflicting global packages
4. Ensure sufficient disk space and memory for build process
5. Review build configuration for environment-specific settings

### Performance Issues

**Issue: High Memory Usage**
Memory leaks or excessive memory consumption can lead to application instability and poor performance.

*Diagnostic Steps:*
```bash
# Monitor memory usage
pm2 monit

# Generate heap dump
node --inspect src/server.js
# Connect Chrome DevTools and capture heap snapshot

# Check for memory leaks
node --trace-gc src/server.js
```

*Solutions:*
1. Implement proper cleanup for WebSocket connections
2. Review database connection pooling configuration
3. Optimize data structures and caching strategies
4. Implement garbage collection tuning
5. Set appropriate memory limits for PM2 processes

**Issue: Database Performance Degradation**
Slow database queries can significantly impact application responsiveness and user experience.

*Diagnostic Steps:*
```javascript
// Enable MongoDB profiling
db.setProfilingLevel(2, { slowms: 100 })

// Analyze slow queries
db.system.profile.find().sort({ ts: -1 }).limit(5)

// Check index usage
db.collection.explain("executionStats").find(query)
```

*Solutions:*
1. Create appropriate indexes for frequently queried fields
2. Optimize query patterns and aggregation pipelines
3. Implement query result caching
4. Review database schema design
5. Consider database sharding for large datasets

### Security Issues

**Issue: Rate Limiting Bypass**
Attackers may attempt to bypass rate limiting mechanisms to abuse API endpoints or disrupt service.

*Diagnostic Steps:*
```bash
# Monitor request patterns
tail -f /var/log/nginx/access.log | grep -E "POST|PUT|DELETE"

# Check rate limiting effectiveness
grep "rate limit" /var/log/crypto-crash/combined.log

# Analyze IP address patterns
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr
```

*Solutions:*
1. Implement multiple layers of rate limiting
2. Use distributed rate limiting for clustered deployments
3. Implement CAPTCHA for suspicious activity
4. Configure IP-based blocking for repeat offenders
5. Monitor and alert on unusual traffic patterns

**Issue: WebSocket Security Vulnerabilities**
WebSocket connections may be vulnerable to various attacks including cross-site WebSocket hijacking and denial of service attacks.

*Diagnostic Steps:*
```javascript
// Monitor WebSocket connection origins
ws.on('connection', (socket, request) => {
  console.log('WebSocket connection from:', request.headers.origin)
  console.log('User-Agent:', request.headers['user-agent'])
})

// Check for suspicious connection patterns
grep "WebSocket" /var/log/crypto-crash/combined.log | grep -v "normal_pattern"
```

*Solutions:*
1. Implement origin validation for WebSocket connections
2. Use authentication tokens for WebSocket connections
3. Implement connection rate limiting per IP address
4. Monitor for unusual connection patterns
5. Implement proper error handling to prevent information disclosure

## Security Considerations

Security is paramount for any application handling financial transactions and user data. The Crypto Crash application implements multiple layers of security controls to protect against common threats and ensure user data privacy and system integrity.

### Authentication and Authorization

While the current implementation uses simple player IDs for demonstration purposes, production deployments should implement robust authentication and authorization mechanisms.

**Recommended Authentication Implementation:**
```javascript
// auth/authentication.js - JWT-based authentication
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

class AuthenticationService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET
    this.jwtExpiry = process.env.JWT_EXPIRY || '24h'
  }
  
  async hashPassword(password) {
    return await bcrypt.hash(password, 12)
  }
  
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash)
  }
  
  generateToken(payload) {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiry,
      issuer: 'crypto-crash-app',
      audience: 'crypto-crash-users'
    })
  }
  
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret)
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }
  
  middleware() {
    return (req, res, next) => {
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' })
      }
      
      const token = authHeader.substring(7)
      
      try {
        const decoded = this.verifyToken(token)
        req.user = decoded
        next()
      } catch (error) {
        return res.status(401).json({ error: 'Invalid authentication token' })
      }
    }
  }
}

module.exports = AuthenticationService
```

### Data Protection and Privacy

Implement comprehensive data protection measures to ensure user privacy and comply with relevant regulations.

**Data Encryption Implementation:**
```javascript
// security/encryption.js - Data encryption utilities
const crypto = require('crypto')

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm'
    this.keyLength = 32
    this.ivLength = 16
    this.tagLength = 16
    this.key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  }
  
  encrypt(text) {
    const iv = crypto.randomBytes(this.ivLength)
    const cipher = crypto.createCipher(this.algorithm, this.key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    }
  }
  
  decrypt(encryptedData) {
    const { encrypted, iv, tag } = encryptedData
    
    const decipher = crypto.createDecipher(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    )
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'))
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
  
  hashSensitiveData(data) {
    return crypto.createHash('sha256').update(data).digest('hex')
  }
}

module.exports = EncryptionService
```

### Input Validation and Sanitization

Comprehensive input validation prevents injection attacks and ensures data integrity throughout the application.

**Enhanced Validation Framework:**
```javascript
// security/validation.js - Comprehensive input validation
const validator = require('validator')
const xss = require('xss')

class ValidationService {
  static sanitizeString(input, maxLength = 255) {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string')
    }
    
    // Remove XSS attempts
    const sanitized = xss(input, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    })
    
    // Trim and limit length
    return validator.escape(sanitized.trim().substring(0, maxLength))
  }
  
  static validatePlayerId(playerId) {
    if (!playerId || typeof playerId !== 'string') {
      throw new Error('Player ID is required')
    }
    
    if (!validator.matches(playerId, /^[a-zA-Z0-9_-]{3,50}$/)) {
      throw new Error('Invalid player ID format')
    }
    
    return this.sanitizeString(playerId, 50)
  }
  
  static validateBetAmount(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Bet amount must be a valid number')
    }
    
    if (amount < 0.01 || amount > 10000) {
      throw new Error('Bet amount must be between $0.01 and $10,000')
    }
    
    return Math.round(amount * 100) / 100 // Round to 2 decimal places
  }
  
  static validateCryptocurrency(crypto) {
    const allowedCryptos = ['bitcoin', 'ethereum']
    
    if (!crypto || typeof crypto !== 'string') {
      throw new Error('Cryptocurrency is required')
    }
    
    const sanitized = this.sanitizeString(crypto.toLowerCase())
    
    if (!allowedCryptos.includes(sanitized)) {
      throw new Error('Unsupported cryptocurrency')
    }
    
    return sanitized
  }
}

module.exports = ValidationService
```

### Security Headers and HTTPS

Implement comprehensive security headers and enforce HTTPS for all communications.

**Security Headers Configuration:**
```javascript
// security/headers.js - Security headers middleware
const helmet = require('helmet')

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https://api.coingecko.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
})

module.exports = securityHeaders
```

This comprehensive deployment guide provides all the necessary information for successfully deploying and maintaining the Crypto Crash application in production environments. Regular review and updates of security measures, monitoring configurations, and performance optimizations ensure continued reliability and security of the gaming platform.

