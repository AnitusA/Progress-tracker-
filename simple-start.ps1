Write-Host "Starting Progress Tracker..." -ForegroundColor Green

# Load environment variables
if (Test-Path ".env") {
    Write-Host "Loading environment..." -ForegroundColor Yellow
    $envContent = Get-Content .env
    foreach ($line in $envContent) {
        if ($line -match "^([^#=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "Set $key" -ForegroundColor Green
        }
    }
}

Write-Host "Starting server on http://localhost:3000..." -ForegroundColor Yellow
npx next@14 dev --port 3000