# Firebase Storage CORS Setup Script
# This script helps configure CORS for Firebase Storage

Write-Host "=== Firebase Storage CORS Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if gsutil is installed
$gsutilExists = Get-Command gsutil -ErrorAction SilentlyContinue
if (-not $gsutilExists) {
    Write-Host "❌ gsutil is not installed." -ForegroundColor Red
    Write-Host "Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ gsutil found" -ForegroundColor Green

# Get Firebase project bucket name
Write-Host ""
Write-Host "Getting Firebase project bucket..." -ForegroundColor Cyan
$firebaseConfig = Get-Content "firebase.json" | ConvertFrom-Json
$bucketName = Read-Host "Enter your Firebase Storage bucket name (usually: YOUR_PROJECT_ID.appspot.com)"

if ([string]::IsNullOrWhiteSpace($bucketName)) {
    Write-Host "❌ Bucket name is required" -ForegroundColor Red
    exit 1
}

# Set CORS configuration
Write-Host ""
Write-Host "Setting CORS configuration..." -ForegroundColor Cyan
$corsFile = "cors.json\cors.json"

if (Test-Path $corsFile) {
    Write-Host "Using CORS config: $corsFile" -ForegroundColor Green
    
    try {
        gsutil cors set $corsFile "gs://$bucketName"
        Write-Host "✅ CORS configuration applied successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Verifying CORS configuration..." -ForegroundColor Cyan
        gsutil cors get "gs://$bucketName"
    } catch {
        Write-Host "❌ Failed to set CORS: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ CORS file not found at: $corsFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host "PDF previews should now work properly!" -ForegroundColor Cyan
