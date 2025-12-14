Write-Host "🚀 Setting up Progress Tracker..." -ForegroundColor Green

# Change to project directory
Set-Location $PSScriptRoot

# Load environment variables from .env file
Write-Host "📋 Loading environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Get-Content .env | Where-Object { $_ -notmatch '^#' -and $_ -match '=' } | ForEach-Object {
        $parts = $_ -split '=', 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "✓ Set $key" -ForegroundColor Green
        }
    }
} else {
    Write-Host "⚠️  .env file not found. Please create one based on .env.example" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing minimal dependencies..." -ForegroundColor Yellow

# Try to install only essential packages to avoid disk space issues
try {
    npm install @supabase/supabase-js uuid --no-save --no-package-lock
    Write-Host "✓ Essential dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not install dependencies, trying to use existing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow

# Try to run database setup
try {
    node scripts/setup-database.js
    Write-Host "✓ Database setup completed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Database setup failed. You may need to run the SQL manually in Supabase." -ForegroundColor Yellow
    Write-Host "Check the SECURITY.md file for instructions." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🌐 Starting development server..." -ForegroundColor Yellow
Write-Host "   Local:    http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Network:  http://0.0.0.0:3000" -ForegroundColor Cyan
Write-Host ""

# Start the development server
npx next dev --port 3000