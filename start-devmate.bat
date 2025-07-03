@echo off
echo Starting DevMate Development Environment...
echo.

echo Starting MongoDB (make sure MongoDB is installed and mongod is in PATH)...
start "MongoDB" mongod --dbpath "data\db"
timeout /t 3 /nobreak > nul

echo Starting Backend Server...
start "DevMate Server" cmd /k "cd server && npm run dev"
timeout /t 5 /nobreak > nul

echo Starting Frontend Client...
start "DevMate Client" cmd /k "cd client && npm start"

echo.
echo DevMate is starting up!
echo - Server: http://localhost:5000
echo - Client: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
