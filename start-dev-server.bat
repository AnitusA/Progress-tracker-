@echo off
echo Starting Progress Tracker Development Server...
echo.

cd /d "%~dp0"

echo Loading environment variables from .env...
for /f "delims=" %%x in (.env) do (set "%%x")

echo.
echo Starting Next.js development server...
npx next@14 dev --hostname 0.0.0.0 --port 3000

pause