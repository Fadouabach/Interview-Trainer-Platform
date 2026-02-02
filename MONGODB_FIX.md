# MongoDB Atlas IP Whitelist Issue - Quick Fix Guide

## Problem
Your login/signup is failing because:
```
❌ MongoDB connection error: Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Solution Options:

### Option 1: Whitelist Your IP in MongoDB Atlas (Recommended)
1. Go to https://cloud.mongodb.com/
2. Log in with your MongoDB Atlas account
3. Select your cluster (`cluster0`)
4. Click "Network Access" in the left sidebar
5. Click "Add IP Address"
6. Click "Add Current IP Address"
7. Click "Confirm"
8. Wait 1-2 minutes for the change to propagate
9. Restart your server

### Option 2: Allow All IPs (For Development Only - NOT SECURE for production)
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Enter `0.0.0.0/0` to allow all IPs
4. Click "Confirm"
5. Restart your server

### Option 3: Use Local MongoDB (Alternative)
If you don't want to use MongoDB Atlas, install MongoDB locally:

```bash
# Install MongoDB Community Edition
# Visit: https://www.mongodb.com/try/download/community

# Then update your .env file:
MONGO_URI=mongodb://localhost:27017/interview-trainer
```

## After Fixing:
1. Restart your server: `npm run dev` (in the server folder)
2. You should see: `✅ MongoDB database connection established successfully`
3. Try logging in/signing up again

## Current Server Status:
- ✅ Server is running on port 5001
- ❌ MongoDB connection failed (IP not whitelisted)
- ⚠️  Login/Signup will NOT work until MongoDB is connected
