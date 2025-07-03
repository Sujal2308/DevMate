# DevMate Setup Guide

## Quick Start

### Prerequisites

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
3. **Git** (optional) - [Download here](https://git-scm.com/)

### Installation Steps

1. **Install Dependencies**

   ```bash
   npm run install-all
   ```

   Or install manually:

   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

2. **Setup Environment Variables**

   Create a `.env` file in the `server` directory with:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/devmate
   JWT_SECRET=your_jwt_secret_here_change_in_production
   NODE_ENV=development
   ```

3. **Start MongoDB**

   Make sure MongoDB is running on your system:

   ```bash
   mongod
   ```

4. **Run the Application**

   Choose one of these methods:

   **Option A: Use the startup script (Windows)**

   ```bash
   # Batch file
   start-devmate.bat

   # Or PowerShell script
   .\start-devmate.ps1
   ```

   **Option B: Use npm scripts**

   ```bash
   # Run both server and client together
   npm run dev

   # Or run them separately
   npm run server    # Terminal 1
   npm run client    # Terminal 2
   ```

   **Option C: Manual start**

   ```bash
   # Terminal 1 - Start server
   cd server
   npm run dev

   # Terminal 2 - Start client
   cd client
   npm start
   ```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

### First Time Setup

1. Open http://localhost:3000 in your browser
2. Click "Sign Up" to create a new account
3. Fill in your username, email, and password
4. Complete your profile with bio, skills, and GitHub link
5. Start creating posts and exploring the community!

### Troubleshooting

**MongoDB Connection Issues:**

- Make sure MongoDB is installed and running
- Check that the MONGO_URI in .env is correct
- Default MongoDB runs on port 27017

**Port Already in Use:**

- Frontend (3000): Change port in client/package.json
- Backend (5000): Change PORT in server/.env

**Dependencies Issues:**

- Delete node_modules folders and package-lock.json files
- Run `npm run install-all` again

**Build Issues:**

- Make sure all dependencies are installed
- Check for any console errors
- Restart both server and client

### VS Code Integration

If using VS Code, you can use the predefined tasks:

1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type "Tasks: Run Task"
3. Select "Start DevMate Full Stack"

This will start both server and client automatically.

### Project Structure

```
DevMate/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── ...
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   └── package.json
├── .vscode/             # VS Code configuration
├── README.md            # Main documentation
├── SETUP.md            # This file
└── package.json        # Root package.json
```

### Next Steps

After setup, you can:

- Create your first post
- Explore other users
- Customize your profile
- Start building the community!

Need help? Check the main README.md for detailed documentation.
