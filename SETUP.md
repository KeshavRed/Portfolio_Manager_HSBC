# Financial Portfolio Management - Setup Guide

## Problem Fixed
Fixed "Field 'id' doesn't have a default value" error when adding new assets by enabling AUTO_INCREMENT on database tables.

## Setup Instructions for New Device

### 1. Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- Git

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd Financial_Portfolio_Management
```

### 3. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE portfolio2;
exit
```

### 5. Environment Configuration
Create `server/.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=portfolio2
PORT=3000
```

### 6. Fix Database Schema (CRITICAL STEP)
```bash
cd server
npm run setup-db
```

This script fixes the AUTO_INCREMENT issue by:
- Temporarily disabling foreign key checks
- Adding AUTO_INCREMENT to id columns in stocks, mutual_funds, and transactions tables
- Re-enabling foreign key checks

### 7. Run Application
```bash
# Terminal 1 - Start server
cd server
npm start

# Terminal 2 - Start client
cd client
npm run dev
```

## Files Created/Modified

### New Files:
- `server/fix-database.js` - Database schema fix script
- `SETUP.md` - This setup guide

### Purpose:
The fix-database.js script resolves the "Field 'id' doesn't have a default value" MySQL error that occurs when inserting new records without explicitly providing an id value.