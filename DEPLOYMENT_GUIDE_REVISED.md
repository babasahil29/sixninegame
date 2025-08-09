# Crypto Crash - Revised Deployment Guide

**Author:** Manus AI  
**Version:** 1.0  
**Date:** August 8, 2025

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Frontend Deployment to Netlify](#frontend-deployment-to-netlify)
3. [Backend Deployment to Render](#backend-deployment-to-render)
4. [MongoDB Atlas Database Setup](#mongodb-atlas-database-setup)

## Local Development Setup

This section outlines the steps to set up and run the Crypto Crash application on your local machine. This is crucial for development, testing, and understanding the application's functionality before deploying to cloud services.

### Prerequisites

Before you begin, ensure you have the following software installed on your system:

- **Node.js (v16 or higher)**: The JavaScript runtime for both frontend and backend.
- **npm or pnpm**: Package managers for Node.js. pnpm is recommended for faster and more efficient dependency management.
- **MongoDB (v4.4 or higher)**: The database used by the backend. You can install it locally or use a Docker container.
- **Git**: For version control, though not strictly necessary if you have the project zip.

### Project Structure

After extracting the provided `crypto-crash-complete.zip` file, you will find the following directory structure:

```
crypto-crash-project/
├── crypto-crash-backend/          # Contains the Node.js backend application
├── crypto-crash-frontend/         # Contains the React.js frontend application
├── DEPLOYMENT_GUIDE_REVISED.md    # This document
└── README.md                      # General project overview and quick start
```

### Step 1: Extract the Project

First, extract the `crypto-crash-complete.zip` archive to a location of your choice. You can do this using your operating system's built-in tools or a command-line utility:

```bash
unzip crypto-crash-complete.zip -d /path/to/your/project
cd /path/to/your/project/crypto-crash-project
```

Replace `/path/to/your/project` with the actual path where you want to extract the files.

### Step 2: Backend Setup and Local Execution

The backend is a Node.js application that handles game logic, API requests, and WebSocket communication. Follow these steps to get it running locally:

1.  **Navigate to the backend directory**:
    ```bash
    cd crypto-crash-backend
    ```

2.  **Install Node.js dependencies**: The backend uses `npm` for package management. Run the following command to install all required packages:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**: The backend uses environment variables for configuration. A sample file `.env.example` is provided. Copy it to `.env`:
    ```bash
    cp .env.example .env
    ```
    Now, open the newly created `.env` file in a text editor (e.g., `nano .env` or `code .env`) and ensure the `MONGODB_URI` is set to `mongodb://localhost:27017/crypto-crash` for local MongoDB. For MongoDB Atlas, you will update this later in the 

