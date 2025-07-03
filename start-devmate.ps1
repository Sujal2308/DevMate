# DevMate Startup Script
Write-Host "Starting DevMate Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
    if (-not $mongoProcess) {
        Write-Host "Starting MongoDB..." -ForegroundColor Green
        Start-Process -FilePath "mongod" -ArgumentList "--dbpath", "data\db" -WindowStyle Minimized
        Start-Sleep -Seconds 3
    } else {
        Write-Host "MongoDB is already running." -ForegroundColor Green
    }
} catch {
    Write-Host "Warning: Could not start MongoDB. Make sure MongoDB is installed." -ForegroundColor Red
    Write-Host "You can install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
}

Write-Host ""

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd server; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Frontend Client  
Write-Host "Starting Frontend Client..." -ForegroundColor Green
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd client; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "DevMate is starting up!" -ForegroundColor Cyan
Write-Host "- Server: http://localhost:5000" -ForegroundColor White
Write-Host "- Client: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
