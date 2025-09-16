# DUXE Student Platform - Database Initialization Script
# This script initializes Firestore with all required collections and sample data

param(
    [switch]$Force,
    [switch]$Verbose
)

Write-Host "DUXE Firestore Database Initialization" -ForegroundColor Cyan
Write-Host "================================================"

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please ensure your Firebase configuration is set up in .env.local" -ForegroundColor Yellow
    Write-Host "Required variables:" -ForegroundColor Yellow
    Write-Host "  - VITE_FIREBASE_API_KEY" -ForegroundColor White
    Write-Host "  - VITE_FIREBASE_AUTH_DOMAIN" -ForegroundColor White
    Write-Host "  - VITE_FIREBASE_PROJECT_ID" -ForegroundColor White
    Write-Host "  - VITE_FIREBASE_STORAGE_BUCKET" -ForegroundColor White
    Write-Host "  - VITE_FIREBASE_MESSAGING_SENDER_ID" -ForegroundColor White
    Write-Host "  - VITE_FIREBASE_APP_ID" -ForegroundColor White
    exit 1
}

# Load environment variables to check Firebase config
$envContent = Get-Content ".env.local"
$projectId = ($envContent | Where-Object { $_ -match "^VITE_FIREBASE_PROJECT_ID=" }) -replace "VITE_FIREBASE_PROJECT_ID=", ""

if (-not $projectId) {
    Write-Host "❌ ERROR: VITE_FIREBASE_PROJECT_ID not found in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Configuration Check:" -ForegroundColor Green
Write-Host "  Project ID: $projectId" -ForegroundColor White
Write-Host "  Environment file: .env.local ✅" -ForegroundColor White

# Check if Firebase CLI is available
if (Get-Command "firebase" -ErrorAction SilentlyContinue) {
    Write-Host "  Firebase CLI: Available ✅" -ForegroundColor White
} else {
    Write-Host "  Firebase CLI: Not found ⚠️" -ForegroundColor Yellow
    Write-Host "  Install with: npm install -g firebase-tools" -ForegroundColor Yellow
}

# Warning about data overwrite
if (-not $Force) {
Write-Host "`nWARNING:" -ForegroundColor Yellow
    Write-Host "This script will create/overwrite data in your Firestore database." -ForegroundColor Yellow
    Write-Host "Collections that will be initialized:" -ForegroundColor White
    Write-Host "  * universities - 5 documents" -ForegroundColor White
    Write-Host "  * departments - 16 documents" -ForegroundColor White  
    Write-Host "  * notes - 5 documents" -ForegroundColor White
    Write-Host "  * internships - 5 documents" -ForegroundColor White
    Write-Host "  * videos - 5 documents" -ForegroundColor White
    Write-Host "  * users - 5 documents" -ForegroundColor White
    Write-Host "  * aiJobs - 3 documents" -ForegroundColor White
    Write-Host "  * analytics - 4 documents" -ForegroundColor White
    
    $confirmation = Read-Host "`nDo you want to continue? (y/N)"
    if ($confirmation -ne "y" -and $confirmation -ne "Y") {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "`nStarting database initialization..." -ForegroundColor Green

# Check if scripts directory exists
if (-not (Test-Path "scripts")) {
    Write-Host "❌ ERROR: scripts directory not found!" -ForegroundColor Red
    Write-Host "Please ensure you're running this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Check if the initialization script exists
if (-not (Test-Path "scripts/run-init.js")) {
    Write-Host "❌ ERROR: scripts/run-init.js not found!" -ForegroundColor Red
    exit 1
}

try {
    # Run the database initialization
    if ($Verbose) {
        Write-Host "Running: npm run db:init" -ForegroundColor Gray
    }
    
    npm run db:init
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nDatabase initialization completed successfully!" -ForegroundColor Green
        
        Write-Host "`nNext Steps:" -ForegroundColor Cyan
        Write-Host "1. Check your Firestore Console:" -ForegroundColor White
        Write-Host "   https://console.firebase.google.com/project/$projectId/firestore" -ForegroundColor Blue
        
        Write-Host "`n2. Deploy Firestore security rules (recommended):" -ForegroundColor White
        Write-Host "   firebase deploy --only firestore:rules" -ForegroundColor Gray
        
        Write-Host "`n3. Test your application:" -ForegroundColor White
        Write-Host "   npm run dev" -ForegroundColor Gray
        
        Write-Host "`nSample Data Created:" -ForegroundColor Cyan
        Write-Host "* Universities: MIT, Stanford, Harvard, UC Berkeley, Oxford" -ForegroundColor White
        Write-Host "* Sample notes with different approval statuses" -ForegroundColor White
        Write-Host "* Internships from major tech companies" -ForegroundColor White
        Write-Host "* Educational videos and learning resources" -ForegroundColor White
        Write-Host "* Sample users with student and admin roles" -ForegroundColor White
        Write-Host "* AI job examples for testing AI features" -ForegroundColor White
        
        Write-Host "`nAdmin Login (for testing):" -ForegroundColor Yellow
        Write-Host "Email: admin@duxe.com" -ForegroundColor White
        Write-Host "Note: You'll need to create this user in Firebase Auth manually" -ForegroundColor Gray
        
    } else {
        Write-Host "`n❌ Database initialization failed!" -ForegroundColor Red
        Write-Host "Check the error messages above for details." -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host "`n❌ ERROR: Failed to run database initialization" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`nDatabase setup complete!" -ForegroundColor Green
