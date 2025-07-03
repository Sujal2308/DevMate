# MongoDB Setup Guide for DevMate

## ❗ Important: MongoDB Required

**DevMate requires MongoDB to function properly.** Without MongoDB, you cannot:

- Register new accounts
- Login to existing accounts
- Create posts
- Store any user data

## 🚀 Quick MongoDB Setup

### Option 1: Local MongoDB Installation

#### Windows:

1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. Open Command Prompt and run:
   ```cmd
   mongod
   ```
4. Keep this terminal open while using DevMate

#### Mac:

1. Install using Homebrew:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```
2. Start MongoDB:
   ```bash
   brew services start mongodb-community
   ```

#### Linux (Ubuntu/Debian):

1. Install MongoDB:
   ```bash
   sudo apt update
   sudo apt install mongodb
   ```
2. Start MongoDB:
   ```bash
   sudo systemctl start mongodb
   ```

### Option 2: MongoDB Atlas (Cloud) - Recommended for Production

1. Create free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Get connection string
4. Update `.env` file in server folder:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/devmate
   ```

## 🔧 Verification

### Check if MongoDB is Running:

1. Open browser and go to: `http://localhost:5000/api/db-status`
2. Should see: `{"connected": true, "status": "Connected to MongoDB"}`

### If MongoDB is NOT running:

- You'll see red warning in the registration/login pages
- API will return: `{"connected": false}`

## 🐛 Troubleshooting

### Common Issues:

**"Database not connected" error:**

- Start MongoDB service: `mongod`
- Check if port 27017 is available
- Verify MONGO_URI in `.env` file

**MongoDB command not found:**

- Add MongoDB to system PATH
- Restart terminal/command prompt
- Reinstall MongoDB

**Connection refused:**

- Check MongoDB is running: `ps aux | grep mongod`
- Check MongoDB logs for errors
- Ensure correct connection string

### Default Configuration:

```env
# Server .env file
PORT=5000
MONGO_URI=mongodb://localhost:27017/devmate
JWT_SECRET=your_jwt_secret_here_change_in_production
NODE_ENV=development
```

## 📱 DevMate Features

Once MongoDB is running, you can use all DevMate features:

### ✅ User Authentication

- Register with username, email, password
- Secure JWT login system
- Protected routes

### ✅ Social Features

- Create posts with code snippets
- Like and comment on posts
- User profiles and bios
- Skills and GitHub integration

### ✅ Discovery

- Explore other developers
- Search by skills or name
- View user profiles and posts

## 🔄 Starting DevMate

### Method 1: Use startup scripts

```bash
# Windows
start-devmate.bat

# PowerShell
.\start-devmate.ps1
```

### Method 2: Manual start

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start backend
cd server
npm run dev

# Terminal 3: Start frontend
cd client
npm start
```

### Method 3: Use npm scripts

```bash
# Start both together (requires MongoDB running)
npm run dev
```

## 🆘 Need Help?

1. **Database Issues**: Check MongoDB service is running
2. **Port Issues**: Ensure ports 3000 and 5000 are available
3. **Dependencies**: Run `npm install` in server and client folders
4. **Environment**: Verify `.env` file exists with correct MongoDB URI

## 📞 Quick Support

If MongoDB setup is challenging:

1. Try MongoDB Atlas (cloud option) - no local installation needed
2. Check MongoDB official documentation
3. Use local MongoDB with default settings (localhost:27017)

---

**Remember: Start MongoDB BEFORE starting DevMate!** 🚀
