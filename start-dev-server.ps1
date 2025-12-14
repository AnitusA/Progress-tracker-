Write-Host "Starting Progress Tracker Development Server..." -ForegroundColor Green

# Load environment variables from .env file
if (Test-Path ".env") {
    Write-Host "Loading environment variables..." -ForegroundColor Yellow
    Get-Content .env | Where-Object { $_ -notmatch '^#' -and $_ -match '=' } | ForEach-Object {
        $parts = $_ -split '=', 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "Set $key" -ForegroundColor Green
        }
    }
}

Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
npx next dev --port 3000