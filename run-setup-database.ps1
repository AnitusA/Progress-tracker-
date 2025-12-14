# PowerShell script to load environment variables from .env and run database setup
# Usage: .\run-setup-database.ps1

Write-Host "Loading environment variables from .env file..." -ForegroundColor Green

# Read .env file and set environment variables
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "Set $key" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nRunning database setup..." -ForegroundColor Green
    node scripts/setup-database.js
} else {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please make sure you have a .env file with your Supabase credentials." -ForegroundColor Yellow
}