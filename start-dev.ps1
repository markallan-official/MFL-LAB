# SaaS Platform Development Server Starter
# This script starts both the frontend and backend servers

Clear-Host
Write-Host "" 
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   SaaS Collaborative Platform - Development Server Launcher    " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if npm is available
try {
    $version = npm --version
    Write-Host "[OK] npm version: $version" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] npm not found! Please install Node.js" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting development servers..." -ForegroundColor Yellow
Write-Host ""

# Start Backend
Write-Host "1) Starting Backend (Express.js) on Port 4000..." -ForegroundColor Yellow
Write-Host "   Command: npm run dev --workspace=@saas/backend" -ForegroundColor Gray
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev --workspace=@saas/backend" -WindowStyle Normal -PassThru

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "2) Starting Frontend (React/Vite) on Port 4002..." -ForegroundColor Yellow
Write-Host "   Command: npm run dev --workspace=@saas/frontend" -ForegroundColor Gray
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev --workspace=@saas/frontend" -WindowStyle Normal -PassThru

Start-Sleep -Seconds 2

# Display URLs
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "                 SERVERS ARE RUNNING!                           " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Your Application is Available At:" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend Application:  http://localhost:4002" -ForegroundColor Cyan
Write-Host "  API Server:            http://localhost:4000" -ForegroundColor Cyan  
Write-Host "  Health Check:          http://localhost:4000/health" -ForegroundColor Cyan
Write-Host "  Supabase Dashboard:    https://app.supabase.com" -ForegroundColor Cyan
Write-Host ""

Write-Host "Helpful Information:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  * Edit code and it will automatically reload (Hot Reload)"
Write-Host "  * Frontend changes appear instantly in your browser"
Write-Host "  * Backend restarts automatically on file save"
Write-Host "  * Check the browser console (F12) for any errors"
Write-Host "  * Full documentation available in SETUP_GUIDE.md"
Write-Host ""

Write-Host "To Stop the Servers:" -ForegroundColor Yellow
Write-Host "  * Close each terminal window, or"
Write-Host "  * Press Ctrl+C in each terminal"
Write-Host ""

Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

# Keep this window open
Write-Host "Happy coding! This window will stay open to show status." -ForegroundColor Cyan
Write-Host ""

# Wait for processes to complete
$backendProcess | Wait-Process
$frontendProcess | Wait-Process
