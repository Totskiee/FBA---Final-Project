@echo off
title TitanMotor Freight & Logistics Analytics System
cd /d "%~dp0"

echo =======================================================
echo  Starting TitanMotor Logistics Analytics Platform
echo =======================================================

:: Add Node.js to PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

:: Ensure database exists
if not exist "data\titanmotor_logistics.db" (
  echo Seeding database...
  node models\seeder.js
)

:: Launch the default browser to http://localhost:3000
echo Opening browser to http://localhost:3000 ...
start "" http://localhost:3000

:: Start the Express server
echo Server listening on port 3000. Keep this window open.
echo Press Ctrl+C to stop.
echo =======================================================
node server.js

pause
