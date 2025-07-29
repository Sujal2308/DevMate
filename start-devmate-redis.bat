@echo off
echo 🚀 Starting DevMate with Redis...

REM Check if Redis is installed
redis-server --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Redis is not installed!
    echo 📦 Please install Redis for Windows:
    echo    1. Download from: https://github.com/microsoftarchive/redis/releases
    echo    2. Or use Chocolatey: choco install redis-64
    echo    3. Or use Docker: docker run -d -p 6379:6379 redis:alpine
    pause
    exit /b 1
)

echo ✅ Redis found, starting Redis server...
start "Redis Server" redis-server

REM Wait a moment for Redis to start
timeout /t 2 >nul

echo 🔥 Starting DevMate server...
start "DevMate Server" cmd /k "cd /d server && npm run dev"

echo 🌐 Starting DevMate client...
start "DevMate Client" cmd /k "cd /d client && npm start"

echo 🎉 DevMate is starting with Redis caching!
echo 📊 Check the server console for Redis connection status
pause
