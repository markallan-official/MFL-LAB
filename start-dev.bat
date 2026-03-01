@echo off
REM Start Backend Server on Port 3000

cd backend
echo.
echo Starting Backend Server on Port 3000...
echo.

start "SaaS Backend - Port 3000" cmd /k "npm run dev"

timeout /t 3

cd ..

echo.
echo Backend started in new window
echo.
echo Now starting Frontend Server on Port 5173...
echo.

cd frontend

start "SaaS Frontend - Port 5173" cmd /k "npm run dev"

cd ..

echo.
echo Frontend started in new window
echo.
echo ================================
echo Your SaaS Platform is Running!
echo ================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo Health:   http://localhost:3000/health
echo.
echo Press any key to close this window...
pause
