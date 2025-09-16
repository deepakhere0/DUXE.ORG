# DUXE Student Platform - Deployment Script
# PowerShell script for automated deployment preparation

param(
    [string]$Environment = "production",
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [string]$Platform = "vercel"
)

Write-Host "DUXE Student Platform Deployment Script" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Platform: $Platform" -ForegroundColor Yellow
Write-Host "================================================"

# Check if required tools are installed
function Test-Command($command) {
    try {
        if (Get-Command $command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

Write-Host "Checking prerequisites..." -ForegroundColor Green

# Check Node.js
if (-not (Test-Command "node")) {
    Write-Host "ERROR: Node.js is not installed" -ForegroundColor Red
    exit 1
}
$nodeVersion = node --version
Write-Host "SUCCESS: Node.js version: $nodeVersion" -ForegroundColor Green

# Check npm
if (-not (Test-Command "npm")) {
    Write-Host "ERROR: npm is not installed" -ForegroundColor Red
    exit 1
}
$npmVersion = npm --version
Write-Host "SUCCESS: npm version: $npmVersion" -ForegroundColor Green

# Check for environment file
if (-not (Test-Path ".env.local")) {
    Write-Host "WARNING: .env.local file not found. Make sure to set up environment variables." -ForegroundColor Yellow
} else {
    Write-Host "SUCCESS: .env.local file found" -ForegroundColor Green
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Green
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "SUCCESS: Dependencies installed" -ForegroundColor Green

# Run linting (unless skipped)
if (-not $SkipTests) {
    Write-Host "`nRunning linter..." -ForegroundColor Green
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Linting failed. Fix errors before deploying." -ForegroundColor Red
        exit 1
    }
    Write-Host "SUCCESS: Linting passed" -ForegroundColor Green
}

# Build the project (unless skipped)
if (-not $SkipBuild) {
    Write-Host "`nBuilding project..." -ForegroundColor Green
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "SUCCESS: Build successful" -ForegroundColor Green
}

# Check Firebase CLI
if (Test-Command "firebase") {
    Write-Host "SUCCESS: Firebase CLI is available" -ForegroundColor Green
    Write-Host "`nFirebase deployment options:" -ForegroundColor Cyan
    Write-Host "  firebase deploy --only firestore:rules"
    Write-Host "  firebase deploy --only storage"
    Write-Host "  firebase deploy --only functions"
    Write-Host "  firebase deploy"
} else {
    Write-Host "WARNING: Firebase CLI not found. Install with: npm install -g firebase-tools" -ForegroundColor Yellow
}

# Platform-specific deployment
Write-Host "`nDeployment platform: $Platform" -ForegroundColor Cyan

switch ($Platform.ToLower()) {
    "vercel" {
        if (Test-Command "vercel") {
            Write-Host "SUCCESS: Vercel CLI is available" -ForegroundColor Green
            Write-Host "`nTo deploy to Vercel, run:" -ForegroundColor Cyan
            Write-Host "  vercel --prod" -ForegroundColor White
        } else {
            Write-Host "WARNING: Vercel CLI not found. Install with: npm install -g vercel" -ForegroundColor Yellow
        }
    }
    "netlify" {
        if (Test-Command "netlify") {
            Write-Host "SUCCESS: Netlify CLI is available" -ForegroundColor Green
            Write-Host "`nTo deploy to Netlify, run:" -ForegroundColor Cyan
            Write-Host "  netlify deploy --prod" -ForegroundColor White
        } else {
            Write-Host "WARNING: Netlify CLI not found. Install with: npm install -g netlify-cli" -ForegroundColor Yellow
        }
    }
    default {
        Write-Host "ERROR: Unsupported platform: $Platform" -ForegroundColor Red
        Write-Host "Supported platforms: vercel, netlify" -ForegroundColor Yellow
    }
}

# Environment variables check
Write-Host "`nEnvironment Variables Check:" -ForegroundColor Cyan
$requiredEnvVars = @(
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN", 
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
    "VITE_GEMINI_API_KEY"
)

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    foreach ($envVar in $requiredEnvVars) {
        $found = $envContent | Where-Object { $_ -match "^$envVar=" }
        if ($found) {
            Write-Host "SUCCESS: $envVar is set" -ForegroundColor Green
        } else {
            Write-Host "ERROR: $envVar is missing" -ForegroundColor Red
        }
    }
}

# Display final information
Write-Host "`nPre-deployment checklist:" -ForegroundColor Cyan
Write-Host "  [ ] Firebase project created and configured" -ForegroundColor White
Write-Host "  [ ] Environment variables set in hosting platform" -ForegroundColor White
Write-Host "  [ ] Custom domain configured (optional)" -ForegroundColor White
Write-Host "  [ ] Firebase Auth domains updated for production" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Review the DEPLOYMENT_CHECKLIST.md file" -ForegroundColor White
Write-Host "  2. Set up your hosting platform (Vercel/Netlify)" -ForegroundColor White
Write-Host "  3. Configure environment variables in your hosting platform" -ForegroundColor White
Write-Host "  4. Deploy using the appropriate CLI command" -ForegroundColor White
Write-Host "  5. Run comprehensive tests on the deployed application" -ForegroundColor White

Write-Host "`nDeployment preparation complete!" -ForegroundColor Green
Write-Host "For detailed deployment steps, see: DEPLOYMENT_CHECKLIST.md" -ForegroundColor Cyan
